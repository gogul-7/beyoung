const Order = require("../models/order");
const moment = require("moment");

module.exports = {
monthlyReports: () => {
  return new Promise(async (resolve, reject) => {
      
      let start=new Date(new Date()-1000*60*60*24*30)
      let end = new Date()

      let orderSuccess = await Order.find({ placedDate: { $gte: start, $lte: end }, "products.status": { $nin: ['cancelled','cancelledbyadmin'] } }).sort({ Date: -1, Time: -1 })
      var i;
      for(i=0;i<orderSuccess.length;i++){
          orderSuccess[i].date=moment(orderSuccess[i].date).format('lll')
      }
      
      let orderTotal = await Order.find({ placedDate: { $gte: start, $lte: end } })
      let orderSuccessLength = orderSuccess.length
      let orderTotalLength = orderTotal.length
      let orderFailLength = orderTotalLength - orderSuccessLength
      let total = 0
      let razorpay = 0
      let cod = 0
      let paypal = 0
      let wallet=0
      
      for (let i = 0; i < orderSuccessLength; i++) {
          total = total + orderSuccess[i].total
          if (orderSuccess[i].payment_mode === 'COD') {
              cod++
          } else if (orderSuccess[i].payment_mode === 'paypal') {
              paypal++
          }else if (orderSuccess[i].payment_mode === 'Razorpay') {
              razorpay++
          }
           else {
              wallet++
          }
          
      }

      let productCount=await Order.aggregate([
          {
              $match:{
                 $and:[{"products.status":{$nin:["cancelled",'cancelledbyadmin']}
              },
          { placedDate: { $gte: start, $lte: end }}]

              },
              
          },
          {
              $project:{
                  _id:0,
                  quantity:'$products.quantity'
                  
              }
          },
          {
              $unwind:'$quantity'
          },
          {
              $group: {
                  _id: null,
                  total: { $sum:'$quantity' }
              }
          }
        ])
      


      var data = {
          start: moment(start).format('YYYY/MM/DD'),
          end: moment(end).format('YYYY/MM/DD'),
          totalOrders: orderTotalLength,
          successOrders: orderSuccessLength,
          failOrders: orderFailLength,
          totalSales: total,
          cod: cod,
          paypal: paypal,
          razorpay: razorpay,
          wallet:wallet,
          // discount:discount,
          productCount:productCount[0].total,         
          currentOrders: orderSuccess
      }
      resolve(data)
})



},


dailyReports:()=>{
  return new Promise(async(resolve, reject) => {
      
      let start=new Date(new Date()-1000*60*60*24)

      
      let end = new Date()
      
      
     
      let orderSuccess = await Order.find({ placedDate: { $gte: start, $lte: end }, "products.status": { $nin: ['cancelled','cancelledbyadmin'] } }).sort({ Date: -1, Time: -1 })
      
      let orderTotal = await Order.find({ placedDate: { $gte: start, $lte: end } })
      let orderSuccessLength = orderSuccess.length
      let orderTotalLength = orderTotal.length
      let orderFailLength = orderTotalLength - orderSuccessLength
      let total = 0
      // let discount=0


      let razorpay = 0
      let cod = 0
      let paypal = 0
      let wallet=0
      let productCount=0
      for (let i = 0; i < orderSuccessLength; i++) {
          total = total + orderSuccess[i].total
          if (orderSuccess[i].payment_mode === 'COD') {
              cod++
          } else if (orderSuccess[i].payment_mode === 'paypal') {
              paypal++
          }else if (orderSuccess[i].payment_mode === 'Razorpay') {
              razorpay++
          }
           else {
              wallet++
          }
          //  if (orderSuccess[i].discount) {
          
          //     discount = discount + parseInt(orderSuccess[i].discount)
          //     discount++
          // }
      }

productCount=await Order.aggregate([
          {
              $match:{
                 $and:[{"products.status":{$nin:["cancelled,cancelledbyadmin"]}
              },
          { placedDate: { $gte: start, $lte: end }}]

              },
              
          },
          {
              $project:{
                  _id:0,
                  quantity:'$products.quantity'
                  
              }
          },
          {
              $unwind:'$quantity'
          },
          {
              $group: {
                  _id: null,
                  total: { $sum:'$quantity' }
              }
          }
        ])





      var data = {
          start: moment(start).format('YYYY/MM/DD'),
          end: moment(end).format('YYYY/MM/DD'),
          totalOrders: orderTotalLength,
          successOrders: orderSuccessLength,
          failOrders: orderFailLength,
          totalSales: total,
          cod: cod,
          paypal: paypal,
          razorpay: razorpay,
          wallet:wallet,
          // discount:discount,
          productCount:productCount[0].total,
          averageRevenue:total/productCount[0].total,
          currentOrders: orderSuccess
      }
      resolve(data)
  })
},

weeklyReports:()=>{
  return new Promise(async(resolve, reject) => {
      
      let start=new Date(new Date()-1000*60*60*24*7)

      let end = new Date()
      
     
      let orderSuccess = await Order.find({ placedDate: { $gte: start, $lte: end }, "products.status": { $nin: ['cancelled','cancelledbyadmin'] } }).sort({ Date: -1, Time: -1 })
      let orderTotal = await Order.find({ placedDate: { $gte: start, $lte: end } })
      let orderSuccessLength = orderSuccess.length
      let orderTotalLength = orderTotal.length
      let orderFailLength = orderTotalLength - orderSuccessLength
      let total = 0
      // let discount=0


      let razorpay = 0
      let cod = 0
      let paypal = 0
      let wallet=0
      let productCount=0
      for (let i = 0; i < orderSuccessLength; i++) {
          total = total + orderSuccess[i].total
          if (orderSuccess[i].payment_mode === 'COD') {
              cod++
          } else if (orderSuccess[i].payment_mode === 'paypal') {
              paypal++
          }else if (orderSuccess[i].payment_mode === 'Razorpay') {
              razorpay++
          }
           else {
              wallet++
          }
          //  if (orderSuccess[i].discount) {
          
          //     discount = discount + parseInt(orderSuccess[i].discount)
          //     discount++
          // }
      }



      productCount=await Order.aggregate([
          {
              $match:{
                 $and:[{"products.status":{$nin:["cancelled",'cancelledbyadmin']}
              },
          { placedDate: { $gte: start, $lte: end }}]

              },
              
          },
          {
              $project:{
                  _id:0,
                  quantity:'$products.quantity'
                  
              }
          },
          {
              $unwind:'$quantity'
          },
          {
              $group: {
                  _id: null,
                  total: { $sum:'$quantity' }
              }
          }
        ])





      var data = {
          start: moment(start).format('YYYY/MM/DD'),
          end: moment(end).format('YYYY/MM/DD'),
          totalOrders: orderTotalLength,
          successOrders: orderSuccessLength,
          failOrders: orderFailLength,
          totalSales: total,
          cod: cod,
          paypal: paypal,
          razorpay: razorpay,
          wallet:wallet,
          // discount:discount,
          productCount:productCount[0].total,
          averageRevenue:total/productCount[0].total,
          
          currentOrders: orderSuccess
      }

      resolve(data)
  })
},

yearlyReports:()=>{
  return new Promise(async(resolve, reject) => {
      
      let start=new Date(new Date()-1000*60*60*24*365)

let end = new Date()
      
     
      let orderSuccess = await Order.find({ placedDate: { $gte: start, $lte: end }, "products.status": { $nin: ['cancelled','cancelledbyadmin'] } }).sort({ Date: -1, Time: -1 })
      let orderTotal = await Order.find({ placedDate: { $gte: start, $lte: end } })
      let orderSuccessLength = orderSuccess.length
      let orderTotalLength = orderTotal.length
      let orderFailLength = orderTotalLength - orderSuccessLength
      let total = 0
      // let discount=0


      let razorpay = 0
      let cod = 0
      let paypal = 0
      let wallet=0
      let productCount=0
      for (let i = 0; i < orderSuccessLength; i++) {
          total = total + orderSuccess[i].total
          if (orderSuccess[i].payment_mode === 'COD') {
              cod++
          } else if (orderSuccess[i].payment_mode === 'paypal') {
              paypal++
          }else if (orderSuccess[i].payment_mode === 'Razorpay') {
              razorpay++
          }
           else {
              wallet++
          }
          //  if (orderSuccess[i].discount) {
          
          //     discount = discount + parseInt(orderSuccess[i].discount)
          //     discount++
          // }
      }



      productCount=await Order.aggregate([
          {
              $match:{
                 $and:[{"products.status":{$nin:["cancelled","cancelledbyadmin"]}
              },
          { placedDate: { $gte: start, $lte: end }}]

              },
              
          },
          {
              $project:{
                  _id:0,
                  quantity:'$products.quantity'
                  
              }
          },
          {
              $unwind:'$quantity'
          },
          {
              $group: {
                  _id: null,
                  total: { $sum:'$quantity' }
              }
          }
        ])



      var data = {
          start: moment(start).format('YYYY/MM/DD'),
          end: moment(end).format('YYYY/MM/DD'),
          totalOrders: orderTotalLength,
          successOrders: orderSuccessLength,
          failOrders: orderFailLength,
          totalSales: total,
          cod: cod,
          paypal: paypal,
          razorpay: razorpay,
          wallet:wallet,
          // discount:discount,
          productCount:productCount[0].total,

          averageRevenue:total/productCount[0].total,

          currentOrders: orderSuccess
      }

      resolve(data)
  })
},

getReports : (startDate,endDate) => {
  return new Promise(async (resolve, reject) => {
      let start=new Date(startDate)
      let end = new Date(endDate)      
     
      let orderSuccess = await Order.find({placedDate: { $gte: start, $lte: end }, "products.status": { $nin: ['cancelled','cancelledbyadmin'] } }).sort({ Date: -1, Time: -1 })
      
      let orderTotal = await Order.find({ placedDate: { $gte: start, $lte: end } })
      let orderSuccessLength = orderSuccess.length
      let orderTotalLength = orderTotal.length
      let orderFailLength = orderTotalLength - orderSuccessLength
      let total = 0
      // let discount=0


      let razorpay = 0
      let cod = 0
      let paypal = 0
      let wallet=0
      let productCount=0
      for (let i = 0; i < orderSuccessLength; i++) {
          total = total + orderSuccess[i].total
          if (orderSuccess[i].payment_mode === 'COD') {
              cod++
          } else if (orderSuccess[i].payment_mode === 'paypal') {
              paypal++
          }else if (orderSuccess[i].payment_mode === 'Razorpay') {
              razorpay++
          }
           else {
              wallet++
          }
          //  if (orderSuccess[i].discount) {
          
          //     discount = discount + parseInt(orderSuccess[i].discount)
          //     discount++
          // }
      }



       productCount=await Order.aggregate([
          {
              $match:{
                 $and:[{"products.status":{$nin:["cancelled","cancelledbyadmin"]}
              },
          { placedDate: { $gte: start, $lte: end }}]

              },
              
          },
          {
              $project:{
                  _id:0,
                  quantity:'$products.quantity'
                  
              }
          },
          {
              $unwind:'$quantity'
          },
          {
              $group: {
                  _id: null,
                  total: { $sum:'$quantity' }
              }
          }
        ])      





      var data = {
          start: moment(start).format('YYYY/MM/DD'),
          end: moment(end).format('YYYY/MM/DD'),
          totalOrders: orderTotalLength,
          successOrders: orderSuccessLength,
          failOrders: orderFailLength,
          totalSales: total,
          cod: cod,
          paypal: paypal,
          razorpay: razorpay,
          wallet:wallet,
          // discount:discount,
          productCount:productCount[0].total,
          
         
          currentOrders: orderSuccess
      }
     
      resolve(data)
})
},
}
