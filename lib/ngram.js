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
        tokens = [],
        afinData = fs.readFileSync(path.join(__dirname, "../", config.paths.afin), {encoding: "utf-8"}).split("\n"),
        afin = {},
        temp;
    for (let i = afinData.length - 1; i >= 0; i--) {
        temp = afinData[i].split("\t");
        afin[temp[0]] = parseInt(temp[1]);
    }

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
                let ngrams = natural.NGrams.ngrams(tokens, parseInt(n)),
                    temp = {};

                  ngrams = ngrams.map(function(v) {
                    var flag = 1;
                    v.forEach(function(word){
                      if('undefined' !== typeof afin[word])
                        flag = 0;
                    });
                    if(!flag){
                      return v.join(" ");
                    }
                  });

                  ngrams.forEach(function(v) {
                    if('undefined' !== typeof v){
                      if('undefined' == typeof temp[v]) {
                        temp[v] = {name: v, count: 0};
                      }
                      temp[v].count += 1;
                    }
                  });

                  let all_grams = _.orderBy(_.values(temp), ['count'], ['desc']);

                  var top = [];
                  var master = all_grams[0],
                      slave = all_grams[1],
                      master_index = 0,
                      slave_index = 1,
                      i = 0;

                  while(i<5){
                    var dist = parseInt(natural.JaroWinklerDistance(master.name, slave.name)*100);
                    if(dist >= 50){
                      master.count += parseInt(slave.count);
                      slave_index++;
                      slave = all_grams[slave_index];
                      if('undefined' === typeof slave){
                        top.push(master);
                        break;
                      }
                    }else{
                      top.push(master);
                      master = slave;
                      master_index = slave_index;
                      slave_index++;
                      slave = all_grams[slave_index];
                      i++;
                      if('undefined' === typeof slave){
                        break;
                      }
                    }
                  }
                  var others = all_grams.slice(master_index, all_grams.length);
                  top.push({name: "Others", count: others.reduce((o, v) => { return o += v.count; }, 0)});

                  onEnd(top);
              } catch(err){
                onError(err);
              }
            })
    });
}
