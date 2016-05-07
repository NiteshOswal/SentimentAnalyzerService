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

module.exports = ( topic, count, onData, onError, onEnd ) => {
    let track;
    onData = onData || ((d) => {});
    onError = onError || ((e) => {});
    onEnd = onEnd || (() => {});
    if(!topic) {
        return onError("No topic passed to search for");
    }
    count = count || config.defaults.collect.count; //should not happen like ever..
    if(Array.isArray(topic)) {
        track = utf8.decode(topic.join(","));
    } else {
        track = utf8.decode(topic);
    }
    let client = new twitter(config.twitter),
        dump = fs.createWriteStream( helpers.dumpName(track), {
            flags: "a+"
        } ),
        // tweetsPerQuery = 0,
        searchFor = {q: topic, count: 0};

    client.stream('statuses/filter', {track: track}, (s) => {
        s.on('data', (t) => {
            if(count == 0) {
                return s.destroy();
            }
            count -= 1;
            dump.write(t.text.replace(/\n/g, " ") + "\n"); // start writing out twitter tweets
            onData(t);
        });
        s.on('error', (e) => {
            onError(e);
        });
        s.on('end', () => {
            dump.end();
            onEnd();
        });
    });
}