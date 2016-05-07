'use strict';

let winston = require('winston'),
    logger = new (winston.Logger)({
        transports: [
            new winston.transports.Console()
        ]
    }),
    vorpal = require('vorpal')(),
    synthesize = require('../lib').synthesize;

module.exports = (topic, callback) => {
    callback = callback || () => {};
    synthesize(
        topic,
        (d) => {

        },
        (e) => {
            logger.error(e);
            callback();
        },
        (d) => {
            logger.info("All synthesized");
            logger.info("Processed Data ", d);
            callback();
        }
    );
}