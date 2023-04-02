const mongoose = require('mongoose');
const Category = require("../models/category");

var Schema = mongoose.Schema
ObjectId = Schema.ObjectId;
const productSchema = new mongoose.Schema({
    productname: {
        type: String,
    },
    category: {
        type: ObjectId,
    },
    categoryname: {
        type: String,
    },
    brand: {
        type: String,
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
    },
    discount: {
        type: Number,
    },
    actualprice: {
        type: Number
    },
    specification: {
        type: String
    },
    services: {
        type: String
    },
    stock: {
        type: Number
    },
    images: [
        {
            url: String,
            filename: String
        }
    ],
    reviews:[
        {
            type:ObjectId,
            ref:'Review'
        }
    ]

})
// productSchema.virtual('actualprice').get(function(){
//     return `${this.price}* ${this.services}`
// })
module.exports = mongoose.model('Product', productSchema)