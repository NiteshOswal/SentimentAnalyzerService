'use strict';

let progress = require('progress'),
    winston = require('winston'),
    vorpal = require('vorpal')(),
    logger = new (winston.Logger)({
        transports: [
            new winston.transports.Console()
        ]
    }),
    collect = require('../lib').collect;

module.exports = function( topic, count, callback ) {
    callback = callback || function() {};
    vorpal.ui.imprint();
    let bar = new progress('Downloading Tweets :bar [:elapseds :percent]', {
        total: count,
        width: 100
    });
    collect(
        topic,
        count,
        function(data) {
            bar.tick()
        },
        function(error) {
            console.error("An error occurred ", error)
        },
        function() {
            console.log("All tweets pulled and saved");
            callback();
        }
    );
};