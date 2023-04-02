const mongoose = require('mongoose');

var Schema = mongoose.Schema
ObjectId = Schema.ObjectId;
const cartSchema = new mongoose.Schema({
    user_id:ObjectId,
    products:[
        {
            item:ObjectId,
            quantity:Number
        }
    ],
    savedforlater:[
        {
            item:ObjectId,
            quantity:Number
        }
    ],
})
module.exports = mongoose.model('Cart', cartSchema)