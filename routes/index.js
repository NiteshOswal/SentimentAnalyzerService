'use strict';

/**
 * Really basic router which exposes really basic APIs.
 * Things that would be nice to add soon
 * 1. Validation
 * 2. Query param cleanup
 * 3. A better API structure
 *
 */

const path = require('path'),
    express = require('express'),
    async = require('async'),
    mongoose = require('mongoose'),
    base62 = require('base62'),
    cp = require('child_process'),
    router = express.Router(),
    lib = require('../lib'),
    cli = require('../cli'),
    logger = lib.helpers.logger;

require('../lib/models/ratings.model')();
require('../lib/models/views.model')();

const Ratings = mongoose.model('Ratings'),
    Views = mongoose.model('Views');

/* GET home page. */
router.get('/', (req, res, next) => {
    let autosubmit = false; //really hacky way to do what I want to!
    if(req.query.name) {
        autosubmit = true;
    }
    res.render('index', { title: 'Sentiment Analyzer Service', query: req.query, autosubmit: autosubmit});
});
router.get('/politics', (req, res) => {
    res.render('politics', { title: 'Political Status Analyzer' });
});
router.get('/api', (req, res) => {
    /**
     * Gets data from req.query, 2 important keys here
     * topic - The topic to pull for
     * count - The number of tweets to process
     * date - The date of execution
     */
    const worker = cp.fork(path.join(__dirname, "../lib/worker"), [JSON.stringify({topic: req.query.topic, count: req.query.count, date: req.query.date, autosubmit: req.query.autosubmit})]);
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
                    // Ratings.update({_id: data._id}, {slug: slug}, function(err, data) {
                    //     if(err) {
                    //         logger.error("Slug Update Error ", err);
                    //     } else {
                    //         logger.info("Slug Update Success ", data);
                    //     }
                    // });
                    return res.json(Object.assign({}, {status: true, location: req.sas, slug: slug}, temp));
                }
            });
        }
    });
});

router.get('/history', (req, res) => {
    async.series({
        history: (callback) => {
            var flag = false;
            lib.history(
                (data) => {
                    if(flag) return;
                    if(data.length == 0) {
                        logger.info("No blobs downloaded yet");
                        return [];
                    }
                    let fin = [];
                    data.forEach((f, k) => {
                        let temp = f.split("-"),
                            row = [(k+1), temp[0].replace(/-/g, " "), temp[1].replace(".dump", ""), f];
                        fin.push(row);
                    });
                    flag = true;
                    return callback(null, fin);
                },
                (error) => {
                    if(flag) return;
                    logger.error(error);
                    flag = true;
                    return callback(error, []);
                },
                () => {
                    if(flag) return;
                    flag = true;
                    return callback(null, []);
                }
            );
        }
    }, function(err, data) {
        console.log(data);
        res.render('history', {data: data.history, title: "History"});
    })
});

router.get('/flush', (req, res) => {
    cli.flush(req.query.name, req.query.date, () => { //I know I know, this is so bad!
        res.json({status: true});
    });
});

router.get('/ngram', (req, res) => {
    lib.ngram(
        req.query.topic,
        req.query.count,
        (data) => {
            return res.json({status: true, data: data});
        },
        (err) => {
            res.status(500);
            logger.error("Ngram API ", data);
            return res.json({status: true});
        },
        (data) => {
            return res.json({status: true, data: data});
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
