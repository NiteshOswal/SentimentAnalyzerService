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

module.exports = (topic, n, date, onData, onError, onEnd) => {
    onData = onData || ((d) => {});
    onError = onError || ((e) => {});
    onEnd = onEnd || ((t) => {});
    let tokenDump = path.join(__dirname, "../", helpers.tokenDumpName(topic, date)),
        tokens = [];

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
              try {
                  let ngrams = natural.NGrams.ngrams(tokens, n),
                    temp = {};
                  ngrams = ngrams.map(function(v) {
                    return v.join(" ");
                  });

                  ngrams.forEach(function(v) {
                    if('undefined' == typeof temp[v]) {
                      temp[v] = {name: v, count: 0};
                    }
                    temp[v].count += 1;
                  });
                  let all_grams = _.orderBy(_.values(temp), ['count'], ['desc']),
                    top = all_grams.slice(0, config.defaults.ngram.count),
                    others = all_grams.slice(config.defaults.ngram.count, all_grams.length);

                  top.push({name: "Others", count: others.reduce((o, v) => { return o += v.count; }, 0)});

                  onEnd(top);
              } catch(err){
                onError(err);
              }
            })
    });
}
