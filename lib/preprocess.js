'use strict';

let fs = require('fs'),
    readline = require('readline'),
    path = require('path'),
    _ = require('lodash'),
    emojiStrip = require('emoji-strip'),
    natural = require('natural'),
    tokenizer = new natural.TreebankWordTokenizer(),
    helpers = require('./helpers'),
    config = require('../config');

module.exports = ( topic, onData, onError, onEnd ) => {
    onData = onData || ((d) => {});
    onError = onError || ((e) => {});
    onEnd = onEnd || ((t) => {});
    let dump = path.join(__dirname, "../", helpers.dumpName(topic)),
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
        temp;

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
            path.join(__dirname, "../", helpers.tokenDumpName(topic)),
            {flags: "w"}
        );

        dumpRLStream
        .on('line', (tweet) => {
            onData(tweet);
            let prevLength = tweets.length;
            tweets = _.union(tweets, [tweet]); //union doesn't adds something that has already been added
            let newLength = tweets.length;
            if(prevLength < newLength) { //which is what we want to start processing
                let tempTweet = JSON.parse(tweet),
                    tempTokens = tokenizer.tokenize(
                        emojiStrip(
                            tempTweet.d.toLowerCase()
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
                tokenWriteStream.write(JSON.stringify({tok: _.difference(tempTokens, stopWords)}) + "\n");
            }
        })
        .on('close', () => {
            onEnd(tweets);
        });
    });
}
