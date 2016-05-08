'use strict';
const async = require('async'),
    path = require('path'),
    cli = require('../cli'),
    lib = require('../lib'),
    logger = lib.helpers.logger,
    config = require('../config');

const payload = JSON.parse(process.argv[2]),
    defaultCallback = ((cb, task) => { 
        return (() => {
            logger.info(task , " ", payload, " Ended");
            cb(null, []);
        });
    });

async.series({
    collect: (cb) => {
        logger.info("Collect ", payload, " Started");
        cli.collect(payload.topic, parseInt(payload.count), defaultCallback(cb, "Collect"));
    },
    preprocess: (cb) => {
        logger.info("Preprocess ", payload, " Started");
        cli.preprocess(payload.topic, defaultCallback(cb, "Preprocess"));

    },
    synthesize: (cb) => {
        logger.info("Synthesize ", payload, " Started");
        cli.synthesize(payload.topic, defaultCallback(cb, "Synthesize"));
    }
}, function(err, data) {
    if(err) {
        logger.error("Final ", payload, " Ended Unsuccessfully");
    }
    logger.info("Final ", payload, " Ended Successfully");
    process.send("exit");
});


process.on("message", (m) => {
    if(m == "exit") {
        process.exit();
    }
});
