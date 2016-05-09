'use strict';

const path = require('path'),
    lib = require('../lib'),
    logger = lib.helpers.logger,
    history = lib.history,
    config = require('../config');

module.exports = ((callback) => {
    history(
        (data) => {
            if(data.length == 0) {
                logger.info("No blobs downloaded yet");
                return [];
            }
            data.forEach((f, k) => {
                let temp = f.split("-");
                console.log("ID.\tNAME\tLAST UPDATED");
                console.log((k+1) + ".\t" + [temp[0].replace(/-/g, " "), temp[1].replace(".dump", "")].join("\t"))
            });
            return data;
        },
        (error) => {
            logger.error(error);
            callback();
        },
        () => {
            logger.info("*~Fin~*");
            callback();
        }
    );
});