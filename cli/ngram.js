'use strict';

let winston = require('winston'),
    vorpal = require('vorpal')(),
    lib = require('../lib'),
    ngram = lib.ngram,
    logger = lib.helpers.logger;

module.exports = (topic, n, date, callback) => {
  callback = callback || () => {};
  ngram(
    topic,
    n,
    date,
    (d) => {

    },
    (e) => {
      logger.error(e);
      callback([]);
    },
    (d) => {
      logger.info("Ngrams ",{topic: topic, n:n}, "Finished");
      logger.info("Processed Data", d);
      callback(d);
    }
  );
}
