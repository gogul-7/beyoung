const mongoose = require('mongoose');
var Schema = mongoose.Schema
ObjectId = Schema.ObjectId;
const BannerSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    category: {
        type: ObjectId,
    },

    description: {
        type: String,
    },

    image:
    {
        url: String,
        filename: String
    }


})
module.exports = mongoose.model('Banner', BannerSchema)

