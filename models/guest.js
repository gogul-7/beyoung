const mongoose = require('mongoose');

var Schema = mongoose.Schema
ObjectId = Schema.ObjectId;
const guestSchema = new mongoose.Schema({
    user:String,
    products:[
        {
            item:ObjectId,
            quantity:Number
        }
    ]
})
module.exports = mongoose.model('Guest', guestSchema)