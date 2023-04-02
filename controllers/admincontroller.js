const userhelper = require("../helpers/storehelpers");
const producthelper = require("../helpers/producthelpers");
const categoryhelper = require("../helpers/categoryhelpers");
const carthelper = require("../helpers/carthelpers");
const adminhelper = require("../helpers/adminhelpers");
const offerHelpers = require("../helpers/offerhelpers");

const Coupon = require("../models/coupon");

const Order = require("../models/order");
const moment = require("moment");

module.exports = {
  adminLogin: async function (req, res, next) {
    res.render("admin/login");
  },
  adminLoginpost: async function (req, res, next) {
    userhelper.doadminLogin(req.body).then((response) => {
      if (response) {
        req.session.admin_id = response.email;
        req.flash("success", "Admin Login Successfully");
        res.redirect("/admin");
      } else {
        req.flash("failed", "Invalid username/password");
        res.redirect("/adminlogin");
      }
    });
  },
  adminLogout: async function (req, res, next) {
    req.session.admin_id = null;
    req.flash("success", "Logout successfully");
    res.redirect("/adminlogin");
  },
  Dashboard: async function (req, res, next) {
    let users = await userhelper.getAllusers();
    let products = await producthelper.getAllproducts();
    let orders = await carthelper.viewAllOrders();
    let total = await carthelper.getReveniew();
    res.render("admin/dashboard", {
      active: "dashboard",
      users,
      products,
      orders,
      total,
    });
  },
  Viewusers: async function (req, res, next) {
    let user = await userhelper.getAllusers();
    res.render("admin/customers", { user, active: "users" });
  },
  Blockusers: async function (req, res, next) {
    const { id } = req.params;
    userhelper.doBlock(id).then((response) => {
      if (response) {
        res.redirect("/admin/users");
      }
    });
  },
  ViewProducts: async function (req, res, next) {
    producthelper.doLookup().then((response) => {
      if (response) {
        const product = response;
        res.render("admin/products", { product, active: "products" });
      }
    });
  },
  Addproducts: async function (req, res, next) {
    categoryhelper.getAllcategories().then(async (response) => {
      const category = response;
      let brand = await categoryhelper.getAllbrands();
      res.render("admin/addProduct", { category, brand, active: "products" });
    });
  },
  AddproductsPost: async function (req, res, next) {
    producthelper.doAddproduct(req.body, req.files).then((response) => {
      if (response) {
        res.redirect("/admin/products");
      }
    });
  },
  Editproducts: async function (req, res, next) {
    const { id } = req.params;
    producthelper.getProductById(id).then(async (resp) => {
      const product = resp;
      let selectedCategory = await categoryhelper.getCategoryById(
        product.category
      );
      let selectedCategoryName = selectedCategory.name;
      categoryhelper.getAllcategories().then(async (response) => {
        const category = response;
        let brand = await categoryhelper.getAllbrands();
        res.render("admin/editProduct", {
          product,
          brand,
          category,
          active: "products",
          selectedCategoryName,
        });
      });
    });
  },
  EditproductsPut: async function (req, res, next) {
    const { id } = req.params;
    producthelper.doEditproduct(id, req.body, req.files).then((response) => {
      if (response) {
        res.redirect("/admin/products");
      }
    });
  },
  Deleteproduct: async function (req, res, next) {
    const { id } = req.params;
    producthelper.doDeleteproduct(id).then((response) => {
      if (response) {
        res.redirect("/admin/products");
      }
    });
  },
  ViewCategories: async function (req, res, next) {
    categoryhelper.getAllcategories().then((response) => {
      const category = response;
      res.render("admin/categories", { category, active: "categories" });
    });
  },
  ViewOffers: async function (req, res, next) {
    categoryhelper.getAllcategories().then((response) => {
      const category = response;
      res.render("admin/offers", { category, active: "offers" });
    });
  },
  ViewBrands: async function (req, res, next) {
    categoryhelper.getAllbrands().then((response) => {
      const brand = response;
      res.render("admin/brands", { brand, active: "brands" });
    });
  },
  ViewBanners: async function (req, res, next) {
    categoryhelper.getAllbanners().then((response) => {
      const banner = response;
      res.render("admin/banners", { banner, active: "banners" });
    });
  },
  Addcategory: async function (req, res, next) {
    res.render("admin/addCategory", { active: "categories" });
  },
  AddcategoryOffer: async function (req, res, next) {
    let category = await categoryhelper.getAllcategories();
    res.render("admin/addCategoryOffer", { category, active: "offers" });
  },
  EditcategoryOffer: async function (req, res, next) {
    const { id } = req.params;
    categoryhelper.getCategoryById(id).then((response) => {
      const category = response;
      category.valid_from=moment(category.offer.validFrom).format('YYYY-MM-DD')
      category.valid_to=moment(category.offer.validTo).format('YYYY-MM-DD')
      res.render("admin/editCategoryOffer", { category, active: "offers" });
    });
  },
  Addbrand: async function (req, res, next) {
    res.render("admin/addBrand", { active: "brands" });
  },
  Addbanner: async function (req, res, next) {
   const category= await categoryhelper.getAllcategories()
    res.render("admin/addBanner", { active: "banners",category });
  },
  Addcategorypost: async function (req, res, next) {
    categoryhelper.doAddcategory(req.body, req.file).then((response) => {
      if (response) {
        res.redirect("/admin/categories");
      }
    });
  },
  AddcategoryOfferPatch: async function (req, res, next) {
    let result = await categoryhelper.AddCategoryOffer(
      req.body.category,
      req.body
    );
    res.redirect("/admin/offers");
  },
  EditcategoryOfferPatch: async function (req, res, next) {
    const { id } = req.params;

    let result = await categoryhelper.AddCategoryOffer(id, req.body);
    res.redirect("/admin/offers");
  },
  deletecategoryOffer: async function (req, res, next) {
    const { id } = req.params;

    let result = await categoryhelper.AddCategoryOffer(id, null);
    res.redirect("/admin/offers");
  },
  Addbrandpost: async function (req, res, next) {
    categoryhelper.doAddbrand(req.body, req.file).then((response) => {
      if (response) {
        req.flash("success", "New Brand Added successfully");

        res.redirect("/admin/brands");
      }
    });
  },
  Addbannerpost: async function (req, res, next) {
    categoryhelper.doAddbanner(req.body, req.file).then((response) => {
      
      if (response) {
        res.redirect("/admin/banners");
      }
    });
  },
  Editcategory: async function (req, res, next) {
    const { id } = req.params;
    categoryhelper.getCategoryById(id).then((response) => {
      const category = response;
      res.render("admin/editCategory", { category, active: "categories" });
    });
  },
  Editbrand: async function (req, res, next) {
    const { id } = req.params;
    categoryhelper.getBrandById(id).then((response) => {
      const brand = response;
      res.render("admin/editBrand", { brand, active: "brands" });
    });
  },
  Editbanner: async function (req, res, next) {
    const { id } = req.params;
    categoryhelper.getBannerById(id).then(async(response) => {
      let selectedCategory = await categoryhelper.getCategoryById(
        response.category
      );
      let selectedCategoryName = selectedCategory.name;
   const category= await categoryhelper.getAllcategories()

      const banner = response;
      res.render("admin/editBanner", { banner, active: "banners",selectedCategoryName,category });
    });
  },
  Editcategoryput: async function (req, res, next) {
    const { id } = req.params;
    categoryhelper.doEditcategory(id, req.body, req.file).then((response) => {
      if (response) {
        res.redirect("/admin/categories");
      }
    });
  },
  Editbrandput: async function (req, res, next) {
    const { id } = req.params;
    categoryhelper.doEditbrand(id, req.body, req.file).then((response) => {
      if (response) {
        req.flash("success", "Brand Edited successfully");
        res.redirect("/admin/brands");
      }
    });
  },
  Editbannerput: async function (req, res, next) {
    const { id } = req.params;
    categoryhelper.doEditbanner(id, req.body, req.file).then((response) => {
      if (response) {
        res.redirect("/admin/banners");
      }
    });
  },
  Viewcategorywise: async function (req, res, next) {
    const { id } = req.params;
    producthelper
      .getProductByCategory(id)
      .then((resp) => {
        const product = resp;
        categoryhelper.getCategoryById(id).then((response) => {
          const category = response;
          res.render("admin/categoryProducts", {
            product,
            category,
            active: "categories",
          });
        });
      })
      .catch(() => {
        res.send("something went wrong,Database not responding");
      });
  },
  Viewbrandwise: async function (req, res, next) {
    const { id } = req.params;
    let brand = await categoryhelper.getBrandById(id);
    producthelper.getProductByBrand(brand.name).then((resp) => {
      const product = resp;
      categoryhelper.getBrandById(id).then((response) => {
        const category = response;
        res.render("admin/brandProducts", {
          product,
          category,
          active: "brands",
        });
      });
    });
  },
  Deletecategory: async function (req, res, next) {
    const { id } = req.params;
    categoryhelper.doDeletecategory(id).then((response) => {
      if (response.length == 0) {
        req.flash("success", "Category Deleted successfully");
        res.redirect("/admin/categories");
      } else {
        req.flash(
          "failed",
          "There are " +
            response.length +
            "more products in this category.If you want to delete this category make sure that all the products under this category are deleted."
        );

        res.redirect("/admin/categories");
      }
    });
  },
  Deletebrand: async function (req, res, next) {
    const { brand } = req.body;
    categoryhelper.doDeletebrand(brand).then((response) => {
      if (response.length == 0) {
        res.json({ success: true });
      } else {
        req.flash(
          "failed",
          "There are " +
            response.length +
            "more products in this Brand.If you want to delete this category make sure that all the products under this category are deleted."
        );

        res.json({ success: false });
      }
    });
  },
  Deletebanner: async function (req, res, next) {
    const { banner } = req.body;
    categoryhelper.doDeletebanner(banner).then((response) => {
      res.json({ success: true });
    });
  },
  viewAllOrders: async function (req, res, next) {
    let orders = await carthelper.viewAllOrders();
    res.render("admin/orders", { orders, active: "orders" });
  },

  changeProductOrderStatus: async function (req, res, next) {
    let orders = await carthelper.changeProductOrderStatus(req.body);
    res.json(orders);
  },
  getChartData: async function (req, res, next) {
    Order.aggregate([
      { $match: { "products.status": "delivered" } },
      {
        $project: {
          date: { $convert: { input: "$_id", to: "date" } },
          total: "$total",
        },
      },
      {
        $match: {
          date: {
            $lt: new Date(),
            $gt: new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 365),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$date" },
          total: { $sum: "$total" },
        },
      },
      {
        $project: {
          month: "$_id",
          total: "$total",
          _id: 0,
        },
      },
    ]).then((result) => {
      Order.aggregate([
        { $match: { "products.status": "delivered" } },
        {
          $project: {
            date: { $convert: { input: "$_id", to: "date" } },
            total: "$total",
          },
        },
        {
          $match: {
            date: {
              $lt: new Date(),
              $gt: new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 7),
            },
          },
        },
        {
          $group: {
            _id: { $dayOfWeek: "$date" },
            total: { $sum: "$total" },
          },
        },
        {
          $project: {
            date: "$_id",
            total: "$total",
            _id: 0,
          },
        },
        {
          $sort: { date: 1 },
        },
      ]).then((weeklyReport) => {
        res.status(200).json({ data: result, weeklyReport });
      });
    });
  },
  viewOrderDetails: async function (req, res, next) {
    const { orderId } = req.params;

    let user = req.session.user;

    let order = await carthelper.findOrderDetails(orderId);

    res.render("admin/orderDetails", { user, order, active: "orders" });
  },
  // salesReport: async function (req, res, next) {

  //     res.render('admin/salesReport',{active:'dashboard'})

  // },
  salesReport: async (req, res) => {
    // let details = await adminhelper.getSalesReport()
    let data = await adminhelper.monthlyReports();
    let daily = await adminhelper.dailyReports();
    let weekly = await adminhelper.weeklyReports();
    let yearly = await adminhelper.yearlyReports();
    for (value of data.currentOrders) {
      value.date = moment(value.placedDate).format("DD-MM-YYYY");
    }
    res.render("admin/salesreeport", {
      active: "dashboard",
      data,
      daily,
      weekly,
      yearly,
    });
  },
  report: async (req, res) => {
    let daily = await userhelper.dailyReport();
    let monthly = await userhelper.monthlyReport();
    let yearly = await userhelper.yearlyReport();
    res.json({ daily, monthly, yearly });
  },
  customReport: async (req, res) => {
    let start = req.body.starting;
    let end = req.body.ending;

    let data = await adminhelper.getReports(start, end);
    let daily = await adminhelper.dailyReports();
    let weekly = await adminhelper.weeklyReports();
    let yearly = await adminhelper.yearlyReports();
    for (value of data.currentOrders) {
      value.date = moment(value.placedDate).format("DD-MM-YYYY");
    }
    res.render("admin/salesreeport", {
      active: "dashboard",
      data,
      daily,
      weekly,
      yearly,
    });
  },

  couponsGet : async (req, res) => {
    let coupons = await offerHelpers.getAllCoupons()
    res.render("admin/coupons", { active: "coupons", coupons});
  },

  addCouponGet :  (req, res) => {
    res.render("admin/addCoupon", { active: "coupons" });
  },

  addCouponPost :  (req, res) => {
    offerHelpers.createCoupon(req.body).then((data)=>{
      req.flash("success", "Coupon Creation Successfull!");
      res.redirect('/admin/coupons')
    }).catch((err)=>{
      req.flash("error", err);
        res.redirect("/admin/addCoupon");
    })
  },

  couponEnable : (req,res)=>{
    const {id} = req.params
    offerHelpers.enableCoupon(id).then((response)=>{
      res.json({status:true})
    }).catch((err)=>{
      next(err)
    })
  },

  couponDisable : (req,res)=>{
    const {id} = req.params
    offerHelpers.disableCoupon(id).then((response)=>{
      res.json({status:true})
    }).catch((err)=>{
      next(err)
    })
  },

  editCouponGet : async(req,res)=>{
    const {id}=req.params
    const coupon = await Coupon.findById(id)
    coupon.validfrom = moment(coupon.valid_from).format('YYYY-MM-DD');
    coupon.validtill = moment(coupon.valid_till).format('YYYY-MM-DD');

    res.render("admin/editCoupon",{active:"coupons",coupon});
  },  

  editCouponPost :  (req, res) => {
    const {id}=req.params
    offerHelpers.editCoupon(req.body,id).then((data)=>{
      req.flash("success", "Coupon Updation Successfull!");

      res.redirect('/admin/coupons')
    }).catch((err)=>{
      req.flash("error", err);
        res.redirect(`/admin/editCoupon/${id}`);
    })
  },  
  
  deleteCoupon : (req,res)=>{
    try{
      offerHelpers.deleteCoupon(req.params.id).then((response) => {
        req.flash("success", "Coupon Deletion Successfull!");

        res.redirect('/admin/coupons')
      }).catch((err)=>{
       next(err);
    })
       }catch(err){
       next(err)
      }
  },
};
