'use strict';

let slug = require('slug'),
    config = require('../config');

module.exports = {
    dumpName: (s) => {
        return config.paths.blobs + slug(s, {lower: true, replacement: "_"}) + ".dump";
    },
    tokenDumpName: (s) => {
        return config.paths.tokens + slug(s, {lower: true, replacement: "_"}) + ".dump";
    }
}