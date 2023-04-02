const bcrypt = require("bcrypt");
const { response } = require("../app");
const { userprofile } = require("../controllers/usercontrollers");
const { findByIdAndUpdate } = require("../models/product");
const user = require("../models/user");
const User = require("../models/user");
const Order = require("../models/order");

const { cloudinary } = require('../cloudinary')


let referralCodeGenerator = require('referral-code-generator')

module.exports = {
  getAllusers: () => {
    return new Promise(async (resolve, reject) => {
      const users = await User.find().then((data) => {
        resolve(data);
      })
    });
  },
  getUserById: (id) => {
    return new Promise(async (resolve, reject) => {
      const user = await User.findById(id).then((data) => {
        resolve(data);
      })

    });
  },
  getUserByphno: (phno) => {
    return new Promise(async (resolve, reject) => {
      const user = await User.findOne({ phoneno: phno }).then((data) => {
        resolve(data);
      })

    });
  },
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      let { firstname, lastname, email, phoneno, password,referral} = userData;
      
      userData.referralCode=referralCodeGenerator.custom('lowercase', 3, 6, firstname);
      
      const userexist = await User.findOne({ email });
      const useriexist = await User.findOne({ phoneno });
      if (userexist || useriexist) {
        resolve();
      }
      else {
        if(referral){
          const validReferral = await User.findOne({ referralCode:referral });
         if(validReferral){
         userData.wallet=49
              await User.findByIdAndUpdate(validReferral._id,{ $inc: { wallet: 199,referredCount:1} })
         }
         else
             reject(validReferral)
          }
        userData.password = await bcrypt.hash(password, 10);
        const user = new User(userData);
        await user.save().then((data) => {
          resolve(data);
        });
      }
    });
  },
  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      const { email, password } = userData;
      const user = await User.findOne({ email });
      if (user === null) {
        resolve()
      }
      else {
        bcrypt.compare(password, user.password).then((data) => {
          if (data)
            resolve(user)
          else
            resolve()
        })
      }
    })
  },
  doBlock: (id) => {
    return new Promise(async (resolve, reject) => {
      const user = await User.findById(id)
      if (user.isblocked) {
        const userb = await User.findByIdAndUpdate(id, { isblocked: false }, { new: true })
        resolve(userb)
      }
      else {
        const userb = await User.findByIdAndUpdate(id, { isblocked: true }, { new: true })
        resolve(userb)
      }
    })
  },
  doadminLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let admin = {
        email: "admin@gmail.com",
        password: 123
      }
      const { email, password } = userData;
      if (email === admin.email && password == admin.password) {
        resolve(admin)
      }
      else {
        resolve(false)

      }
    })
  },
  getcartproducts: () => {
    return new Promise(async (resolve, reject) => {
      const cartdetails=await User.aggregate([
        { $project : {
            cart : 1            
        }},
        { $unwind : "$cart" }
      ]
    );
    resolve(cartdetails)
    });
  },
  addAddress: (userid,address) => {
    return new Promise(async (resolve, reject) => {
      const addaddress = await User.findByIdAndUpdate(userid, { $addToSet: { address: address } }, { new: true })
      resolve(addaddress)
    });
  },
  deleteAddress:(userid,addressid) => {
    return new Promise(async (resolve, reject) => {
      const deleteaddress = await User.findByIdAndUpdate(userid, { $pull: { address: {_id:addressid} } }, { new: true })
      resolve(deleteaddress)
    });
  },
  findaddressbyid:(id)=>{
    return new Promise(async (resolve, reject) => {
      const user=await User.findOne({address:{$elemMatch:{_id:id}}})
      let addressIndex = user.address.findIndex(add => add._id == id)
      let address=user.address[addressIndex]
     

      // const address=User.aggregate([
      //   {
      //      $match : {
      //          address : {
      //             $elemMatch : {
                     
      //                    pincode : "656412"
                     
      //             }
      //          },
      //      }
      //   },
      //   {
      //      $project : {
               
      //          address : {
      //             $filter : {
      //                input : "$address",
      //                as : "address",
      //                cond : {
                        
      //                      $eq : [ "$address.pincode", "656412" ] 
                           
                        
      //                }
      //             }
      //          }
      //      }
      //   }
      //   
      resolve(address)
    });
  },
  editaddress:(userid,id,address) => {
    return new Promise(async (resolve, reject) => {
      const editaddress = await User.updateOne({_id:userid,'address._id':id},{$set:{'address.$':address}})
      resolve(editaddress)
    });
  },
  checkpassword:(password,currentpassword)=>{  
    return new Promise(async (resolve, reject) => {
        bcrypt.compare(password, currentpassword).then((data) => {
          if (data)
            resolve(data)
          else
            resolve()
        })   
      });
    },
  changepassword:(id,password)=>{
    return new Promise(async(resolve,reject)=>{
      password = await bcrypt.hash(password, 10);
      const changepassword=await User.findByIdAndUpdate(id,{password:password}).then((response)=>{
        if(response)
        resolve(true)
      })
    })
  },
  editprofile:(id,userdata)=>{
    return new Promise(async(resolve,reject)=>{  
        const updateprofile=await User.findByIdAndUpdate(id,userdata)
        resolve(updateprofile)      
    })
  },
  confirmDeactivation: (userData,user) => {
    return new Promise(async (resolve, reject) => {
      const { email, password } = userData;
      if (user.email!=email) {
        resolve()
      } 
      else {
        bcrypt.compare(password, user.password).then((data) => {
          if (data)
            resolve(user)
          else
            resolve()
        })
      } 
    })
  },
  deleteuser:(id)=>{
    return new Promise(async(resolve,reject)=>{  
        const deleteuser=await User.findByIdAndDelete(id)
        if(deleteuser.dp.filename)
        cloudinary.uploader.destroy(deleteuser.dp.filename)
        resolve(deleteuser)      
    })
  },
  checkWishlist:(userId,id)=>{
    return new Promise(async(resolve,reject)=>{  
        const inWishlist=await User.findOne({$and:[{_id:userId},{'wishlist._id':id}]})
        resolve(inWishlist)      
    })
  },
  allInWishlist:(user,products)=>{
    return new Promise(async(resolve,reject)=>{  
        for(let item of user.wishlist){
          let index=products.findIndex(pro=>pro._id==item._id.toString())
          if(index!=-1)
          products[index].inWishlist=true
        }
        resolve()      
    })
  },
  updateProfilePicture: (id, dp) => {
    return new Promise(async (resolve, reject) => {
            const user=await User.findById(id)
            if(user.dp.filename)
            await cloudinary.uploader.destroy(user.dp.filename)
            const profilePicture = await User.findByIdAndUpdate(id, { dp: { url: dp.path, filename: dp.filename } }, { new: true }).then((data) => {
                resolve(data);
            })
        
    });

},
dailyReport:()=>{
  return new Promise((resolve, reject) =>{
   Order.aggregate([
      {$match:{
         placedDate:{
          //    $gte: new Date(new Date().getDate() -7 )
          $gte: new Date(new Date().getDate()-5)

          //  $gte: new Date(new Date() - 7 * 7 * 60 * 60 * 24 * 1000 )

         }
      }},
  
      {
          $project:{
              year:{$year:'$placedDate'},
              month: { $month: "$placedDate" },
              day: { $dayOfMonth: "$placedDate" },
              dayOfWeek: { $dayOfWeek: "$placedDate" },
              week: { $week: "$placedDate" },
              date:{$toDate:"$placedDate" }
              // date:{$dateToString:{format:"$createdAt"} }
          },
      },
      {
          $group:{
              _id:{day:'$day'},
              count:{$sum:1},
              detail: { $first: '$$ROOT' },
          }
      },
      {
          $sort:({
              _id:-1
          })
      },

      // {"$replaceRoot":{"newRoot":"$detail"}}
      
  ])

  .then((data)=>{resolve(data)})
 
  })
  
},


