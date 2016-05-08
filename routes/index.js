const path = require('path'),
    express = require('express'),
    async = require('async'),
    base62 = require('base62'),
    cp = require('child_process'),
    router = express.Router(),
    lib = require('../lib');

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});

router.get('/api', (req, res) => {
    /**
     * Gets data from req.query, 2 important keys here
     * topic - The topic to pull for
     * count - The number of tweets to process
     */
    const slug = base62.encode(req.query.topic),
        worker = cp.fork(path.join(__dirname, "../lib/worker"), [JSON.stringify({topic: req.query.topic, count: req.query.count})]);
    
    worker.on("message", (m) => {
        if(m == "exit") {
            worker.send("exit");
        }
    });

    res.send({status: true, location: req.sas, slug: slug});
});

router.get('/:slug', (req, res) => {
    const slug = base62.decode(req.params.slug);
    console.log(req.sas);
    res.json(req.sas);
});

module.exports = router;
