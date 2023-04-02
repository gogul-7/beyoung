var express = require('express');
const { response } = require('../app');
var router = express.Router();
const admincontroller=require('../controllers/admincontroller')


const multer = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({ storage });


router.use(function (req, res, next) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next()
})

router.use((req, res, next) => {
    if (!req.session.admin_id) {
        return res.redirect('/adminlogin')
    }
    next()
})

router.get('/', admincontroller.Dashboard);


//Users

router.get('/users', admincontroller.Viewusers);

router.get('/block/:id',admincontroller.Blockusers);

//Products

router.get('/products',admincontroller.ViewProducts);

router.get('/products/addproduct',admincontroller.Addproducts);

router.post('/addproduct', (upload.array('filebutton')),admincontroller.AddproductsPost);

router.get('/products/editproduct/:id',admincontroller.Editproducts);

router.put('/products/editproduct/:id', upload.array('filebutton'),admincontroller.EditproductsPut);

router.get('/products/deleteproduct/:id',admincontroller.Deleteproduct);

//Brands

router.get('/brands',admincontroller.ViewBrands);

router.get('/brands/addbrand',admincontroller.Addbrand);

router.post('/addbrand', upload.single('image'),admincontroller.Addbrandpost);

router.get('/brands/editbrand/:id',admincontroller.Editbrand);

router.put('/brands/editbrand/:id', upload.single('image'),admincontroller.Editbrandput);

router.post('/brands/deletebrand',admincontroller.Deletebrand);

router.get('/brands/:id',admincontroller.Viewbrandwise);


//Banners

router.get('/banners',admincontroller.ViewBanners);

router.get('/banners/addbanner',admincontroller.Addbanner);

router.post('/addbanner', upload.single('image'),admincontroller.Addbannerpost);

router.get('/banners/editbanner/:id',admincontroller.Editbanner);

router.put('/banners/editbanner/:id', upload.single('image'),admincontroller.Editbannerput);

router.post('/banners/deletebanner',admincontroller.Deletebanner);



//Categories

router.get('/categories',admincontroller.ViewCategories);

router.get('/categories/addcategory',admincontroller.Addcategory);

router.post('/addcategory', upload.single('image'),admincontroller.Addcategorypost);

router.get('/categories/editcategory/:id',admincontroller.Editcategory);

router.put('/categories/editcategory/:id', upload.single('image'),admincontroller.Editcategoryput);

router.get('/categories/:id',admincontroller.Viewcategorywise);

router.get('/categories/deletecategory/:id',admincontroller.Deletecategory);



//offers
router.get('/offers',admincontroller.ViewOffers);

router.get('/addCategoryOffer',admincontroller.AddcategoryOffer);

router.patch('/addCategoryOffer',admincontroller.AddcategoryOfferPatch);

router.get('/categories/editOffer/:id',admincontroller.EditcategoryOffer);

router.patch('/categories/editOffer/:id',admincontroller.EditcategoryOfferPatch);

router.get('/deleteOffer/:id',admincontroller.deletecategoryOffer);






//Orders

router.get('/orders',admincontroller.viewAllOrders);

router.get('/orders/orderdetails/:orderId',admincontroller.viewOrderDetails);

router.post('/orders/orderStatus',admincontroller.changeProductOrderStatus);



router.get('/getChartData',admincontroller.getChartData);

router.get('/salesReport',admincontroller.salesReport);

router.get('/report',admincontroller.report)

router.post('/custom-report',admincontroller.customReport)


//Coupons

router.get("/coupons",admincontroller.couponsGet);

router.get("/addCoupon",admincontroller.addCouponGet);

router.post("/addCoupon",admincontroller.addCouponPost);

router.get("/coupon-enable/:id",admincontroller.couponEnable)

router.get("/coupon-disable/:id",admincontroller.couponDisable)

router.get("/editCoupon/:id",admincontroller.editCouponGet);

router.post("/editCoupon/:id",admincontroller.editCouponPost);

router.get("/deleteCoupon/:id",admincontroller.deleteCoupon);

module.exports = router;