monthlyReport:()=>{
  return new Promise((resolve, reject) =>{
   Order.aggregate([
     
      {$match:{
         placedDate:{

               $gte: new Date(new Date().getMonth-5)

      }
      }},
  
      {
          $project:{
              year:{$year:'$placedDate'},
              month: { $month: "$placedDate" },
              day: { $dayOfMonth: "$placedDate" },
              dayOfWeek: { $dayOfWeek: "$placedDate" },
              week: { $week: "$placedDate" },
              date:{$toDate:"$placedDate" }
              // date:{$dateToString:{format:"$createdAt"} }
          },
      },
      {
          $group:{
              _id:{month:'$month'},
              count:{$sum:1},
              detail: { $first: '$$ROOT' },
          }
      },
      {
          $sort:({
              _id:1
          })
      },

      // {"$replaceRoot":{"newRoot":"$detail"}}
      
  ]) 

  .then((data)=>{
      resolve(data)})
 
  })
  
},


yearlyReport:()=>{
  return new Promise((resolve, reject) =>{
  Order.aggregate([
      {$match:{
          placedDate:{
             $gte: new Date(new Date().getFullYear -5)
         }
      }},
  
      {
          $project:{
              year:{$year:'$placedDate'},
              month: { $month: "$placedDate" },
              day: { $dayOfMonth: "$placedDate" },
              dayOfWeek: { $dayOfWeek: "$placedDate" },
              week: { $week: "$placedDate" },
              date:{$toDate:"$placedDate" }
              // date:{$dateToString:{format:"$createdAt"} }
          },
      },
      {
          $group:{
              _id:{year:'$year'},
              count:{$sum:1},
              detail: { $first: '$$ROOT' },
          }
      },
      {
          $sort:({
              _id:1
          })
      },

      // {"$replaceRoot":{"newRoot":"$detail"}}
      
  ])

  .then((data)=>{resolve(data)})
 
  })
  
},
  
};