'use strict';

const fs = require('fs'),
    _ = require('lodash'),
    path = require('path'),
    config = require('../config');

module.exports = (onData, onError, onEnd) => {
    onData = onData || ((d) => {});
    onError = onError || ((e) => {});
    onEnd = onEnd || (() => {});

    fs.readdir(
        path.join(__dirname, '../', config.paths.blobs), 
        (err, files) => {
            if(err) {
                return onError(err);
            }
            onData(files.filter((file) => { return file.indexOf('.dump') > -1; }));
            return onEnd();
        }
    );

};