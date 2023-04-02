const mongoose = require('mongoose');
var Schema = mongoose.Schema

ObjectId = Schema.ObjectId;

const ReviewSchema = new mongoose.Schema({
   body:String,
   rating:Number,
   user:ObjectId,
   username:String
})
module.exports = mongoose.model('Review', ReviewSchema)