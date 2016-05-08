'use strict';

let winston = require('winston'),
    vorpal = require('vorpal')(),
    lib = require('../lib'),
    synthesize = lib.synthesize,
    logger = lib.helpers.logger;

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