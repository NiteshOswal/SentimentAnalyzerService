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
            let fin = [];
            console.log("ID.\tNAME\tDOWNLOADED DATE");
            data.forEach((f, k) => {
                let temp = f.split("-"),
                    row = [(k+1), temp[0].replace(/-/g, " "), temp[1].replace(".dump", "")];
                console.log(row.join("\t"));
                fin.push(row);
            });
            return fin;
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