const mongoose = require('mongoose');
const brandSchema = new mongoose.Schema({
    name: {
        type: String,
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
module.exports = mongoose.model('Brand', brandSchema)