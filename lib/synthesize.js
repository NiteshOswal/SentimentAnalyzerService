'use strict';

let fs = require('fs'),
    path = require('path'),
    readline = require('readline'),
    helpers = require('./helpers'),
    config = require('../config');

module.exports = (topic, onData, onError, onEnd) => {
    onData = onData || ((d) => {});
    onError = onError || ((e) => {});
    onEnd = onEnd || ((d) => {});
    let afinData = fs.readFileSync(path.join(__dirname, "../", config.paths.afin), {encoding: "utf-8"}).split("\n"),
        afin = {},
        tokenDump = path.join(__dirname, "../", helpers.tokenDumpName(topic)),
        temp ;
    for (let i = afinData.length - 1; i >= 0; i--) {
        temp = afinData[i].split("\t");
        afin[temp[0]] = parseInt(temp[1]);
    }
    //at this stage we have the weights in our app
    fs.stat(tokenDump, function(err, stat) {
        if(err) {
            return onError(err);
        }
        const tokenDumpRLStream = readline.createInterface({
            input: fs.createReadStream(tokenDump)
        });
        let s_neg_count = 0,
            s_pos_count = 0,
            s_tweet_count = 0;
        tokenDumpRLStream
            .on('line', (tweet) => {
                let s_temp_score = 0;
                s_tweet_count += 1; //tweet count
                let a = JSON.parse(tweet);
                for (let i = a.length - 1; i >= 0; i--) {
                    if('undefined' !== typeof afin[a[i]]) {
                        s_temp_score += afin[a[i]];
                    }
                }
                if(s_temp_score < 0) 
                    s_neg_count += 1;
                else
                    s_pos_count += 1;

            })
            .on('close', () => {
                onEnd({
                    negative_score: s_neg_count,
                    positive_score: s_pos_count,
                    total_lines: s_tweet_count,
                    percentage_score: (s_pos_count*10.0)/(s_tweet_count)
                });
            });
    });
}