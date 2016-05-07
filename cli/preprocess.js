'use strict';

let winston = require('winston'),
    logger = new (winston.Logger)({
        transports: [
            new winston.transports.Console()
        ]
    }),
    vorpal = require('vorpal')(),
    preprocess = require('../lib').preprocess;

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