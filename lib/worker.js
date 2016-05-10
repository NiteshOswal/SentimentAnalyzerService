'use strict';
const async = require('async'),
    path = require('path'),
    fs = require('fs'),
    cli = require('../cli'),
    lib = require('../lib'),
    logger = lib.helpers.logger,
    config = require('../config');

const payload = JSON.parse(process.argv[2]),
    defaultCallback = ((cb, task) => {
        return ((d) => {
            if(d) process.send(JSON.stringify(d));
            logger.info(task , " ", payload, " Ended");
            cb(null, []);
        });
    });

async.series({
    collect: (cb) => {
        if(payload.autosubmit) {
            return defaultCallback(cb, "Collect")();
        }
        logger.info("Collect ", payload, " Started");
        cli.collect(payload.topic, parseInt(payload.count), defaultCallback(cb, "Collect"));
    },
    preprocess: (cb) => {
        logger.info("Preprocess ", payload, " Started");
        cli.preprocess(payload.topic, payload.date, defaultCallback(cb, "Preprocess"));

    },
    synthesize: (cb) => {
        logger.info("Synthesize ", payload, " Started");
        cli.synthesize(payload.topic, payload.date, defaultCallback(cb, "Synthesize"));
    }
}, function(err, data) {
    if(err) {
        logger.error("Final ", payload, " Ended Unsuccessfully");
    }
    logger.info("Final ", payload, " Ended Successfully");
    process.send("exit");
});


process.on("message", (m) => {
    if(m === "exit") {
        process.exit();
    }
});
