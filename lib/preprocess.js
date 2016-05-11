'use strict';

let fs = require('fs'),
    readline = require('readline'),
    path = require('path'),
    _ = require('lodash'),
    utf8 = require('utf8'),
    emojiStrip = require('emoji-strip'),
    natural = require('natural'),
    tokenizer = new natural.WordTokenizer(),
    helpers = require('./helpers'),
    config = require('../config');

module.exports = ( topic, date, onData, onError, onEnd ) => {
    onData = onData || ((d) => {});
    onError = onError || ((e) => {});
    onEnd = onEnd || ((t) => {});
    let dump = path.join(__dirname, "../", helpers.dumpName(topic, date)),
        tweets = [],
        tokens = [],
        stopWordsData = fs.readFileSync(
            path.join(__dirname, "../", config.paths.stop_words),
            {encoding: 'utf-8'}
        ),
        slanData = fs.readFileSync(path.join(__dirname, "../", config.paths.slan_words), {encoding: "utf-8"}).split("\n"),
        stopWords = _.union(
            ['rt', 'RT', 'co', 'via','0','r','amp',"won't","it's",'http','https'],
            stopWordsData.split("\n")
        ),
        slan = {},
        slanKeys,
        temp,
        regexes = [
            "(?:@[\w_]+)",
            "(http[s]?:\/(?:[a-z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-f][0-9a-f]))+)",
            "\\b(ht?t?p?s?)\\b" //can I be any more greedy
        ];

    for(let j = slanData.length - 1; j >= 0; j--) {
        temp = slanData[j].split("-");
        slan[temp[0].trim()] = temp[1].trim();
    }
    slanKeys = _.keys(slan);

    fs.stat(dump , (err, stats) => {
        if(err) {
            return onError(err);
        } //so we're sure it exists, it has to be readable, we're making that assumption
        const dumpRLStream = readline.createInterface({
            input: fs.createReadStream(dump)
        }), tokenWriteStream = fs.createWriteStream(
            path.join(__dirname, "../", helpers.tokenDumpName(topic, date)),
            {flags: "w"}
        );

        dumpRLStream
        .on('line', (tweet) => {
            onData(tweet);
            let prevLength = tweets.length,
                tempTweet = JSON.parse(tweet);
            tweets = _.union(tweets, [tempTweet.d]); //union doesn't adds something that has already been added
            let newLength = tweets.length;

            if(prevLength < newLength) { //which is what we want to start processing
                tempTweet.d = _.replace(tempTweet.d, new RegExp(regexes.join('|'), "gi"),'');
                let tempTokens = tokenizer.tokenize(
                        emojiStrip(
                            utf8.encode(tempTweet.d.toLowerCase())
                        )
                    ),
                    tempIntersection = _.intersection(tempTokens, slanKeys);
                if(tempIntersection.length > 0) {
                    tempTweet.d = tempTokens.join(" ");
                    for (let i = tempIntersection.length - 1; i >= 0; i--) {
                        tempTweet.d = tempTweet.d.replace(
                            tempIntersection[i],
                            slan[tempIntersection[i]]
                        )
                    }
                    tempTokens = tempTweet.d.split(" ");
                }
                tokenWriteStream.write(JSON.stringify({tok: _.difference(tempTokens, stopWords), t: tempTweet.t}) + "\n");
            }
        })
        .on('close', () => {
            onEnd(tweets);
        });
    });
}
