const User = require("../models/user");
const Product = require("../models/product");
const Cart = require("../models/cart");
const Order = require("../models/order");
const Guest = require("../models/guest");
const Razorpay=require('razorpay')
const paypal=require('paypal-rest-sdk')


paypal.configure({
    'mode' : 'sandbox',
    'client_id' : 'AUNXgZ7f0gag3G9M8h-3khXzUt1XD9Bjrqr3_1KjzKi6OZB4_a6l9_tuDs_uOExAijg6Pc_UKrB0Tni1',
    'client_secret' : 'EOYzWu55ztiqZhiLRKNsWQqvQ4gw4OzoeCZu6FvX7_OcQgswRoRU_2PTAQ5k4k9028-QvvXePlbF7YNa'
  });

var instance = new Razorpay({
  key_id: 'rzp_test_uEQM9Ijif03z6w',
  key_secret: '0cpljPQqSyPHh8o83e7ph23V',
});

var ObjectId = require('mongodb').ObjectId




const { remove } = require("../models/user");
const { count } = require("../models/cart");

module.exports = {
    doAddproductsToCart: ((userid, productid) => {
        return new Promise(async (resolve, reject) => {
            let userCart = await Cart.findOne({ user_id: ObjectId(userid) })
            let proObj = {
                item: ObjectId(productid),
                quantity: 1
            }
            if (userCart) {
                let proExist = -1

                proExist = userCart.products.findIndex(products => products.item == productid)

                if (proExist != -1) {
                    await Cart.updateOne({ user_id: ObjectId(userid), 'products.item': ObjectId(productid) },
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }).then(() => {
                            resolve()
                        })
                } else {
                    await Cart.updateOne({ user_id: ObjectId(userid) },
                        {
                            $push: { products: proObj }
                        }
                    ).then((response) => {
                        resolve()
                    })
                }

            }
            else {
                let cartObj = new Cart({
                    user_id: (ObjectId(userid)),
                    products: [proObj]
                })
                await cartObj.save().then((data) => {
                    resolve(data)
                })
            }

            // userhelper.getUserById(userid).then((response) => {
            //     const userdata = response
            //     producthelper.getProductById(productid).then(async (res) => {
            //         let productdata = {
            //             _id: productid,
            //             isadded: true
            //         }

            //         const addtocart = await User.findByIdAndUpdate(userdata.id, { $addToSet: { cart: productdata } }, { new: true })
            //         resolve(addtocart)
            //     })
            // })
        })
    }),
    doAddproductsToCartStock: ((userid, productid,qty) => {
        return new Promise(async (resolve, reject) => {
            let proObj = {
                item: ObjectId(productid),
                quantity: qty
            }
                
                    await Cart.updateOne({ user_id: ObjectId(userid) },
                        {
                            $push: { products: proObj }
                        }
                    ).then((response) => {
                        resolve()
                    })
        })
    }),
   
    doAddproductsToGuestCart: ((userId, productid) => {
        return new Promise(async (resolve, reject) => {
            let guestCart = await Guest.findOne({ user: userId })
            let proObj = {
                item: ObjectId(productid),
                quantity: 1
            }
            if (guestCart) {
                let proExist = -1

                proExist = guestCart.products.findIndex(products => products.item == productid)

                if (proExist != -1) {
                    await Guest.updateOne({ user: userId, 'products.item': ObjectId(productid) },
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }).then(() => {
                            resolve()
                        })
                } else {
                    await Guest.updateOne({ user: userId },
                        {
                            $push: { products: proObj }
                        }
                    ).then((response) => {
                        resolve()
                    })
                }

            }
            else {
                let guestObj = new Guest({
                    user: userId,
                    products: [proObj]
                })
                await guestObj.save().then((data) => {
                    resolve(data)
                })
            }
        })
    }),
    doAddproductsToCartFromSaved: ((userid, productid, qty) => {
        return new Promise(async (resolve, reject) => {
            let userCart = await Cart.findOne({ user_id: ObjectId(userid) })
            let proObj = {
                item: ObjectId(productid),
                quantity: qty
            }

            await Cart.updateOne({ user_id: ObjectId(userid) },
                {
                    $push: { products: proObj }
                }
            ).then((response) => {
                resolve()
            })

        })
    }),
    addToSaveForLater: ((userid, productid, qty) => {

        return new Promise(async (resolve, reject) => {
            let userCart = await Cart.findOne({ user_id: ObjectId(userid) })

            let proObj = {
                item: ObjectId(productid),
                quantity: qty
            }


            await Cart.updateOne({ user_id: ObjectId(userid) },
                {
                    $push: { savedforlater: proObj }
                }
            ).then((response) => {
                resolve()
            })

        })
    }),
    doAddproductsToWishlist: ((userid, productid) => {
        return new Promise(async (resolve, reject) => {

            const productdata = {
                _id: productid
            }
            const addtocart = await User.findByIdAndUpdate(userid, { $addToSet: { wishlist: productdata } }, { new: true })
            resolve(addtocart)

        })
    }),
    doDeleteproductsFromWishlist: ((userid, productid) => {
        return new Promise(async (resolve, reject) => {

            const remove = await User.findByIdAndUpdate(userid, { $pull: { wishlist: { _id: productid } } }, { new: true })
            resolve(remove)


        })
    }),
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {

            let cartItems = await Cart.aggregate([
                {
                    $match: { user_id: ObjectId(userId) }
                },

                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: "products",
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ])

            resolve(cartItems)
        })
    },
    getGuestCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {

            let cartItems = await Guest.aggregate([
                {
                    $match: { user: userId }
                },

                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: "products",
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ])

            resolve(cartItems)
        })
    },
    getSavedForLater: (userId) => {
        return new Promise(async (resolve, reject) => {

            let cartItems = await Cart.aggregate([
                {
                    $match: { user_id: ObjectId(userId) }
                },

                {
                    $unwind: '$savedforlater'
                },
                {
                    $project: {
                        item: '$savedforlater.item',
                        quantity: '$savedforlater.quantity'
                    }
                },
                {
                    $lookup: {
                        from: "products",
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ])

            resolve(cartItems)
        })
    },
    getcartCount: ((userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await Cart.findOne({ user_id: ObjectId(userId) })
            if (cart) {
                let count = cart.products.length
                resolve(count)

            }
            else
                resolve()
        })
    }),
    getWishlistProducts: ((userId) => {
        return new Promise(async (resolve, reject) => {
            let wishListItems = await User.aggregate([

                {
                    $match: { _id: ObjectId(userId) }
                },
                {
                    $project: {
                        wishlist: '$wishlist._id',
                    }
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: "wishlist",
                        foreignField: "_id",
                        as: 'wishlistItems'
                    }
                }
            ])
            resolve(wishListItems)
        })
    }),
    changeProductQuantity: ((details) => {
        return new Promise(async (resolve, reject) => {
            let count = parseInt(details.count)
            let quantity = (parseInt(details.quantity))
            if (count == -1 && quantity == 1) {
                Cart.updateOne({ _id: ObjectId(details.cart) },
                    {

                        $pull: { products: { item: ObjectId(details.product) } }

                    }).then((response) => {
                        resolve({ removeProduct: true })
                    })
            }
            else {
                Cart.updateOne({ _id: ObjectId(details.cart), 'products.item': ObjectId(details.product) },
                    {
                        $inc: { 'products.$.quantity': details.count }
                    }).then((response) => {
                        resolve({ status: true })
                    })
            }
        })
    }),
    guestChangeProductQuantity: ((details) => {
        return new Promise(async (resolve, reject) => {
            let count = parseInt(details.count)
            let quantity = (parseInt(details.quantity))
            if (count == -1 && quantity == 1) {
                Guest.updateOne({ _id: ObjectId(details.cart) },
                    {

                        $pull: { products: { item: ObjectId(details.product) } }

                    }).then((response) => {
                        resolve({ removeProduct: true })
                    })
            }
            else {
                Guest.updateOne({ _id: ObjectId(details.cart), 'products.item': ObjectId(details.product) },
                    {
                        $inc: { 'products.$.quantity': details.count }
                    }).then((response) => {
                        resolve({ status: true })
                    })
            }
        })
    }),
    totalAmount: ((userId) => {
        return new Promise(async (resolve, reject) => {
            let total = await Cart.aggregate([
                {
                    $match: { user_id: ObjectId(userId) }
                },

                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: "products",
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        subTotal: {
                            $sum: {
                                $multiply: [
                                    '$quantity', '$product.price'
                                ]
                            }
                        },
                        totalAmount: {
                            $sum: {
                                $multiply: [
                                    '$quantity', '$product.actualprice'
                                ]
                            }
                        }
                    }
                }
            ])
            resolve(total[0])
        })
    }),
    totalAmountGuest: ((userId) => {
        return new Promise(async (resolve, reject) => {
            let total = await Guest.aggregate([
                {
                    $match: { user: userId }
                },

                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: "products",
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        subTotal: {
                            $sum: {
                                $multiply: [
                                    '$quantity', '$product.price'
                                ]
                            }
                        },
                        totalAmount: {
                            $sum: {
                                $multiply: [
                                    '$quantity', '$product.actualprice'
                                ]
                            }
                        }
                    }
                }
            ])
            resolve(total[0])
        })
    }),
    removeCartItem: ((details) => {
        return new Promise(async (resolve, reject) => {

            Cart.updateOne({ _id: ObjectId(details.cart) },
                {
                    $pull: { products: { item: ObjectId(details.product) } }

                }).then((response) => {
                    resolve(response)
                })
        })
    }),
    removeCartItemStock: ((userId,proId) => {
        return new Promise(async (resolve, reject) => {

            Cart.updateOne({ user_id: ObjectId(userId) },
                {
                    $pull: { products: { item: ObjectId(proId) } }

                }).then((response) => {
                    resolve(response)
                })
        })
    }),
    guestRemoveCartItem: ((details) => {
        return new Promise(async (resolve, reject) => {

            Guest.updateOne({ _id: ObjectId(details.cart) },
                {
                    $pull: { products: { item: ObjectId(details.product) } }

                }).then((response) => {
                    resolve(response)
                })
        })
    }),
    guestRemoveCartItemStock: ((userId,proId) => {
        return new Promise(async (resolve, reject) => {

            Guest.updateOne({ user: userId },
                {
                    $pull: { products: { item: ObjectId(proId) } }

                }).then((response) => {
                    resolve(response)
                })
        })
    }),
    guestExist: ((id) => {
        return new Promise(async (resolve, reject) => {
            let guest = await Guest.findOne({ user: id })
            resolve(guest)
        })
    }),
    putToCart: (product, userId, guestId) => {
        return new Promise(async (resolve, reject) => {
            let [userCart] = await Cart.find({ user_id: ObjectId(userId) })
            if (userCart) {
                for (var i = 0; i < product.length; i++) {
                    await Cart.updateOne({ user_id: userId },
                        {
                            $pull: { savedforlater: { item: ObjectId(product[i].item.toString()) } }

                        })
                    let proExist = userCart.products.findIndex(prod => prod.item == product[i].item.toString())
                    if (proExist != -1) {
                        await Cart.updateOne({ user_id: ObjectId(userId), 'products.item': product[i].item },
                            {
                                $set: { 'products.$.quantity': product[i].quantity }
                            }).then(() => {
                                resolve()
                            })
                    } else {
                        await Cart.updateOne({ user_id: ObjectId(userId) },
                            {
                                $push: { products: product[i] }
                            }
                        ).then((response) => {
                            resolve()
                        })
                    }
                }
            }
            else {
                let cartObj = {
                    user_id: (ObjectId(userId)),
                    products: product
                }

                const cart = new Cart(cartObj)
                await cart.save().then((response) => {
                    resolve()
                })

            }
            // await Guest.findByIdAndDelete(guestId)

        })

    },
    removeSavedItem: ((details) => {
        return new Promise(async (resolve, reject) => {

            Cart.updateOne({ _id: ObjectId(details.cart) },
                {
                    $pull: { savedforlater: { item: ObjectId(details.product) } }

                }).then((response) => {
                    resolve(response)
                })
        })
    }),
    removeSavedItemCart: ((userId, productId) => {
        return new Promise(async (resolve, reject) => {

            Cart.updateOne({ user_id: userId },
                {
                    $pull: { savedforlater: { item: ObjectId(productId) } }

                }).then((response) => {
                    resolve(response)
                })
        })
    }),
    findSavedItem: ((userId, productId) => {
        return new Promise(async (resolve, reject) => {

            Cart.findOne({ user_id: userId, 'savedforlater.item': productId }
            ).then((response) => {
                resolve(response)
            })
        })
    }),
    payUsingWallet: ((userId,total) => {
        return new Promise(async (resolve, reject) => {
            await User.findByIdAndUpdate(userId,{ $inc: { wallet:-total.totalAmount}}).then(()=>{
                resolve()
            })
        })
    }),
    placeOrder: ((userId, products, total, formdetails,coupon) => {
        return new Promise(async (resolve, reject) => {
            const { payment_mode, address } = formdetails
            let user = await User.findById(userId)
            let index = user.address.findIndex(add => add._id == address)
            let deliveryaddress = user.address[index]
            if (payment_mode == 'COD' || 'wallet') {
                productStatus = 'confirmed'
                confirmeddate = new Date()
            }
            else {
                productStatus = 'pending'
                confirmeddate = null
            }
            for (const p of products) {
                p.status = productStatus,
                    p.orderedDate = new Date(),
                    p.confirmedDate = confirmeddate,
                    p.shippedDate = null,
                    p.outfordeliveryDate = null,
                    p.deliveredDate = null,
                    p.deliveryDate = null,
                    p.cancelledDate = null,
                    p.cancelledbyadminDate = null

            }
            let orderObj = {

            }
            orderObj.user_id = userId
            orderObj.products = products
            orderObj.payment_mode = payment_mode
            orderObj.address = deliveryaddress
          
            orderObj.total = total.totalAmount
            orderObj.discount=total.subTotal-total.totalAmount
            orderObj.coupon_discount=coupon
            const currentDate = new Date();
            orderObj.placedDate = currentDate
           
            let order = new Order(orderObj)
            await order.save()
            for (var i = 0; i < products.length; i++)
            {
                await Cart.updateMany({ user_id: userId }, { $pull: { 'products': { 'item': products[i].item } } })
                await Product.updateMany({_id:products[i].item }, {$inc: { stock:-products[i].quantity }})  
            }
            resolve(order._id)
        })
    }),
    viewOrders: ((userId) => {
        return new Promise(async (resolve, reject) => {
            let orders = await Order.find({ user_id: userId })
            resolve(orders)
        })
    }),
    findOrderDetails: ((orderId) => {
        return new Promise(async (resolve, reject) => {
            let orders = await Order.findById(orderId)
            resolve(orders)
        })
    }),
    viewAllOrders: (() => {
        return new Promise(async (resolve, reject) => {
            let orders = await Order.find()
            resolve(orders)
        })
    }),
