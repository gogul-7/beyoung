const userhelper = require("../helpers/storehelpers");
const producthelper = require("../helpers/producthelpers");
const categoryhelper = require("../helpers/categoryhelpers");
const carthelper = require("../helpers/carthelpers");
const offerHelpers = require("../helpers/offerhelpers");

const { response } = require("../app");
const coupon = require("../models/coupon");

var ObjectId = require("mongodb").ObjectId;

require("dotenv").config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
const serverSID = process.env.TWILIO_SERVER_SID;

module.exports = {
  register: function (req, res, next) {
    try {
      res.render("registration", { user: false });
    } catch  {
      res.redirect("/error");
    }
  },
  registerpost: async function (req, res) {
    try {
      userhelper
        .doSignup(req.body)
        .then((response) => {
          if (response) {
            req.flash("success", "Regisration successfully");

            res.redirect("/login");
          } else {
            req.flash("failed", "User already exists");
            res.redirect("/register");
          }
        })
        .catch((data) => {
          req.flash("failed", "Invalid Referral");
          res.redirect("/register");
        });
    } catch  {
      res.redirect("/error");
    }
  },
  login: function (req, res, next) {
    try {
      if (req.query) {
        guestCart = req.query.guestCart;
      }

      res.render("login", { user: false, guestCart });
    } catch  {
      res.redirect("/error");
    }
  },
  loginpost: async function (req, res, next) {
    try {
      userhelper.doLogin(req.body).then(async (response) => {
        if (!response) {
          req.flash("failed", "Invalid username/password");
          res.redirect("/login");
        } else if (response.isblocked) {
          req.flash("failed", "You are blocked by Admin");
          res.redirect("/login");
        } else {
          req.session.user = response;
          let guestExist = await carthelper.guestExist(req.session.id);
          if (guestExist) {
            if (guestExist.products.length != 0) {
              let cart = await carthelper.putToCart(
                guestExist.products,
                req.session.user._id,
                guestExist._id
              );
              if (req.body.guestCart) res.redirect("/getGuestCheckout");
              else {
                var redirectTo = req.session.redirectTo || "/";

                delete req.session.redirectTo;
                res.redirect(redirectTo);
              }
            } else {
              var redirectTo = req.session.redirectTo || "/";

              delete req.session.redirectTo;
              res.redirect(redirectTo);
            }
          } else {
            var redirectTo = req.session.redirectTo || "/";

            delete req.session.redirectTo;
            res.redirect(redirectTo);
          }
        }
      });
    } catch  {
      res.redirect("/error");
    }
  },
  otplogin: function (req, res, next) {
    try {
      if (req.query) {
        guestCart = req.query.guestCart;
      }
      res.render("otp-Login", { user: false, guestCart });
    } catch  {
      res.redirect("/error");
    }
  },
  otploginpost: async function (req, res, next) {
    try {
      const { phno } = req.body;
      userhelper.getUserByphno(phno).then((response) => {
        const user = response;
        if (!user) {
          req.flash("failed", "User does not exist");
          res.redirect("/login/otplogin");
        } else if (user.isblocked) {
          req.flash("failed", "You are blocked by Admin");
          res.redirect("/login");
        } else {
          client.verify
            .services(serverSID)
            .verifications.create({
              to: `+91${phno}`,
              channel: "sms",
            })
            .then((data) => {
              res.render("otp-Verification", { phno: req.body.phno, user: false });
            })
            .catch((err) => {
              console.log(err)
              res.send("twilio error")
            });
        }
      });
    } catch  {
      res.redirect("/error");
    }
  },
  otpverification: function (req, res, next) {
    try {
      res.render("otp-Verification", { user: false, phno: null });
    } catch  {
      res.redirect("/error");
    }
  },
  otpverificationpost: function (req, res, next) {
    try {
      const { otp, phno } = req.body;
      client.verify
        .services(serverSID)
        .verificationChecks.create({ to: `+91${phno}`, code: otp })
        .then(async (resp) => {
          if (!resp.valid) {
            req.flash("failed", "OTP verification failed");
            res.redirect("/login/otplogin");
          } else {
            userhelper.getUserByphno(phno).then(async (response) => {
              req.session.user = response;
              let guestExist = await carthelper.guestExist(req.session.id);
              if (guestExist) {
                if (guestExist.products.length != 0) {
                  let cart = await carthelper.putToCart(
                    guestExist.products,
                    req.session.user._id,
                    guestExist._id
                  );
                  if (req.body.guestCart) res.redirect("/getGuestCheckout");
                  else {
                    var redirectTo = req.session.redirectTo || "/";

                    delete req.session.redirectTo;
                    res.redirect(redirectTo);
                  }
                } else {
                  var redirectTo = req.session.redirectTo || "/";

                  delete req.session.redirectTo;
                  res.redirect(redirectTo);
                }
              } else {
                var redirectTo = req.session.redirectTo || "/";

                delete req.session.redirectTo;
                res.redirect(redirectTo);
              }
            });
          }
        })
        .catch((err) => {
        });
    } catch  {
      res.redirect("/error");
    }
  },
  homepage: async function (req, res, next) {
    try {
      let user = req.session.user;
      let cartCount = 0;
      let limit;
      if (user) {
        cartCount = await carthelper.getcartCount(user._id);
      }
      let banners = await categoryhelper.getAllbanners();

      producthelper.doLookup().then((response) => {
        if (response) {
          categoryhelper.getAllcategories().then(async (resp) => {
            const categories = resp;
            const product = response;
            if (user) {
              let userdetails = await userhelper.getUserById(user._id);

              await userhelper.allInWishlist(userdetails, product);
            }
            if(product.length>12)
            limit=12
            else
            limit=product.length
           
            res.render("index", {
              product,
              limit,
              user,
              categories,
              cartCount,
              banners,
            });
          });
        }
      });
    } catch  {
      res.redirect("/error");
    }
  },
  productview: async function (req, res, next) {
    try {
      const { id } = req.params;
      
      
      const user = req.session.user;
      let inWishlist = null;
      let inCart = null;
      let reviewCount=0

      let cartCount = 0;
      if (user) {
        cartCount = await carthelper.getcartCount(user._id);
        inWishlist = await userhelper.checkWishlist(user._id, id);
        inCart = await carthelper.checkCart(user._id, id);
      }
      const product = await producthelper.getProductById(id);
      const category = await categoryhelper.getCategoryById(
        product.category.toString()
      );
      let products = await producthelper.getProductByCategory(
        product.category.toString()
      );
      if (user) {
        let userdetails = await userhelper.getUserById(user._id);
        await userhelper.allInWishlist(userdetails, products);
      }
      let guestExist = await carthelper.guestExist(req.session.id);
      if(guestExist)
      inCart = await carthelper.checkGuestCart(req.session.id,id);

      if(product.reviews.length>0 &&product.reviews.length<4 )
      reviewCount=product.reviews.length
      if(product.reviews.length>3 )
      reviewCount=3
      res.render("productdetails", {
        product,
        category,
        user,
        inWishlist,
        cartCount,
        inCart,
        products,
        reviewCount
      });
    } catch  {
      res.redirect("/error");
    }
  },
  addReview: async function (req, res, next) {
    try {
      const { id } = req.params;
      
      

      let user = req.session.user;
      let cartCount = await carthelper.getcartCount(user._id);
      let product = await producthelper.getProductById(id);

      res.render("user/addReview", { user, cartCount, id, product });
    } catch  {
      res.redirect("/error");
    }
  },
  addReviewPost: async function (req, res, next) {
    try {
      const { id } = req.params;
      
      
      let user = req.session.user;
      req.body.user = user._id;
      req.body.username = user.firstname + " " + user.lastname;
      await producthelper.addReview(id, req.body);
      res.redirect("/reviewSuccess");
    } catch  {
      res.redirect("/error");
    }
  },
  reviewSuccess: async function (req, res, next) {
    try {
      let user = req.session.user;
      let cartCount = await carthelper.getcartCount(user._id);

      res.render("user/reviewSuccess", { user, cartCount });
    } catch  {
      res.redirect("/error");
    }
  },
  deleteReview: async function (req, res, next) {
    try {
      const { id, reviewId } = req.params;
      
      
      await producthelper.deleteReviewRef(id, reviewId);
      await producthelper.deleteReview(reviewId);
      res.json(req.body);
    } catch  {
      res.redirect("/error");
    }
  },
  logout: async function (req, res, next) {
    try {
      req.session.user = null;
      // req.flash('success', 'Logout successfully')
      res.redirect("/");
    } catch  {
      res.redirect("/error");
    }
  },
  categorywiseProducts: async function (req, res, next) {
    try {
      let user = req.session.user;
      let cartCount = 0;
      if (user) cartCount = await carthelper.getcartCount(user._id);
      brands = await categoryhelper.getAllbrands();
      const { id } = req.params;
      
      
      producthelper.getProductByCategory(id).then((resp) => {
        const product = resp;
        categoryhelper.getCategoryById(id).then(async (response) => {
          const category = response;
          if (user) {
            let userdetails = await userhelper.getUserById(user._id);
            if (product.length > 0)
              await userhelper.allInWishlist(userdetails, product);
          }

          res.render("category", {
            product,
            user,
            category,
            cartCount,
            brands,
          });
        });
      });
    } catch  {
      res.redirect("/error");
    }
  },
  getcart: async function (req, res, next) {
    try {
      let guestExist = await carthelper.guestExist(req.session.id);
      if (guestExist) await carthelper.deleteGuest(req.session.id);
      let user = req.session.user;
      let total = 0;
      let cartCount = 0;
      cartCount = await carthelper.getcartCount(user._id);

      carthelper.getCartProducts(user._id).then(async (response) => {
        let user = req.session.user;
        let userdetails = await userhelper.getUserById(user._id);
        let address = userdetails.address;
        const categories = await categoryhelper.getAllcategories();
        for (let i = 0; i < response.length; i++) {
          let index = categories.findIndex(
            (c) => c.name == response[i].product.categoryname
          );

          let p = Math.floor(
            response[i].product.price -
              (categories[index].offer.discount * response[i].product.price) /
                100
          );
          if (p < response[i].product.actualprice) {
            response[i].product.actualprice = p;
            await producthelper.editProductprice(response[i].product._id, p);
          }
        }
        if (response.length > 0) {
          total = await carthelper.totalAmount(user._id);
          total.discount = total.subTotal - total.totalAmount;
        }
        for (let i = 0; i < response.length; i++) {
          let index = categories.findIndex(
            (c) => c.name == response[i].product.categoryname
          );
          if (categories[index].offer.discount > response[i].product.discount) {
            let p = Math.floor(
              response[i].product.price -
                (response[i].product.discount * response[i].product.price) / 100
            );
            await producthelper.editProductprice(response[i].product._id, p);
          }
        }
        let saveforlater = await carthelper.getSavedForLater(user._id);
        res.render("user/cart", {
          user,
          response,
          total,
          address,
          saveforlater,
          cartCount,
        });
      });
    } catch  {
      res.redirect("/error");
    }
  },
  getGuestCart: async function (req, res, next) {
    try {
      let total = 0;
      let cart = await carthelper.getGuestCartProducts(req.session.id);
      const categories = await categoryhelper.getAllcategories();
      for (let i = 0; i < cart.length; i++) {
        let index = categories.findIndex(
          (c) => c.name == cart[i].product.categoryname
        );

        let p = Math.floor(
          cart[i].product.price -
            (categories[index].offer.discount * cart[i].product.price) / 100
        );
        if (p < cart[i].product.actualprice) {
          cart[i].product.actualprice = p;
          await producthelper.editProductprice(cart[i].product._id, p);
        }
      }
      if (cart.length > 0) {
        total = await carthelper.totalAmountGuest(req.session.id);
        total.discount = total.subTotal - total.totalAmount;
      }
      for (let i = 0; i < cart.length; i++) {
        let index = categories.findIndex(
          (c) => c.name == cart[i].product.categoryname
        );
        if (categories[index].offer.discount > cart[i].product.discount) {
          let p = Math.floor(
            cart[i].product.price -
              (cart[i].product.discount * cart[i].product.price) / 100
          );
          await producthelper.editProductprice(cart[i].product._id, p);
        }
      }
      res.render("user/guestCart", { user: false, cart, total });
    } catch  {
      res.redirect("/error");
    }
  },
  getCheckout: async function (req, res, next) {
    try {
      let user = req.session.user;
      let total = 0;
      let cartCount = 0;
      cartCount = await carthelper.getcartCount(user._id);
      let products = await carthelper.getCartProducts(user._id);
      const coupons = await offerHelpers.getCoupons();
      let unavailable = new Array();
      let k = 0;
      for (var i = 0; i < products.length; i++) {
        if (products[i].quantity > products[i].product.stock) {
          await carthelper.removeCartItemStock(user._id, products[i].item);
          unavailable[k] = {
            name: products[i].product.productname,
          };
          k++;
        }
      }
      carthelper.getCartProducts(user._id).then(async (response) => {

        let user = req.session.user;
        let userdetails = await userhelper.getUserById(user._id);
        let address = userdetails.address;
        const categories = await categoryhelper.getAllcategories();
        for (let i = 0; i < response.length; i++) {
          let index = categories.findIndex(
            (c) => c.name == response[i].product.categoryname
          );

          let p = Math.floor(
            response[i].product.price -
              (categories[index].offer.discount * response[i].product.price) /
                100
          );
          if (p < response[i].product.actualprice) {
            response[i].product.actualprice = p;
            await producthelper.editProductprice(response[i].product._id, p);
          }
        }
        if (response.length > 0) {
          total = await carthelper.totalAmount(user._id);
          total.discount = total.subTotal - total.totalAmount;

          if (req.session.couponApplied) {
            const { amount_off, minimum_purchase } = req.session.couponApplied;
            if (minimum_purchase <= total.totalAmount) {
              let amountOff = amount_off;

              couponAppiled = amountOff;
              total.totalAmount = total.totalAmount - amountOff;
            } else {
              req.session.couponApplied = false;
            }
          }

        }
        for (let i = 0; i < response.length; i++) {
          let index = categories.findIndex(
            (c) => c.name == response[i].product.categoryname
          );
          if (categories[index].offer.discount > response[i].product.discount) {
            let p = Math.floor(
              response[i].product.price -
                (response[i].product.discount * response[i].product.price) / 100
            );
            await producthelper.editProductprice(response[i].product._id, p);
          }
        }
        for (var i = 0; i < products.length; i++) {
          if (products[i].quantity > products[i].product.stock) {
            await carthelper.doAddproductsToCartStock(
              user._id,
              products[i].item,
              products[i].quantity
            );
          }
        }

        res.render("user/place-order", {
          user,
          response,
          total,
          address,
          userdetails,
          guest: false,
          cartCount,
          unavailable,
          coupons,
          couponApplied: req.session.couponApplied,
        });
      });
    } catch  {
      res.redirect("/error");
    }
  },
  getGuestCheckout: async function (req, res, next) {
    try {
      let user = req.session.user;
      let cartCount = 0;
      cartCount = await carthelper.getcartCount(user._id);
      let total = 0;
      let k = 0;
      let products = await carthelper.getGuestCartProducts(req.session.id);
      const coupons = await offerHelpers.getCoupons();

      let unavailable = new Array();
      for (var i = 0; i < products.length; i++) {
        if (products[i].quantity > products[i].product.stock) {
          await carthelper.guestRemoveCartItemStock(
            req.session.id,
            products[i].item
          );
          unavailable[k] = {
            name: products[i].product.productname,
          };
          k++;
        }
      }

      const categories = await categoryhelper.getAllcategories();
      for (let i = 0; i < products.length; i++) {
        let index = categories.findIndex(
          (c) => c.name == products[i].product.categoryname
        );

        let p = Math.floor(
          products[i].product.price -
            (categories[index].offer.discount * products[i].product.price) / 100
        );
        if (p < products[i].product.actualprice) {
          products[i].product.actualprice = p;
          await producthelper.editProductprice(products[i].product._id, p);
        }
      }

      carthelper.getGuestCartProducts(req.session.id).then(async (response) => {
        let user = req.session.user;
        let userdetails = await userhelper.getUserById(user._id);
        let address = userdetails.address;
        if (response.length > 0) {
          total = await carthelper.totalAmountGuest(req.session.id);
          total.discount = total.subTotal - total.totalAmount;
          if (req.session.couponApplied) {
            const { amount_off, minimum_purchase } = req.session.couponApplied;
            if (minimum_purchase <= total.totalAmount) {
              let amountOff = amount_off;

              couponAppiled = amountOff;
              total.totalAmount = total.totalAmount - amountOff;
            } else {
              req.session.couponApplied = false;
            }
          }
        }
        for (let i = 0; i < products.length; i++) {
          let index = categories.findIndex(
            (c) => c.name == products[i].product.categoryname
          );
          if (categories[index].offer.discount > products[i].product.discount) {
            let p = Math.floor(
              products[i].product.price -
                (products[i].product.discount * products[i].product.price) / 100
            );
            await producthelper.editProductprice(products[i].product._id, p);
          }
        }
        res.render("user/place-order", {
          user,
          response,
          total,
          address,
          userdetails,
          guest: true,
          cartCount,
          unavailable,
          coupons,
          couponApplied: req.session.couponApplied,
        });
      });
    } catch  {
      res.redirect("/error");
    }
  },
  addtocart: async function (req, res, next) {
    try {
      const { prodId } = req.params;
      
      
      let userId = req.session.user._id;
      let SavedItemExist = await carthelper.findSavedItem(userId, prodId);
      if (SavedItemExist) await carthelper.removeSavedItemCart(userId, prodId);
      carthelper.doAddproductsToCart(userId, prodId).then((response) => {
        res.redirect(`/productview/${prodId}`);
      });
    } catch  {
      res.redirect("/error");
    }
  },
  addtoGuestCart: async function (req, res, next) {
    try {
      const { prodId } = req.params;
      
      
      let userId = req.session.id;
      carthelper.doAddproductsToGuestCart(userId, prodId).then((response) => {
        res.redirect(`/productview/${prodId}`);
      });
    } catch  {
      res.redirect("/error");
    }
  },
  changeQuantity: async function (req, res, next) {
    try {
      let userId = req.session.user._id;
      carthelper.changeProductQuantity(req.body).then(async (response) => {
        let cartItems = await carthelper.getCartProducts(userId);
        if (cartItems.length > 0) {
          let total = await carthelper.totalAmount(req.body.user);
          response.subtotal = total.subTotal;
          response.total = total.totalAmount;
        }
        res.json(response);
      });
    } catch  {
      res.redirect("/error");
    }
  },
  guestChangeQuantity: async function (req, res, next) {
    try {
      let userId = req.session.id;
      carthelper.guestChangeProductQuantity(req.body).then(async (response) => {
        let cartItems = await carthelper.getGuestCartProducts(userId);
        if (cartItems.length > 0) {
          let total = await carthelper.totalAmountGuest(req.session.id);
          response.subtotal = total.subTotal;
          response.total = total.totalAmount;
        }
        res.json(response);
      });
    } catch  {
      res.redirect("/error");
    }
  },
  removeCartItem: async function (req, res, next) {
    try {
      carthelper.removeCartItem(req.body).then(async (response) => {
        res.json(response);
      });
    } catch  {
      res.redirect("/error");
    }
  },
  guestRemoveCartItem: async function (req, res, next) {
    try {
      carthelper.guestRemoveCartItem(req.body).then(async (response) => {
        res.json(response);
      });
    } catch  {
      res.redirect("/error");
    }
  },
  saveForLater: async function (req, res, next) {
    try {
      let userId = req.session.user._id;
      await carthelper.addToSaveForLater(
        userId,
        req.body.product,
        req.body.qty
      );
      await carthelper.removeCartItem(req.body).then(async (response) => {
        res.json(response);
      });
    } catch  {
      res.redirect("/error");
    }
  },
  moveToCart: async function (req, res, next) {
    try {
      let userId = req.session.user._id;
      await carthelper.doAddproductsToCartFromSaved(
        userId,
        req.body.product,
        req.body.qty
      );
      await carthelper.removeSavedItem(req.body).then(async (response) => {
        res.json(response);
      });
    } catch  {
      res.redirect("/error");
    }
  },
  removeSavedItem: async function (req, res, next) {
    try {
      await carthelper.removeSavedItem(req.body).then(async (response) => {
        res.json(response);
      });
    } catch  {
      res.redirect("/error");
    }
  },
  loginNeeded: async function (req, res, next) {
    try {
      let user = req.session.user;
      // req.flash('failed', 'You need to login first to add products to your cart')

      res.render("loginmust", { user });
    } catch  {
      res.redirect("/error");
    }
  },
  wishlist: async function (req, res, next) {
    try {
      let user = req.session.user;
      let cartCount = 0;
      cartCount = await carthelper.getcartCount(user._id);
      carthelper.getWishlistProducts(user._id).then(async (response) => {
        let users = response[0];
        let userdetails = await userhelper.getUserById(user._id);

        res.render("user/wishlist", { user, users, cartCount, userdetails });
      });
    } catch  {
      res.redirect("/error");
    }
  },
  addToWishlist: async function (req, res, next) {
    try {
      let user = req.session.user;
      const { proId } = req.body;
      carthelper.doAddproductsToWishlist(user._id, proId).then((response) => {
        res.json(response);
      });
    } catch  {
      res.redirect("/error");
    }
  },
  removeFromWishlist: async function (req, res, next) {
    try {
      const { id } = req.body;
      let user = req.session.user;
      carthelper.doDeleteproductsFromWishlist(user._id, id).then((response) => {
        res.json(response);
      });
    } catch  {
      res.redirect("/error");
    }
  },
  postPlaceOrder: async function (req, res, next) {
    try {
      let userId = req.session.user._id;
      let product = await carthelper.getCartProducts(userId);
      for (var i = 0; i < product.length; i++) {
        if (product[i].quantity > product[i].product.stock) {
          await carthelper.removeCartItemStock(userId, product[i].item);
        }
      }

      let products = await carthelper.getCartProducts(userId);
      const categories = await categoryhelper.getAllcategories();
      for (let i = 0; i < products.length; i++) {
        let index = categories.findIndex(
          (c) => c.name == products[i].product.categoryname
        );

        let p = Math.floor(
          products[i].product.price -
            (categories[index].offer.discount * products[i].product.price) / 100
        );
        if (p < products[i].product.actualprice) {
          products[i].product.actualprice = p;
          await producthelper.editProductprice(products[i].product._id, p);
        }
      }

      let coupon_discount = null;
      let total = await carthelper.totalAmount(userId);
      if (req.session.couponApplied) {
        const { amount_off } = req.session.couponApplied;
        let amountOff = amount_off;
        coupon_discount = amountOff;

        total.totalAmount = total.totalAmount - amountOff;
        offerHelpers.couponOncedUsed(userId, req.session.couponApplied._id);
      }

      for (let i = 0; i < products.length; i++) {
        let index = categories.findIndex(
          (c) => c.name == products[i].product.categoryname
        );
        if (categories[index].offer.discount > products[i].product.discount) {
          let p = Math.floor(
            products[i].product.price -
              (products[i].product.discount * products[i].product.price) / 100
          );
          await producthelper.editProductprice(products[i].product._id, p);
        }
      }
      for (var i = 0; i < product.length; i++) {
        if (product[i].quantity > product[i].product.stock) {
          await carthelper.doAddproductsToCartStock(
            userId,
            product[i].item,
            product[i].quantity
          );
        }
      }

      if (req.body.address === "no-address") {
        req.flash("failed", "Address");
        res.json({ status: false });
      } else {
        let orderId = await carthelper.placeOrder(
          userId,
          products,
          total,
          req.body,
          coupon_discount
        );
        if (req.body.payment_mode === "wallet") {
          wallet = await carthelper.payUsingWallet(userId, total);
          res.json({ codeSuccess: true, status: true });
        } else if (req.body.payment_mode === "COD") {
          res.json({ codeSuccess: true, status: true });
        } else {
          carthelper
            .generateRazorpay(orderId, total.totalAmount)
            .then((response) => {
              res.json(response);
            });
        }
      }
    } catch  {
      res.redirect("/error");
    }
  },
  postGuestPlaceOrder: async function (req, res, next) {
    try {
      let userId = req.session.user._id;
      let products = await carthelper.getGuestCartProducts(req.session.id);

      const categories = await categoryhelper.getAllcategories();
      for (let i = 0; i < products.length; i++) {
        let index = categories.findIndex(
          (c) => c.name == products[i].product.categoryname
        );

        let p = Math.floor(
          products[i].product.price -
            (categories[index].offer.discount * products[i].product.price) / 100
        );
        if (p < products[i].product.actualprice) {
          products[i].product.actualprice = p;
          await producthelper.editProductprice(products[i].product._id, p);
        }
      }

      let total = await carthelper.totalAmountGuest(req.session.id);
      let coupon_discount = null;
      if (req.session.couponApplied) {
        const { amount_off } = req.session.couponApplied;
        let amountOff = amount_off;

        total.totalAmount = total.totalAmount - amountOff;
        offerHelpers.couponOncedUsed(userId, req.session.couponApplied._id);
        coupon_discount = amountOff;
      }

      for (let i = 0; i < products.length; i++) {
        let index = categories.findIndex(
          (c) => c.name == products[i].product.categoryname
        );
        if (categories[index].offer.discount > products[i].product.discount) {
          let p = Math.floor(
            products[i].product.price -
              (products[i].product.discount * products[i].product.price) / 100
          );
          await producthelper.editProductprice(products[i].product._id, p);
        }
      }
      await carthelper.deleteGuest(req.session.id);

      if (req.body.address === "no-address") {
        req.flash("failed", "Address");
        res.json({ status: false });
      } else {
        let orderId = await carthelper.placeOrder(
          userId,
          products,
          total,
          req.body,
          coupon_discount
        );
        if (req.body.payment_mode === "wallet") {
          wallet = await carthelper.payUsingWallet(userId, total);
          res.json({ codeSuccess: true, status: true });
        } else if (req.body.payment_mode === "COD") {
          res.json({ codeSuccess: true, status: true });
        } else {
          carthelper
            .generateRazorpay(orderId, total.totalAmount)
            .then((response) => {
              res.json(response);
            });
        }
      }
    } catch  {
      res.redirect("/error");
    }
  },
  verifyPayment: (req, res) => {
    try {
      carthelper
        .verifyPayment(req.body)
        .then(() => {
          carthelper
            .changePaymentStatus(req.body["order[receipt]"])
            .then(() => {
              res.json({ status: true });
            });
        })
        .catch((err) => {
          res.json({ status: false });
        });
    } catch  {
      res.redirect("/error");
    }
  },
  viewOrders: async function (req, res, next) {
    try {
      let user = req.session.user;
      let cartCount = 0;
      cartCount = await carthelper.getcartCount(user._id);
      let orders = await carthelper.viewOrders(user._id);
      res.render("user/orders", { user, orders, cartCount });
    } catch  {
      res.redirect("/error");
    }
  },
  viewOrderDetails: async function (req, res, next) {
    try {
      const { orderId } = req.params;
      
      
      const { prodId } = req.params;
      
      
      let user = req.session.user;
      let cartCount = 0;
      cartCount = await carthelper.getcartCount(user._id);
      let order = await carthelper.findOrderDetails(orderId);

      let index = order.products.findIndex((order) => order.item == prodId);
      let productDetails = order.products[index];

      let returnAvailable = false;
      let returnAvailableDate = null;
      if (productDetails.deliveredDate) {
        returnAvailableDate = new Date(
          productDetails.deliveredDate.getTime() +
            1000 /*sec*/ * 60 /*min*/ * 60 /*hour*/ * 24 /*day*/ * 7
        );
        if (new Date() <= returnAvailableDate) {
          returnAvailable = true;
        }
        returnAvailableDate =
          returnAvailableDate.toLocaleString("default", { month: "short" }) +
          " " +
          returnAvailableDate.getDate();
      }

      // for (p of order.products) {
      //   p.orderedDate =
      //     p.orderedDate.toLocaleString("default", { month: "short" }) +
      //     " " +
      //     p.orderedDate.getDate();
      //   p.confirmedDate =
      //     p.confirmedDate?.toLocaleString("default", { month: "short" }) +
      //     " " +
      //     p.confirmedDate?.getDate();
      //   p.deliveryDate =
      //     p.deliveryDate?.toLocaleString("default", { month: "short" }) +
      //     " " +
      //     p.deliveryDate?.getDate();
      //   p.shippedDate =
      //     p.shippedDate?.toLocaleString("default", { month: "short" }) +
      //     " " +
      //     p.shippedDate?.getDate();
      //   p.outfordeliveryDate =
      //     p.outfordeliveryDate?.toLocaleString("default", { month: "short" }) +
      //     " " +
      //     p.outfordeliveryDate?.getDate();
      //   p.deliveredDate =
      //     p.deliveredDate?.toLocaleString("default", { month: "short" }) +
      //     " " +
      //     p.deliveredDate?.getDate();
      //   p.cancelledDate =
      //     p.cancelledDate?.toLocaleString("default", { month: "short" }) +
      //     " " +
      //     p.cancelledDate?.getDate();
      //   p.cancelledbyadminDate =
      //     p.cancelledbyadminDate?.toLocaleString("default", {
      //       month: "short",
      //     }) +
      //     " " +
      //     p.cancelledbyadminDate?.getDate();

      //   p.returnRequestDate =
      //     p.returnRequestDate?.toLocaleString("default", { month: "short" }) +
      //     " " +
      //     p.returnRequestDate?.getDate();
      //   p.returnApprovedDate =
      //     p.returnApprovedDate?.toLocaleString("default", { month: "short" }) +
      //     " " +
      //     p.returnApprovedDate?.getDate();
      //   p.returnPickupedDate =
      //     p.returnPickupedDate?.toLocaleString("default", { month: "short" }) +
      //     " " +
      //     p.returnPickupedDate?.getDate();
      //   p.refundDoneDate =
      //     p.refundDoneDate?.toLocaleString("default", { month: "short" }) +
      //     " " +
      //     p.refundDoneDate?.getDate();
      //   p.returnCancelledByAdminDate =
      //     p.returnCancelledByAdminDate?.toLocaleString("default", {
      //       month: "short",
      //     }) +
      //     " " +
      //     p.returnCancelledByAdminDate?.getDate();
      //   p.returnCancelledDate =
      //     p.returnCancelledDate?.toLocaleString("default", { month: "short" }) +
      //     " " +
      //     p.returnCancelledDate?.getDate();
      // }

      res.render("user/orderDetails", {
        user,
        order,
        productDetails,
        cartCount,
        returnAvailable,
        returnAvailableDate,
      });
    } catch  {
      res.redirect("/error");
    }
  },
  viewInvoice: async function (req, res, next) {
    try {
      const { orderId } = req.params;
      
      
      let user = req.session.user;
      let cartCount = 0;
      cartCount = await carthelper.getcartCount(user._id);
      let order = await carthelper.findOrderDetails(orderId);
      res.render("user/invoice", { user, order, cartCount });
    } catch  {
      res.redirect("/error");
    }
  },
  changeProductOrderStatus: async function (req, res, next) {
    try {
      req.body.userId = req.session.user._id;

      let orders = await carthelper.changeProductOrderStatus(req.body);
      res.json(orders);
    } catch  {
      res.redirect("/error");
    }
  },
  returnRequest: (req, res) => {
    carthelper.changeOrderStatus(req.body).then((response) => {
      res.json(response);
    });
  },
  userprofile: async function (req, res, next) {
    try {
      let user = req.session.user;
      let cartCount = 0;
      cartCount = await carthelper.getcartCount(user._id);
      userhelper.getUserById(user._id).then((response) => {
        let userdetails = response;
        res.render("user/user-profile", { user, userdetails, cartCount });
      });
    } catch  {
      res.redirect("/error");
    }
  },
  editprofile: async function (req, res, next) {
    try {
      let user = req.session.user;
      let cartCount = 0;
      cartCount = await carthelper.getcartCount(user._id);
      userhelper.getUserById(user._id).then((response) => {
        let userdetails = response;
        res.render("user/editprofile", { user, userdetails, cartCount });
      });
    } catch  {
      res.redirect("/error");
    }
  },
  editprofilepatch: function (req, res, next) {
    try {
      let user = req.session.user;
      userhelper.editprofile(user._id, req.body).then((response) => {
        if (response) {
          req.flash("success", "Profile Updated Successfully");
          res.redirect("/userprofile");
        }
      });
    } catch  {
      res.redirect("/error");
    }
  },
  userdelete: function (req, res, next) {
    try {
      let user = req.session.user;
      userhelper.getUserById(user._id).then((respo) => {
        let userdetails = respo;
        userhelper
          .confirmDeactivation(req.body, userdetails)
          .then((response) => {
            if (!response) {
              req.flash("failed", "Invalid username/password");
              res.redirect("/userprofile");
            } else {
              userhelper.deleteuser(user._id).then((response) => {
                if (response) {
                  req.flash("success", "Account Deactivated");
                  req.session.user = null;
                  res.redirect("/");
                }
              });
            }
          });
      });
    } catch  {
      res.redirect("/error");
      profilePicture;
    }
  },
  profilePicture: async function (req, res, next) {
    try {
      let user = req.session.user;

      await userhelper.updateProfilePicture(user._id, req.file);
      res.redirect("/userprofile");
    } catch  {
      res.redirect("/error");
    }
  },
  useraddress: async function (req, res, next) {
    try {
      let user = req.session.user;
      let cartCount = 0;
      cartCount = await carthelper.getcartCount(user._id);
      userhelper.getUserById(user._id).then((response) => {
        let userdetails = response;
        res.render("user/useraddress", { user, userdetails, cartCount });
      });
    } catch  {
      res.redirect("/error");
    }
  },
  userdeleteaddress: function (req, res, next) {
    try {
      const { address } = req.body;
      let user = req.session.user;

      userhelper.deleteAddress(user._id, address).then((response) => {

        res.json(response);
      });
    } catch  {
      res.redirect("/error");
    }
  },
  userAddaddress: async function (req, res, next) {
    try {
      let user = req.session.user;
      let cartCount = 0;
      cartCount = await carthelper.getcartCount(user._id);
      userhelper.getUserById(user._id).then((response) => {
        let userdetails = response;
        res.render("user/address-form", { user, userdetails, cartCount });
      });
    } catch  {
      res.redirect("/error");
    }
  },
  userAddaddresspatch: function (req, res, next) {
    try {
      let user = req.session.user;
      userhelper.addAddress(user._id, req.body).then((response) => {
        res.redirect(`/userprofile/address`);
      });
    } catch  {
      res.redirect("/error");
    }
  },
  userEditaddress: async function (req, res, next) {
    try {
      const { id } = req.params;
      
      
      let user = req.session.user;
      let cartCount = 0;
      cartCount = await carthelper.getcartCount(user._id);
      userhelper.getUserById(user._id).then((response) => {
        let userdetails = response;
        userhelper.findaddressbyid(id).then((response) => {
          let address = response;
          res.render("user/edit-address", {
            user,
            userdetails,
            id,
            address,
            cartCount,
          });
        });
      });
    } catch  {
      res.redirect("/error");
    }
  },
  userEditaddresspatch: function (req, res, next) {
    try {
      const { id } = req.params;
      
      
      let user = req.session.user;
      userhelper.editaddress(user._id, id, req.body).then((response) => {
        res.redirect(`/userprofile/address`);
      });
    } catch  {
      res.redirect("/error");
    }
  },
  userPassword: async function (req, res, next) {
    try {
      let user = req.session.user;
      let cartCount = 0;
      cartCount = await carthelper.getcartCount(user._id);
      userhelper.getUserById(user._id).then((response) => {
        let userdetails = response;
        res.render("user/password", { user, userdetails, cartCount });
      });
    } catch  {
      res.redirect("/error");
    }
  },
  userPasswordpost: function (req, res, next) {
    try {
      let user = req.session.user;
      userhelper.getUserById(user._id).then((response) => {
        let userdetails = response;
        userhelper
          .checkpassword(req.body.password, userdetails.password)
          .then((response) => {
            if (response) {
              req.flash("success", "Password Verified");
              res.redirect("/userprofile/password/changepassword");
            } else {
              req.flash("failed", "Incorrect Password");
              res.redirect("/userprofile/password");
            }
          });
      });
    } catch  {
      res.redirect("/error");
    }
  },
  changePassword: async function (req, res, next) {
    try {
      let user = req.session.user;
      let cartCount = 0;
      cartCount = await carthelper.getcartCount(user._id);
      userhelper.getUserById(user._id).then((response) => {
        let userdetails = response;
        res.render("user/change-password", { user, userdetails, cartCount });
      });
    } catch  {
      res.redirect("/error");
    }
  },
  changePasswordpatch: function (req, res, next) {
    try {
      let user = req.session.user;
      userhelper
        .changepassword(user._id, req.body.password)
        .then((response) => {
          if (response) req.flash("success", "Password Updated Successfully");
          res.redirect("/userprofile");
        });
    } catch  {
      res.redirect("/error");
    }
  },
  orderSuccess: async (req, res, next) => {
    try {
      let user = req.session.user;
      req.session.couponApplied = false;
      let cartCount = 0;
      cartCount = await carthelper.getcartCount(user._id);
      res.render("user/orderSuccess", { user, cartCount });
    } catch  {
      res.redirect("/error");
    }
  },
  applyCoupon: async (req, res) => {
    let couponDetails = await offerHelpers.getCouponDetails(
      req.body.couponCode
    );
    if (couponDetails) {
      const couponUsed = couponDetails.users.includes(req.body.userId);
      if (couponUsed) {
        req.flash("failed", "Coupon Already Used");
        res.status("200").json("success");
      } else {
        if (req.body.total > couponDetails.minimum_purchase) {
          req.session.couponApplied = couponDetails;
          req.flash("success", "Coupon Applied");

          res.status("200").json("success");
        } else {
          req.flash(
            "failed",
            `Minimum purchase must be ${couponDetails.minimum_purchase}`
          );
          res.status("200").json("success");
        }
      }
    } else {
      req.flash("failed", "Coupon doesn't exist or has been expired");

      res.status("200").json("success");
    }
  },
  removeCoupon: async (req, res, next) => {
    try {
      req.session.couponApplied = false;
      res.status("200").json("success");
    } catch (err) {
      next(err);
    }
  },
  error: (req, res, next) => {
    res.render("error");
  },
};
