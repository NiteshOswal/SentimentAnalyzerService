'use strict';

let slug = require('slug'),
    path = require('path'),
    moment = require('moment'),
    config = require('../config'),
    winston = require('winston'),
    logger = new (winston.Logger)({
        transports: [
            new winston.transports.Console(),
            new (winston.transports.File)({filename: path.join(__dirname, "../", config.paths.logs, new Date().toDateString() + ".log")})
        ]
    });

module.exports = {
    dumpName: (s) => {
        return config.paths.blobs + slug(s, {lower: true, replacement: "_"}) + "-" + moment().format('MM.DD.Y') + ".dump";
    },
    metaName: (s) => {
        return config.paths.metas + slug(s, {lower: true, replacement: "_"}) + "-" + moment().format('MM.DD.Y') + ".json";
    },
    tokenDumpName: (s) => {
        return config.paths.tokens + slug(s, {lower: true, replacement: "_"}) + "-" + moment().format('MM.DD.Y') + ".dump";
    },
    logger: logger
}