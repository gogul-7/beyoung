const mongoose = require('mongoose');

var Schema = mongoose.Schema
ObjectId = Schema.ObjectId;
const orderSchema = new mongoose.Schema({
    user_id:ObjectId,
    products:Array,
    payment_mode:String,
    address:Object,
    placedDate:Date,
    total:Number,
    discount:Number,
    coupon_discount:Number
})
module.exports = mongoose.model('Order', orderSchema)