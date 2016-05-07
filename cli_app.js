'use strict';

let program = require('vorpal')(),
    modules = require('./cli'),
    def = require('./package.json');

program
    .command('collect <topic> [count]', 'Collect data on a topic from Twitter API and dumps it locally')
    .action(function(args, callback) {
        modules.collect(args.topic, args.count, callback);
    });

program
    .command('preprocess <topic>', 'Preprocess data for visualizations later')
    .action(function(args, callback) {
        modules.preprocess(args.topic, callback);
    })

program
    .command('synthesize <topic>', 'Synthesize topic to find the final rating!')
    .action(function(args, callback) {
        modules.synthesize(args.topic, callback);
    });

program
    .delimiter(def.name + "$")
    .show();