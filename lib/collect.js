'use strict';

let fs = require('fs'), 
    twitter = require('twitter'),
    utf8 = require('utf8'),
    helpers = require('./helpers'),
    config = require('../config');

/**
 * The collect module, simply collects data from the streaming API
 * @param  string, array, undefined topic
 */

module.exports = function ( topic, count, onData, onError, onEnd ) {
    let track;
    onData = onData || function(d) {};
    onError = onError || function(e) {};
    onEnd = onEnd || function() {};
    if(!topic) {
        return ;
    }
    count = count || config.defaults.collect.count;
    if(Array.isArray(topic)) {
        track = utf8.decode(topic.join(","));
    } else {
        track = utf8.decode(topic);
    }
    let client = new twitter(config.twitter),
        dump = fs.createWriteStream( helpers.dumpName(track), {
            flags: "a+"
        } );
    client.stream('statuses/filter', {track: track}, function(s) {
        s.on('data', function(t) {
            if(count == 0) {
                return s.destroy();
            }
            count -= 1;
            dump.write(t.text.replace(/\n/g, " ") + "\n"); // start writing out twitter tweets
            onData(t);
        });
        s.on('error', function(e) {
            onError(e);
        });
        s.on('end', function() {
            dump.end();
            onEnd();
        });
    });
}