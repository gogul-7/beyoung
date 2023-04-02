const mongoose = require('mongoose');
var Schema = mongoose.Schema
ObjectId = Schema.ObjectId;
const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: [true, 'Firstname cannot be blank']
    },
    lastname: {
        type: String,
        // required:[true,'Lastname cannot be blank']
    },
    email: {
        type: String,
        required: [true, 'Email cannot be blank']
    },
    phoneno: {
        type: Number,
        required: [true, 'Email cannot be blank']
    },
    password: {
        type: String,
        required: [true, 'Password cannot be blank']
    },
    isblocked: {
        type: Boolean,
        default: false
    },
    wishlist: [
        {
            _id: ObjectId
        }]
    ,
    address: [
        {
            fullname:String,
            phoneno: Number,    
            pincode: Number,
            locality: String,
            address_line: String,
            city_district_town: String,
            state: String,
            landmark: String,
            alt_phoneno: Number,
            addresstype:String
        }]
    ,
    dp:
    {
        url: String,
        filename: String
    }
    ,
    wallet: {
        type: Number,
        default: 0
    },
    referralCode:String,
    referredCount:Number
})
userSchema.virtual('fullname').get(function () {
    return `${this.firstname} ${this.lastname}`
})


module.exports = mongoose.model('User', userSchema)