changeOrderStatus : (details)=>{
        return new Promise(async(resolve,reject)=>{
            if(details.status=="confirmed"){
                
                await Order.updateOne({_id:objectId(details.order),'products.item':objectId(details.product)},
                    {
                        $set:{
                            'products.$.status':details.status,
                            'products.$.confirmedDate':new Date(),
                            'products.$.deliveryDate':new Date(Date.now()+ 1000 /*sec*/ * 60 /*min*/ * 60 /*hour*/ * 24 /*day*/ * 10)
                        }
                    },{new:true}).then((response)=>{
                        resolve(response)
                    })
            }
            else if(details.status=="shipped"){
               
                await Order.updateOne({_id:objectId(details.order),'products.item':objectId(details.product)},
                    {
                        $set:{
                            'products.$.status':details.status,
                            'products.$.shippedDate':new Date(),
                           
                        }
                    },{new:true}).then((response)=>{
                        resolve(response)
                    })
            }
            else if(details.status=="outfordelivery"){
                
                await Order.updateOne({_id:objectId(details.order),'products.item':objectId(details.product)},
                    {
                        $set:{
                            'products.$.status':details.status,
                            'products.$.outfordeliveryDate':new Date(),
                        }
                    },{new:true}).then((response)=>{
                        resolve(response)
                    })
            }else if(details.status=="delivered"){
           
                await Order.updateOne({_id:objectId(details.order),'products.item':objectId(details.product)},
                {
                    $set:{
                        'products.$.status':details.status,
                        'products.$.deliveredDate':new Date(),
                    }
                },{new:true}).then((response)=>{
                    resolve(response)
                })
         }
         else if(details.status=="returnapproved"){
           
            await Order.updateOne({_id:objectId(details.order),'products.item':objectId(details.product)},
            {
                $set:{
                    'products.$.status':details.status,
                    'products.$.returnApprovedDate':new Date(),
                }
            },{new:true}).then((response)=>{
                resolve(response)
            })
     }
     else if(details.status=="returnpickuped"){
           
        await Order.updateOne({_id:objectId(details.order),'products.item':objectId(details.product)},
        {
            $set:{
                'products.$.status':details.status,
                'products.$.returnPickupedDate':new Date(),
            }
        },{new:true}).then((response)=>{
            resolve(response)
        })
 }else if(details.status=="refunddone"){
    let order = await Order.findById(details.order)
    let index = order.products.findIndex(pro => pro.item == details.product)
           
    let proTotal =  (order.products[index].product.sellingprice*order.products[index].quantity)
    await User.findByIdAndUpdate(order.userId,{
        $inc:{
            "wallet":proTotal
        }
    })     
    await Order.updateOne({_id:objectId(details.order),'products.item':objectId(details.product)},
    {
        $set:{
            'products.$.status':details.status,
            'products.$.refundDoneDate':new Date(),
        }
    },{new:true}).then((response)=>{
        resolve(response)
    })
}else if(details.status=="returncancelledbyadmin"){
           
    await Order.updateOne({_id:objectId(details.order),'products.item':objectId(details.product)},
    {
        $set:{

'products.$.status':details.status,
            'products.$.returnCancelledByAdminDate':new Date(),
        }
    },{new:true}).then((response)=>{
        resolve(response)
    })
}

     else{
        // let order = await Order.findById(details.order)
        //    let index = order.products.findIndex(pro => pro.item == details.product)
           
        //    let newTotal = order.totalAmount - (order.products[index].product.sellingprice*order.products[index].quantity)
        await Order.updateOne({_id:objectId(details.order),'products.item':objectId(details.product)},
        {
            $set:{
                'products.$.status':details.status,
                'products.$.cancelledbyadminDate':new Date(),
            }
        },{new:true}).then((response)=>{
            resolve(response)
        })
 }
        })
    
      },
    changeProductOrderStatus: (details) => {
        return new Promise(async (resolve, reject) => {

            if (details.status == "confirmed") {

                await Order.updateOne({ _id: ObjectId(details.order), 'products.item': ObjectId(details.product) },
                    {
                        $set: {
                            'products.$.status': details.status,
                            'products.$.confirmedDate': new Date(),
                            'products.$.deliveryDate': new Date(Date.now() + 1000 /*sec*/ * 60 /*min*/ * 60 /*hour*/ * 24 /*day*/ * 10)
                        }
                    }, { new: true }).then((response) => {
                        resolve(response)
                    })
            }
            else if (details.status == "shipped") {

                await Order.updateOne({ _id: ObjectId(details.order), 'products.item': ObjectId(details.product) },
                    {
                        $set: {
                            'products.$.status': details.status,
                            'products.$.shippedDate': new Date(),

                        }
                    }, { new: true }).then((response) => {
                        resolve(response)
                    })
            }
            else if (details.status == "outfordelivery") {

                await Order.updateOne({ _id: ObjectId(details.order), 'products.item': ObjectId(details.product) },
                    {
                        $set: {
                            'products.$.status': details.status,
                            'products.$.outfordeliveryDate': new Date(),
                        }
                    }, { new: true }).then((response) => {
                        resolve(response)
                    })
            } else if (details.status == "delivered") {

                await Order.updateOne({ _id: ObjectId(details.order), 'products.item': ObjectId(details.product) },
                    {
                        $set: {
                            'products.$.status': details.status,
                            'products.$.deliveredDate': new Date(),
                        }
                    }, { new: true }).then((response) => {
                        resolve(response)
                    })
            } 
            
            
            
            







            else if(details.status=="returnapproved"){
           
                await Order.updateOne({_id:ObjectId(details.order),'products.item':ObjectId(details.product)},
                {
                    $set:{
                        'products.$.status':details.status,
                        'products.$.returnApprovedDate':new Date(),
                    }
                },{new:true}).then((response)=>{
                    resolve(response)
                })
         }
         else if(details.status=="returnpickuped"){
               
            await Order.updateOne({_id:ObjectId(details.order),'products.item':ObjectId(details.product)},
            {
                $set:{
                    'products.$.status':details.status,
                    'products.$.returnPickupedDate':new Date(),
                }
            },{new:true}).then((response)=>{
                resolve(response)
            })
     }else if(details.status=="refunddone"){
        let order = await Order.findById(details.order)
        let index = order.products.findIndex(pro => pro.item == details.product)
               
        let proTotal =  (order.products[index].product.actualprice*order.products[index].quantity)
        await User.findByIdAndUpdate(order.user_id,{
            $inc:{
                "wallet":proTotal
            }
        })     
        await Order.updateOne({_id:ObjectId(details.order),'products.item':ObjectId(details.product)},
        {
            $set:{
                'products.$.status':details.status,
                'products.$.refundDoneDate':new Date(),
            }
        },{new:true}).then((response)=>{
            resolve(response)
        })
    }
    else if(details.status=="returncancelledbyadmin"){
           
        await Order.updateOne({_id:ObjectId(details.order),'products.item':ObjectId(details.product)},
        {
            $set:{
    
    'products.$.status':details.status,
                'products.$.returnCancelledByAdminDate':new Date(),
            }
        },{new:true}).then((response)=>{
            resolve(response)
        })
    }     
    else if(details.status=="returncancelled"){

        await Order.updateOne({_id:ObjectId(details.order),'products.item':ObjectId(details.product)},
        {
            $set:{
                'products.$.status':details.status,
                'products.$.returnCancelledDate':new Date(),
            },
            
        },{new:true}).then((response)=>{
            resolve({returnCancelled:true})
        })
      }
            
            
            
            
            
            
            
            
            
            
            
            
            else if (details.status == "cancelled") {

                await Order.updateOne({ _id: ObjectId(details.order), 'products.item': ObjectId(details.product) },
                    {
                        $set: {
                            'products.$.status': details.status,
                            'products.$.cancelledDate': new Date(),
                        }
                    }, { new: true }).then((response) => {
                        resolve(response)
                    })

                if(details.paymentMode!='COD'){
                   let orders= await Order.findById(ObjectId(details.order))
                   let index=orders.products.findIndex((p)=>p.item==details.product)

                   
                  let price=orders.products[index].quantity*orders.products[index].product.actualprice
                await User.findByIdAndUpdate(details.userId,{ $inc: { wallet: price} })
                }

            }
            else {

                await Order.updateOne({ _id: ObjectId(details.order), 'products.item': ObjectId(details.product) },
                    {
                        $set: {
                            'products.$.status': details.status,
                            'products.$.cancelledbyadminDate': new Date(),
                        }
                    }, { new: true }).then((response) => {
                        resolve(response)
                    })
            }
        })

    },
    changeOrderStatus : (details)=>{
        return new Promise(async(resolve,reject)=>{
          
          if(details.status=="cancelled"){
            // let index = order.products.findIndex(pro => pro.item == details.proId)
            
            // let newTotal = order.totalAmount - (order.products[index].product.sellingprice*order.products[index].quantity)
             await Order.updateOne({_id:ObjectId(details.orderId),'products.item':ObjectId(details.proId)},
             {
                 $set:{
                     'products.$.status':details.status,
                     'products.$.cancelledDate':new Date(),
                    //  totalAmount:newTotal
                 },
                 
             },{new:true}).then((response)=>{
                 resolve({cancelled:true})
             })
      }else if(details.status=="returncancelled"){
      
        await Order.updateOne({_id:ObjectId(details.orderId),'products.item':ObjectId(details.proId)},
        {
            $set:{
                'products.$.status':details.status,
                'products.$.returnCancelledDate':new Date(),
            },
            
        },{new:true}).then((response)=>{
            resolve({returnCancelled:true})
        })
      }
      else{
        await Order.updateOne({_id:ObjectId(details.orderId),'products.item':ObjectId(details.proId)},
        {
            $set:{
                'products.$.status':'returnrequest',
                'products.$.returnRequestDate':new Date(),
                'products.$.returnReason':details.reason,
                'products.$.returnComments':details.comments,
      
            },
            
        },{new:true}).then((response)=>{
            resolve(response)
        })
      }
          
        })
      
      },
    getReveniew: (() => {
        return new Promise(async (resolve, reject) => {

            let total = await Order.aggregate([
                {
                    $match: { "products.status": "delivered" }
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: '$total'
                        }
                    }
                },
                {
                    $project: { total: 1 }
                }
            ])
            resolve(total)
        })
    }),
    deleteGuest: ((id) => {
        return new Promise(async (resolve, reject) => {
            await Guest.deleteOne({ user: id })
            resolve()
        })
    }),
    generateRazorpay: (orderId, totalAmount) => {
        return new Promise((resolve, reject) => {
            instance.orders.create({
                amount: totalAmount * 100,
                currency: "INR",
                receipt: "" + orderId,
                notes: {
                    key1: "value3",
                    key2: "value2"
                }
            }, (err, order) => {
                resolve(order);
            })
        })
    },
    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto')
            let hmac = crypto.createHmac('sha256', '0cpljPQqSyPHh8o83e7ph23V')
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                resolve()
            } else {
                reject()
            }
        })
    },
    changePaymentStatus : (orderId)=>{
        return new Promise(async(resolve,reject)=>{
          await Order.updateOne({_id:orderId,'products.status':'pending'},
            {
              $set:{
                
                'products.$[].status':'confirmed', 
                'products.$[].confirmedDate':new Date(),
                'products.$[].deliveryDate':new Date(Date.now()+ 1000 /*sec*/ * 60 /*min*/ * 60 /*hour*/ * 24 /*day*/ * 10)
              }
            }).then(()=>{
              resolve()
            })
        })
      },
      checkCart:(userId,id)=>{
        return new Promise(async(resolve,reject)=>{  
            const inWishlist=await Cart.findOne({$and:[{user_id:userId},{'products.item':id}]})
            resolve(inWishlist)      
        })
      },
      checkGuestCart:(userId,id)=>{
        return new Promise(async(resolve,reject)=>{  
            const inWishlist=await Guest.findOne({$and:[{user:userId},{'products.item':id}]})
            resolve(inWishlist)      
        })
      }
} 