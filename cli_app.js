'use strict';

let program = require('vorpal')(),
    modules = require('./cli'),
    def = require('./package.json');

program
    .command('collect <topic> <count>', 'Collect data on a topic from Twitter API and dumps it locally')
    .action(function(args, callback) {
        modules.collect(args.topic, args.count, callback);
    });

program
    .delimiter(def.name + "$")
    .show();