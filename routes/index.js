var express = require('express');
const { response } = require('../app');
var router = express.Router();
const usercontroller=require('../controllers/usercontrollers')
const admincontroller=require('../controllers/admincontroller')

const carthelper = require('../helpers/carthelpers');



const Guest = require('../models/guest');


const multer = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({ storage });


const storeCurrentRoute = (req, res, next) => {
  if (!req.session.user)
  if(req.path=='/guestCart')
  req.session.redirectTo='/cart'
  else
req.session.redirectTo=req.path
console.log('hai',req.session.redirectTo,req.path)
  next()
}
const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/')
  }
  next()
}
const notrequireadminLogin = (req, res, next) => {
  if (req.session.admin_id) {
    return res.redirect('/admin')
  }
  next()
}

const guestexist=async(req, res, next) => {
  let guestExist=await Guest.findOne({user:req.session.id})
  if(!guestExist)
     res.redirect('/')
  next()

}
const clearGuestCart=async(req, res, next) => {
  if(req.session.user){
  let guestExist=await Guest.findOne({user:req.session.id})
  if(guestExist)
  await carthelper.deleteGuest(req.session.id)
  }
  next()

}



router.use(function (req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next()
})
/* GET home page. */
router.get('/',storeCurrentRoute,clearGuestCart,usercontroller.homepage);

router.get('/adminlogin', notrequireadminLogin,admincontroller.adminLogin);

router.post('/adminlogin',admincontroller.adminLoginpost);

router.get('/adminlogout',admincontroller.adminLogout);




router.get('/productview/:id',storeCurrentRoute,clearGuestCart,usercontroller.productview);

router.get('/productview/:id/writeReview',requireLogin,usercontroller.addReview);

router.post('/productview/:id/writeReview',requireLogin,usercontroller.addReviewPost);

router.get('/reviewSuccess',requireLogin,usercontroller.reviewSuccess);

router.delete('/productview/:id/reviews/:reviewId',requireLogin,usercontroller.deleteReview);




router.get('/logout',clearGuestCart,usercontroller.logout); 


router.get('/category/:id',storeCurrentRoute,clearGuestCart,usercontroller.categorywiseProducts);

//Cart Section


router.get('/cart',requireLogin,usercontroller.getcart);

router.get('/addtoCart/:prodId',requireLogin,usercontroller.addtocart)

router.post('/change-product-quantity',requireLogin,usercontroller.changeQuantity)

router.post('/remove-cartItem',requireLogin,usercontroller.removeCartItem)

//SaveForLater

router.post('/save-for-later',requireLogin,usercontroller.saveForLater)

router.post('/move-to-cart',requireLogin,usercontroller.moveToCart)

router.post('/remove-savedItem',requireLogin,usercontroller.removeSavedItem)

//Checkout Section

router.get('/checkout',requireLogin,usercontroller.getCheckout);

router.post('/placeOrder', requireLogin,usercontroller.postPlaceOrder);

router.post('/verify-payment',requireLogin,usercontroller.verifyPayment)


//Coupon
router.post('/apply-coupon',requireLogin,usercontroller.applyCoupon)

router.get('/remove-coupon',requireLogin,usercontroller.removeCoupon)


//guestcart

router.get('/guestCart',storeCurrentRoute,usercontroller.getGuestCart);

router.get('/addtoGuestCart/:prodId',usercontroller.addtoGuestCart)

router.post('/guestChange-product-quantity',usercontroller.guestChangeQuantity)

router.post('/guestRemove-cartItem',usercontroller.guestRemoveCartItem)

router.get('/getGuestCheckout', requireLogin,guestexist,usercontroller.getGuestCheckout);

router.post('/guestPlaceOrder', requireLogin,usercontroller.postGuestPlaceOrder);



//Order Section

router.get('/orderSuccess', requireLogin,usercontroller.orderSuccess);

router.get('/orders', requireLogin,clearGuestCart,usercontroller.viewOrders);

router.get('/orders/orderdetails/:orderId/:prodId', requireLogin,usercontroller.viewOrderDetails);

router.get('/invoice/:orderId', requireLogin,usercontroller.viewInvoice);

router.post('/orders/orderStatus',usercontroller.changeProductOrderStatus);

router.post('/orders/return-item',requireLogin,usercontroller.returnRequest);


router.get('/error', usercontroller.error);











//wishlist

router.get('/loginneeded',usercontroller.loginNeeded);

router.get('/wishlist', requireLogin,usercontroller.wishlist)

router.patch('/addToWishlist',usercontroller.addToWishlist );

router.patch('/removeFromWishlist',requireLogin,usercontroller.removeFromWishlist);





//userProfile

router.get('/userprofile',requireLogin,clearGuestCart,usercontroller.userprofile);

router.get('/userprofile/editprofile',requireLogin,usercontroller.editprofile);

router.patch('/userprofile/editprofile',requireLogin,usercontroller.editprofilepatch);

router.delete('/userprofile',requireLogin,usercontroller.userdelete);

router.patch('/userprofile/dp',requireLogin,upload.single('image'),usercontroller.profilePicture);



//userProfile Address Management

router.get('/userprofile/address',requireLogin,usercontroller.useraddress);

router.post('/userprofile/deleteAddress',requireLogin,usercontroller.userdeleteaddress);

router.get('/userprofile/addaddress',requireLogin,usercontroller.userAddaddress);

router.patch('/userprofile/addaddress',requireLogin,usercontroller.userAddaddresspatch);

router.get('/userprofile/editaddress/:id',requireLogin,usercontroller.userEditaddress);

router.patch('/userprofile/editaddress/:id',requireLogin,usercontroller.userEditaddresspatch);



//userprofile Password Section

router.get('/userprofile/password',requireLogin,usercontroller.userPassword);

router.post('/userprofile/password',requireLogin,usercontroller.userPasswordpost);

router.get('/userprofile/password/changepassword',requireLogin,usercontroller.changePassword);

router.patch('/userprofile/password/changepassword',requireLogin,usercontroller.changePasswordpatch);



module.exports = router