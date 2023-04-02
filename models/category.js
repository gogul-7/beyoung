const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
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
    },
    offer:{
         discount:Number,
         validFrom:Date,
         validTo:Date
    }

})
module.exports = mongoose.model('Category', categorySchema)