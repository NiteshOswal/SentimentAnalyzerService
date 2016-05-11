'use strict';

let fs = require('fs'),
    path = require('path'),
    readline = require('readline'),
    moment = require('moment'),
    helpers = require('./helpers'),
    config = require('../config');

module.exports = (topic, date, onData, onError, onEnd) => {
    onData = onData || ((d) => {});
    onError = onError || ((e) => {});
    onEnd = onEnd || ((d) => {});
    let afinData = fs.readFileSync(path.join(__dirname, "../", config.paths.afin), {encoding: "utf-8"}).split("\n"),
        afin = {},
        tempScoreByDate = {},
        tokenDump = path.join(__dirname, "../", helpers.tokenDumpName(topic, date)),
        temp ;
    for (let i = afinData.length - 1; i >= 0; i--) {
        temp = afinData[i].split("\t");
        afin[temp[0]] = parseInt(temp[1]);
    }
    //Blocking part ends but that's needed as well..
    //
    //TODO - Stop reloading data into these hashes everytime
    //
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
                onData(tweet);
                let s_temp_score = 0,
                    t = JSON.parse(tweet);
                s_tweet_count += 1; //total tweet count
                t.d = moment(new Date(t.t)); //moment ftw!
                t.date = t.d.format('L');
                for (let i = t.tok.length - 1; i >= 0; i--) {
                    if('undefined' !== typeof afin[t.tok[i]]) {
                        s_temp_score += afin[t.tok[i]];
                    }
                }

                if('undefined' == typeof tempScoreByDate[t.date]) {
                    tempScoreByDate[t.date] = {total: 0, score: 0, positive: 0, negative: 0};
                }
                tempScoreByDate[t.date].score += s_temp_score;
                tempScoreByDate[t.date].total += 1; //date wise tweet count
                if(s_temp_score < 0) {
                    s_neg_count += 1;
                    tempScoreByDate[t.date].negative += 1;
                } else {
                    s_pos_count += 1;
                    tempScoreByDate[t.date].positive += 1;
                }
            })
            .on('close', () => {
                for(let date in tempScoreByDate) {
                    if(tempScoreByDate[date].total > 0) {
                        tempScoreByDate[date].total_score = tempScoreByDate[date].positive * 10.0 / tempScoreByDate[date].total;
                    }
                }
                onEnd({
                    negative_score: s_neg_count,
                    positive_score: s_pos_count,
                    total_lines: s_tweet_count,
                    total_score: (s_pos_count*10.0)/(s_tweet_count),
                    score_by_date: tempScoreByDate
                });
            });
    });
}
