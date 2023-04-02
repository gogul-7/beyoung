const Coupon = require("../models/coupon");
const moment = require("moment");
module.exports={
    getAllCoupons : ()=>{
    return new Promise(async(resolve,reject)=>{
        let currentDate = new Date()
       
        await Coupon.find().then(async(couponData)=>{
            for(let data of couponData){
                
                if(data.valid_till <= currentDate){
                    await Coupon.findByIdAndUpdate(data._id,
                        {
                            $set:{
                                "status":false,
                                "isExpired":true,
                            }
                        })
                    data.status=false
                    data.isExpired=true

                }
                else if(data.valid_till >= currentDate){
                    await Coupon.findByIdAndUpdate(data._id,
                        {
                            $set:{
                                
                                "isExpired":false,
                            }
                        })
                   
                    data.isExpired=false
                }
                data.validfrom=data.valid_from.toLocaleDateString()
                data.validtill=data.valid_till.toLocaleDateString()
            }
            
            resolve(couponData)
        }).catch((err)=>{
            reject(err)
        })
    })
},

enableCoupon: (couponId) => {
    return new Promise(async(resolve, reject) => {
        try {
            await Coupon.findByIdAndUpdate(couponId,
                {
                    $set: { "status": true }
                }).then(() => {
                    resolve()
                }).catch((err) => {
                    reject(err)
                })
        } catch (err) {
            reject(err)
        }
    })

},

disableCoupon: (couponId) => {
    return new Promise(async(resolve, reject) => {
        try {
            await Coupon.findByIdAndUpdate(couponId, 
            {
                $set: { "status": false }
            }).then((data) => {
                resolve()
            }).catch((err) => {
                reject(err)
            })
        } catch (err) {
            reject(err)
        }
    })

},

createCoupon : (couponData)=>{
    return new Promise(async (resolve,reject)=>{
        const { coupon_code, amount_off, minimum_purchase } = couponData
        let couponCheck = await Coupon.findOne({ "coupon_code": coupon_code })
        if (couponCheck) {
            reject("Coupon code already exist")
        } else {
           
            const coupon = new Coupon(couponData)
            await coupon.save().then((data)=>{
                 resolve(data)   
            }).catch((err)=>{
                reject(err)
            })
        }

    })
},

editCoupon : (couponData,couponId)=>{
    return new Promise(async (resolve, reject) => {
       
           
            let couponCheck = await Coupon.findOne({ _id: { $ne: couponId }, "coupon_code": couponData.coupon_code })
            if (couponCheck) {
                let err = 'Coupon code already exist'
                reject(err)
            } else {
                await Coupon.findByIdAndUpdate(couponId,couponData).then(() => {
                        resolve()
                    }).catch((err) => {
                        err = "something went wrong"
                        reject(err)
                    })
                }
    })
},

deleteCoupon: (couponId) => {
    return new Promise(async(resolve, reject) => {
        try {
            await Coupon.findByIdAndDelete(couponId).then((data) => {
                resolve()
            }).catch((err) => {
                reject(err)
            })
        } catch (err) {
            reject(err)
        }
    })
},
getCoupons: () => {
    return new Promise(async(resolve, reject) => {
        try {
            let currentDate =new Date()
           await Coupon.find().then(async(couponData) => {
                for (let data of couponData) {
                    if (data.valid_till <= currentDate) {
                        await Coupon.findByIdAndUpdate(data._id,
                            {
                                $set: {
                                    "status": false,
                                    "isExpired": true
                                }
                            })
                    }
                }
               await Coupon.find({ status: true }).then((coupons) => {
                    resolve(coupons)
                }).catch((err) => {
                    reject(err)
                })
            }).catch((err) => { reject(err) })
        } catch (err) {
            reject(err)
        }
    })
},
getCouponDetails : (couponCode)=>{
    return new Promise(async (resolve,reject)=>{
         await Coupon.findOne({coupon_code:couponCode,status:true,isExpired:false}).then((response)=>{
            resolve(response)
         })
    })
},
couponOncedUsed :(userId,couponId)=>{
    return new Promise(async (resolve,reject)=>{
        await Coupon.findByIdAndUpdate(couponId,
            {
                $addToSet: { users: userId} 
            }).then((response)=>{
           resolve(response)
        })
   })
},
}