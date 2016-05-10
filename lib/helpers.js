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
    dumpName: (s, date) => {
        try {
            if(!date) {
                date = moment().format('MM.DD.Y');
            } else {
                date = moment(date).format('MM.DD.Y');
            }
        } catch(e) {}
        return config.paths.blobs + slug(s, {lower: true, replacement: "_"}) + "-" + date + ".dump";
    },
    metaName: (s, date) => {
        try {
            if(!date) {
                date = moment().format('MM.DD.Y');
            } else {
                date = moment(date).format('MM.DD.Y');
            }
        } catch(e) {}
        return config.paths.metas + slug(s, {lower: true, replacement: "_"}) + "-" + date + ".json";
    },
    tokenDumpName: (s, date) => {
        try {
            if(!date) {
                date = moment().format('MM.DD.Y');
            } else {
                date = moment(date).format('MM.DD.Y');
            }
        } catch(e) {}
        return config.paths.tokens + slug(s, {lower: true, replacement: "_"}) + "-" + date + ".dump";
    },
    logger: logger
}