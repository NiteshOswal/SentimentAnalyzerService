'use strict';

const rimraf = require('rimraf'),
    path = require('path'),
    async = require('async'),
    lib = require('../lib'),
    logger = lib.helpers.logger,
    config = require('../config');

module.exports = (name, callback) => {
    let blobPath = config.paths.blobs + "*",
        tokenPath = config.paths.tokens + "*",
        metaPath = config.paths.metas + "*";
    if(!!name) {
        blobPath = path.join(__dirname, "../", lib.helpers.dumpName(name) );
        tokenPath = path.join(__dirname, "../", lib.helpers.tokenDumpName(name) );
        metaPath = path.join(__dirname, "../", lib.helpers.metaName(name) );
    }
    return async.parallel({
        flushBlob: (cb) => {
            rimraf(blobPath, function() {
                cb(null, "Flushed blob(s)");
            });
        },
        flushTokens: (cb) => {
            rimraf(tokenPath, function() {
                cb(null, "Flushed token(s)");
            });
        },
        flushMetas: (cb) => {
            rimraf(metaPath, function() {
                cb(null, "Flushed Meta(s)");
            });
        }
    }, function(err, data) {
        if(err) {
            logger.error(err);
        } else {
            logger.info(data);
        }
        callback();
    });

    //too lazy to write different messages for individual files -_-
}