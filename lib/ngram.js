'use strict';

let fs = require('fs'),
    readline = require('readline'),
    path = require('path'),
    _ = require('lodash'),
    emojiStrip = require('emoji-strip'),
    natural = require('natural'),
    tokenizer = new natural.WordTokenizer(),
    helpers = require('./helpers'),
    config = require('../config');

module.exports = (topic, n, onData, onError, onEnd) => {
    onData = onData || ((d) => {});
    onError = onError || ((e) => {});
    onEnd = onEnd || ((t) => {});
    let tokenDump = path.join(__dirname, "../", helpers.tokenDumpName(topic)),
        tokens = [],
        NGrams = natural.NGrams;

    fs.stat(tokenDump, function(err, stat) {
        if (err) {
            return onError(err);
        }
        const tokenDumpRLStream = readline.createInterface({
            input: fs.createReadStream(tokenDump)
        });

        tokenDumpRLStream
            .on('line', (tweet) => {
              let t = JSON.parse(tweet);
              tokens = tokens.concat(t.tok);
            })
            .on('close', () => {
              try{
                  var temp = NGrams.ngrams(tokens, n);
                  var di = []; //ye wala array sort kr k top 5 terms nikalni h
                  temp.forEach(function(value){
                    di = di.concat(_.join(value," "));
                  });
                  var w_count = collection.Counter(di);
                  console.log("after counter");
                  onEnd(w_count.mostCommon(5));
              }
              catch(err){
                onError(err);
              }
            })
    });
}
