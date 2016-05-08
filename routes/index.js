const path = require('path'),
    express = require('express'),
    async = require('async'),
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
    const worker = cp.fork(path.join(__dirname, "../lib/worker"), [JSON.stringify({topic: req.query.topic, count: req.query.count})]);
    worker.on("message", (m) => {
        if(m == "exit") {
            worker.send("exit");
        }
    });

    res.send({status: true});
});

router.get('/:slug', (req, res) => {

});

module.exports = router;
