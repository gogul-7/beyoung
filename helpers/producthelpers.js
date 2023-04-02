const Product = require("../models/product");
const Category = require("../models/category");
const Review = require("../models/review");

const { findByIdAndUpdate } = require("../models/user");
const categoryhelpers = require("./categoryhelpers");

const { cloudinary } = require('../cloudinary')


module.exports = {
  getAllproducts: () => {
    return new Promise(async (resolve, reject) => {
      const product = await Product.find().then((data) => {
        resolve(data);
      })

    });
  },
  getProductById: (id) => {
    return new Promise(async (resolve, reject) => {
      const product = await Product.findById(id).populate('reviews')
      resolve(product)
    });
  },
  getProductByCategory: (category) => {
    return new Promise(async (resolve, reject) => {
      const product = await Product.find({ category }).then((data) => {
        resolve(data);
      }).catch(()=>{
        reject()
      })

    });
  },
  getProductByBrand: (brand) => {
    return new Promise(async (resolve, reject) => {
      const product = await Product.find({ brand }).then((data) => {
        resolve(data);
      })
    });
  },
  doAddproduct: (productData, productImages) => {
    return new Promise(async (resolve, reject) => {
      const product = new Product(productData);
      let category=await categoryhelpers.getCategoryById(product.category)
      product.categoryname=category.name
      product.images = productImages.map(f => ({ url: f.path, filename: f.filename }))
      product.actualprice = Math.floor(productData.price - (productData.price * (productData.discount / 100)))
      await product.save().then((data) => {
        resolve(data);
      });
    });
  },
  doEditproduct: (id, productData, productImages) => {
    return new Promise(async (resolve, reject) => {
      productData.actualprice = Math.floor(productData.price - (productData.price * (productData.discount / 100)))
      let category=await categoryhelpers.getCategoryById(productData.category)
      productData.categoryname=category.name
      const product = await Product.findByIdAndUpdate(id, productData, { new: true })
      const images = productImages.map(f => ({ url: f.path, filename: f.filename }))
      if (images[0]) {
        for (let img of product.images){
cloudinary.uploader.destroy(img.filename)
        }
        const productimage = await Product.findByIdAndUpdate(id, { images: images }, { new: true }).then((data) => {
          resolve(data);
        })
      }
      resolve(product)
    });
  },
  editProductprice: (id,price) => {
    return new Promise(async (resolve, reject) => {
      const product = await Product.findByIdAndUpdate(id,{actualprice:price}, { new: true })
resolve(product)

    });

  },
  doDeleteproduct: (id) => {
    return new Promise(async (resolve, reject) => {
       await Product.findByIdAndDelete(id).then((data) => {
        for (let img of data.images){
          cloudinary.uploader.destroy(img.filename)
                  }
        resolve(data);
      })

    });

  },
  doLookup: () => {
    return new Promise(async (resolve, reject) => {
      const product = await Product.aggregate([
        {
          $lookup:
          {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryInfo"

          }
        },
        {
          $unwind: '$categoryInfo'
        }

      ])
      resolve(product)

    });

  },
  addReview: (id,data) => {
    return new Promise(async (resolve, reject) => {
      const product = await Product.findById(id)
      const review=new Review(data)
      product.reviews.push(review)       
      await review.save();
      await product.save()
      resolve()
    });

  },
  deleteReview: (id) => {
    return new Promise(async (resolve, reject) => {
     await Review.findByIdAndDelete(id);
      resolve()
    });

  },
  deleteReviewRef: (id,reviewId) => {
    return new Promise(async (resolve, reject) => {
     await Product.findByIdAndUpdate(id,{ $pull :{ reviews : reviewId }},{new:true});
     
      resolve()
    });

  },

}