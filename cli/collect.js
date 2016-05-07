'use strict';

let progress = require('progress'),
    winston = require('winston'),
    logger = new (winston.Logger)({
        transports: [
            new winston.transports.Console()
        ]
    }),
    _ = require('lodash'),
    collect = require('../lib').collect;

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
            logger.info("All tweets pulled and saved");
            callback();
        }
    );
};