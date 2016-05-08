'use strict';

const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

module.exports = (() => {
    let ViewsSchema = new Schema({
        location: {
            countryCode: String,
            countryName: String,
            region: String,
            city: String,
            postalCode: String,
            latitude: Number,
            longitude: Number,
            dmaCode: Number,
            areaCode: Number,
            metroCode: Number,
            continentCode: String,
            regionName: String
        },
        slug: String,
        created: {type: Date, default: Date.now}
    });
    mongoose.model('Views', ViewsSchema);
});