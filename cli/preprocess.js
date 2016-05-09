'use strict';

let vorpal = require('vorpal')(),
    lib = require('../lib'),
    preprocess = lib.preprocess,
    logger = lib.helpers.logger;

module.exports = ( topic, date, callback ) => {
    callback = callback || () => {};
    preprocess(
        topic,
        date,
        (data) => {},
        (error) => {
            logger.error(error);
            callback();
        },
        (tweets) => {
            logger.info("All processing ends here!");
            logger.info(`Preprocess ${tweets.length} `, {topic: topic}, "Finished");
            callback();
        }
    );
};