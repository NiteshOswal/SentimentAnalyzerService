'use strict';

let fs = require('fs'),
    twitter = require('twitter'),
    utf8 = require('utf8'),
    bluebird = require('bluebird'),
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
    count = count || config.defaults.collect.count; //should not happen, like ever..

    if(Array.isArray(topic)) { // if multiple topics are sent
        track = utf8.decode(topic.join(","));
    } else {
        track = utf8.decode(topic);
    }
    let client = new twitter(config.twitter),
        dump = fs.createWriteStream( helpers.dumpName(track), {
            flags: "w"
        } ),
        initialOptions = {q: topic, count: (count > config.defaults.collect.max_count)? config.defaults.collect.max_count: count};
    /**
     * Twitter Search Async => Sync Stuff
     */
    function TwSearch(options) {
        return new Promise(function(resolve, reject) {
            client.get('search/tweets', options, function(err, tweets) {
                if(err) { reject(err); onError(err); }
                resolve(tweets.statuses);
            });
        });
    }

    function TwHistory(data) {
        //initializations for the next iteration
        if(data.length == 0) {
            count = 0;
        }
        count = count - data.length;
        let options = {q: topic};
        options.count = (count > config.defaults.collect.max_count)? config.defaults.collect.max_count: count;
        if(data.length > 0) {
            options.max_id = data[data.length - 1].id;
            for (let i = 0; i < data.length; i++) {
                dump.write(data[i].text.replace(/\n/g, " ") + "\n");
            }
        }
        onData(data.length);
        if(options.count > 0) {
            TwSearch(options).then(TwHistory);
        } else {
            onEnd();
        }
    }
    //First Search run
    TwSearch(initialOptions)
        .then(TwHistory);

    // Streaming API options...TBD
    // client.stream('statuses/filter', {track: track}, (s) => {
    //     s.on('data', (t) => {
    //         if(count == 0) {
    //             return s.destroy();
    //         }
    //         count -= 1;
    //         dump.write(t.text.replace(/\n/g, " ") + "\n"); // start writing out twitter tweets
    //         onData(t);
    //     });
    //     s.on('error', (e) => {
    //         onError(e);
    //     });
    //     s.on('end', () => {
    //         dump.end();
    //         onEnd();
    //     });
    // });
}
