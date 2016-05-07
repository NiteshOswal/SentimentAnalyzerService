'use strict';

let config = require('../config'),
    slug = require('slug');

module.exports = {
    dumpName: function(s) {
        return config.paths.blobs + slug(s, {lower: true, replacement: "_"}) + ".dump";
    }
}