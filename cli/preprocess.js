'use strict';

let vorpal = require('vorpal')(),
    lib = require('../lib'),
    preprocess = lib.preprocess,
    logger = lib.helpers.logger;

module.exports = ( topic, callback ) => {
    callback = callback || () => {};
    preprocess(
        topic,
        (data) => {},
        (error) => {
            logger.error(error);
            callback();
        },
        (tweets) => {
            logger.info("All processing ends here!");
            logger.info(`Created tokens for ${tweets.length} tweets`);
            callback();
        }
    );
};