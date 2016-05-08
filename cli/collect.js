'use strict';

let progress = require('progress'),
    winston = require('winston'),
    lib = require('../lib'),
    _ = require('lodash'),
    collect = lib.collect,
    logger = lib.helpers.logger;

module.exports = ( topic, count, callback ) => {
    callback = callback || (() => {});
    let bar = new progress('Downloading Tweets :bar [:elapseds :percent]', {
        total: count,
        width: 100
    });
    collect(
        topic,
        count,
        (data) => {
            bar.tick(data);
        },
        (error) => {
            logger.error("An error occurred ", error);
            callback();
        },
        () => {
            logger.info("Collect ", {topic: topic, count: count}, "Finished");
            callback();
        }
    );
};
