'use strict';

let fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    emojiStrip = require('emoji-strip'),
    natural = require('natural'),
    tokenizer = new natural.WordTokenizer(),
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
        stopWords = _.union(
            ['rt', 'RT', 'co', 'via','0','r','abt','amp',"won't","it's",'http','https'], 
            stopWordsData.split("\n")
        );

    fs.stat(dump , (err, stats) => {
        if(err) {
            return onError(err);
        } //so we're sure it exists, it has to be readable, we're making that assumption
        let dumpStream = fs.createReadStream(dump);
        dumpStream
            .on('data', (data) => {
                tweets = _.union(tweets, _.compact(data.toString('utf8').split("\n")));
                onData(data);
            })
            .on('end', () => {
                let tokenWriteStream = fs.createWriteStream(
                    path.join(__dirname, "../", helpers.tokenDumpName(topic)),
                    {flags: "w"}
                );
                tweets = _.uniq(tweets); //just to be safe
                tweets.forEach((tweet) => {
                    let tokens = _.difference(
                        tokenizer.tokenize(
                            emojiStrip(
                                tweet
                            )
                        ),
                        stopWords
                    );
                    tokenWriteStream.write(JSON.stringify(tokens) + "\n");
                });
                onEnd(tweets);
            });
    });
}