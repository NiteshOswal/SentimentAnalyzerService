'use strict';

const path = require('path'),
    express = require('express'),
    async = require('async'),
    mongoose = require('mongoose'),
    base62 = require('base62'),
    cp = require('child_process'),
    router = express.Router(),
    lib = require('../lib'),
    ngram_cli = require('../cli/ngram'),
    logger = lib.helpers.logger;

require('../lib/models/ratings.model')();
require('../lib/models/views.model')();

const Ratings = mongoose.model('Ratings'),
    Views = mongoose.model('Views');

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Sentiment Analyzer Service' });
});
router.get('/politics', (req, res) => {
  res.render('politics', { title: 'Political Status Analyzer' });
});
router.get('/api', (req, res) => {
    /**
     * Gets data from req.query, 2 important keys here
     * topic - The topic to pull for
     * count - The number of tweets to process
     */
    const worker = cp.fork(path.join(__dirname, "../lib/worker"), [JSON.stringify({topic: req.query.topic, count: req.query.count})]);
    let slug = "";
    worker.on("message", (m) => {
        if(m === "exit") {
            worker.send("exit");
        } else {
            let temp = JSON.parse(m); //basically when we get back rating from the place
            Ratings.create(
            {
                negative_score: temp.negative_score,
                positive_score: temp.positive_score,
                total_lines: temp.total_lines,
                total_score: temp.total_score,
                slug: slug,
                topic: req.query.topic,
                count: req.query.count
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            }, function(err, data) {
                if(err) {
                    logger.error("Ratings Save Error ", err);
                    return res.json({status: false, location: req.sas});
                } else {
                    logger.info("Ratings Saved ", data, "Finished");
                    slug = base62.encode(parseInt(data._id));
                    Ratings.update({_id: data._id}, {slug: slug}, function(err, data) {
                        if(err) {
                            logger.error("Slug Update Error ", err);
                        } else {
                            logger.info("Slug Update Success ", data);
                        }
                    });
                    return res.json(Object.assign({}, {status: true, location: req.sas, slug: slug}, temp));
                }
            });
        }
    });
});

router.get('/history', (req, res) => {
    lib.history(
        (data) => {
            res.render('history',{data:data, title: 'History'});
        }
    );
});

router.get('/ngram', (req, res) => {
    ngram_cli(
        req.query.topic,
        req.query.count,
        function(data) {
            return res.json(data);
        }
    );
});

router.get('/:slug', (req, res) => {
    Ratings.aggregate([
        {$match: {slug: req.params.slug}},
        {$sort: {created: -1}},
        {$limit: 1}
    ], function(err, data) {
        if(err) {
            logger.error("Get Slug ", req.params.slug, err);
            return res.render('error', {
              message: "So something happened",
              error: err
            });
        } else {
            if(data.length == 0) {
                return res.json({status: false});
            }
            logger.info("Get Slug ", req.params.slug, data);
            return res.json(Object.assign({status: true}, data[0]));
        }
    });

});

module.exports = router;
