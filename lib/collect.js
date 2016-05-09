'use strict';

let fs = require('fs'),
    twitter = require('twitter'),
    utf8 = require('utf8'),
    path = require('path'),
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

    const dumpName = helpers.dumpName(track),
        metaName = helpers.metaName(track);


    //START
    let checkMetaName = false;
    try {
        checkMetaName = fs.statSync(path.join(__dirname, "../", metaName));
    } catch(e) {
        console.log(e);
    }

    let client = new twitter(config.twitter),
        dump = fs.createWriteStream(dumpName , {
            flags: "a+"
        } ),
        max_id = 0,
        initialOptions = {q: topic, count: (count > config.defaults.collect.max_count)? config.defaults.collect.max_count: count};
    
    if(checkMetaName) {
        let metaData = require("../" + metaName);
        max_id = metaData.max_id;
        initialOptions.max_id = metaData.max_id;  
    }
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
            max_id = options.max_id;
            for (let i = 0; i < data.length; i++) {
                dump.write(JSON.stringify({d: data[i].text.replace(/\n/g, " "), t: data[i].created_at}) + "\n");
            }
        }
        onData(data.length);
        if(options.count > 0) {
            TwSearch(options).then(TwHistory);
        } else {
            fs.writeFileSync(metaName, JSON.stringify({
                max_id: max_id
            }), 'utf8');
            onEnd();
        }
    }
    //First Search run
    TwSearch(initialOptions)
        .then(TwHistory);
    //END
}
