'use strict';

const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

module.exports = (() => {
    let RatingsSchema = new Schema({
        negative_score: {type: Number, default: 0},
        positive_score: {type: Number, default: 0},
        total_lines: {type: Number, default: 0},
        total_score: {type: Number, default: 0},
        slug: {type: String, default: ""},
        topic: {type: String, default: ""},
        count: {type: Number, default: 0},
        created: {type: Date, default: Date.now}
    });
    RatingsSchema.index({slug: 1, created: -1}); //index slug
    mongoose.model('Ratings', RatingsSchema);
});