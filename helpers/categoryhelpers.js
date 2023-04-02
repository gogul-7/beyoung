const Category = require("../models/category");
const { findByIdAndUpdate } = require("../models/user");
const Product = require("../models/product");
const Brand = require("../models/brand");
const Banner = require("../models/banner");


const { cloudinary } = require('../cloudinary')


module.exports = {

    getAllcategories: () => {
        return new Promise(async (resolve, reject) => {
            const category = await Category.find().then(async(data) => {
                for(let c of data){
                    if(c.offer.discount){
if(new Date()>=c.offer.validTo)
 await Category.findByIdAndUpdate(c._id, {offer:null}, { new: true })

                    }
                }
            resolve(data);

            })

        });
    },
    getAllbrands: () => {
        return new Promise(async (resolve, reject) => {
            const brand = await Brand.find().then((data) => {
                resolve(data);
            })

        });
    },
    getAllbanners: () => {
        return new Promise(async (resolve, reject) => {
            const banner = await Banner.find()
            resolve(banner)
        });
    },
    getCategoryById: (id) => {
        return new Promise(async (resolve, reject) => {
            const category = await Category.findById(id).then((data) => {
                resolve(data);
            })

        });
    },
    getBrandById: (id) => {
        return new Promise(async (resolve, reject) => {
            const brand = await Brand.findById(id).then((data) => {
                resolve(data);
            })

        });
    },
    getBannerById: (id) => {
        return new Promise(async (resolve, reject) => {
            const banner = await Banner.findById(id).then((data) => {
                resolve(data);
            })

        });
    },

    doAddcategory: (categoryData, categoryImage) => {
        return new Promise(async (resolve, reject) => {
            const category = new Category(categoryData);
            category.image.url = categoryImage.path
            category.image.filename = categoryImage.filename
            await category.save().then((data) => {
                resolve(data);
            });
        });
    },
    doAddbrand: (brandData, brandImage) => {
        return new Promise(async (resolve, reject) => {
            const brand = new Brand(brandData);
            brand.image.url = brandImage.path
            brand.image.filename = brandImage.filename
            await brand.save().then((data) => {
                resolve(data);
            });
        });
    },
    doAddbanner: (bannerData, bannerImage) => {
        return new Promise(async (resolve, reject) => {
            const banner = new Banner(bannerData);
            banner.image.url = bannerImage.path
            banner.image.filename = bannerImage.filename
            await banner.save().then((data) => {
                resolve(data);
            });
        });
    },
    doEditcategory: (id, categoryData, categoryImage) => {
        return new Promise(async (resolve, reject) => {
            const category = await Category.findByIdAndUpdate(id, categoryData, { new: true })
            if (categoryImage) {
                cloudinary.uploader.destroy(category.image.filename)
                const categoryimage = await Category.findByIdAndUpdate(id, { image: { url: categoryImage.path, filename: categoryImage.filename } }, { new: true }).then((data) => {
                    resolve(data);
                })
            }
            resolve(category)
        });

    },
    AddCategoryOffer: (id, offerData) => {
        return new Promise(async (resolve, reject) => {
            const category = await Category.findByIdAndUpdate(id, {offer:offerData}, { new: true })
         
            resolve(category)
        });

    },
    doEditbrand: (id, brandData, brandImage) => {
        return new Promise(async (resolve, reject) => {
            const brand = await Brand.findByIdAndUpdate(id, brandData, { new: true })
            if (brandImage) {
                cloudinary.uploader.destroy(brand.image.filename)
                
                const brandimage = await Brand.findByIdAndUpdate(id, { image: { url: brandImage.path, filename: brandImage.filename } }, { new: true }).then((data) => {
                    resolve(data);
                })
            }
            resolve(brand)
        });

    },
    doEditbanner: (id, bannerData, bannerImage) => {
        return new Promise(async (resolve, reject) => {
            const banner = await Banner.findByIdAndUpdate(id, bannerData, { new: true })
            if (bannerImage) {
                cloudinary.uploader.destroy(banner.image.filename)
                const bannerimage = await Banner.findByIdAndUpdate(id, { image: { url: bannerImage.path, filename: bannerImage.filename } }, { new: true }).then((data) => {
                    resolve(data);
                })
            }
            resolve(banner)
        });

    },
    doDeletecategory: (id) => {
        return new Promise(async (resolve, reject) => {
            const product = await Product.find({ category: id })
            if (product.length > 0) {
                // const deleteproduct = await Product.deleteMany({ category: id })
                // const category = await Category.findByIdAndDelete(id).then((data) => {
                //     resolve(data);
                // })

                resolve(product)
            }
            else {
                 await Category.findByIdAndDelete(id).then((data) => {
                cloudinary.uploader.destroy(data.image.filename)

                    resolve(product);
                })
            }
        });
    },
    doDeletebrand: (id) => {
        return new Promise(async (resolve, reject) => {
            const product = await Product.find({ brand: id })
            if (product.length > 0) {
                // const deleteproduct = await Product.deleteMany({ category: id })
                // const category = await Category.findByIdAndDelete(id).then((data) => {
                //     resolve(data);
                // })

                resolve(product)
            }
            else {
                const brand=await Brand.findOne({name:id})
                await Brand.deleteOne({name:id}).then((data) => {
                cloudinary.uploader.destroy(brand.image.filename)

                    resolve(product);
                })
            }
        });
    },
    doDeletebanner: (id) => {
        return new Promise(async (resolve, reject) => {
                
                const banner = await Banner.findByIdAndDelete(id).then((data) => {
                cloudinary.uploader.destroy(data.image.filename)
                    resolve(data);
                })
            
        });
    },
}