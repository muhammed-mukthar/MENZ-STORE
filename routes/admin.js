const router = require("express").Router();
const Product = require("../models/product");
const Category = require("../models/category");
const Banner = require("../models/banner");
const Coupon = require("../models/couponoffer");
const adminController = require("../controller/admincontroller");
const userController = require("../controller/usercontroller");
const productController = require("../controller/productcontroller");
const categoryController = require("../controller/categoryController");
const orderController = require("../controller/orderController");
const bannercontroller=require('../controller/bannerController')
const couponController=require('../controller/couponController')
const refferalController=require('../controller/referralController')
const Order = require("../models/order");
const User = require("../models/user");
var ObjectId = require("mongoose").Types.ObjectId;
let bannerServices = require("../services/bannerServices");
let orderServices = require("../services/orderServices");
let offerServices = require("../services/offerServices");
let couponServices = require("../services/CouponServices");
let referalService = require("../services/referalService");
/* -------------------------------- services -------------------------------- */
const fs = require("fs");
const { route } = require("./user");

/* ----------------------------- checking admin ----------------------------- */

const adminauth = (req, res, next) => {
  if (req.session.adminlog) {
    next();
  } else {
    res.redirect("/admin/login");
  }
};

/* ------------------------- //admin  dashboard load ------------------------ */

router.get("/", adminauth, adminController.AdminAashboardpage);

/* ------------------------------ //admin login ----------------------------- */
router.get("/login", adminController.loginpage);

/* --------------------------- //admin login post --------------------------- */

router.post("/login", adminController.adminlogin);

/* ------------------------------ //adminlogout ----------------------------- */

router.get("/logout",adminauth, adminController.adminlogout);

/* -------------------------- //admin get all user -------------------------- */

router.get("/usermanagement", adminauth, userController.getallusers);

/* --------------------------- //update blockuser --------------------------- */

router.get("/block/:id", adminauth, userController.blockuserupdate);

// router.put('/unblock/:id',async(req,res)=>{

/* ---------------------------- // update unblock --------------------------- */

router.get("/unblock/:id", adminauth, userController.unblokuserupdate);

/* ----------------------------- //get products ----------------------------- */

router.get("/products", adminauth, productController.allproducts);

/* ---------------------------- //get addproduct ---------------------------- */

router.get("/addproduct", adminauth, productController.addproductspage);

/* ------------------------------------ * ----------------------------------- */

/* ---------------------------- //post addproduct --------------------------- */

router.post("/addproduct", adminauth, productController.addproduct);

/* ---------------------------- //get editproduct --------------------------- */

router.get("/editproduct/:id", adminauth, productController.edit_productsPage);

/* -------------------------- //upload editproduct -------------------------- */

router.post("/editproduct/:id", adminauth, productController.editProduct);

/* ----------------------------- //deleteproduct ---------------------------- */

router.get("/deleteproduct/:id", adminauth, productController.deleteproduct);

/* --------------------------- get category offer --------------------------- */
router.get("/categoryoffer", adminauth, categoryController.categoryofferpage);

/* ---------------------------------- post category offer ---------------------------------- */

router.post("/categoryoffer", adminauth, categoryController.categoryoffer);

/* -------------------------- delet category offer -------------------------- */

router.get("/deletecategoryoffer/:id", adminauth, categoryController.deletecategoryoffer);

/* ----------------------------- // get category ---------------------------- */

router.get("/category", adminauth, categoryController.categorypage);

/* ----------------------------- //post category ---------------------------- */

router.post("/category", adminauth, categoryController.addCategory);

/* ---------------------------- //delete category --------------------------- */

router.get("/category/:id", adminauth, categoryController.deleteCategory);

/* ------------------------------- order view page ------------------------------- */

router.get("/orders", adminauth, orderController.ordersPageAdmin);

/* --------------------------- order products info -------------------------- */

router.get( "/orderedproducts/:id",adminauth,orderController.orderedProductsAdmin);

/* ----------------------------- order user info ---------------------------- */

router.get("/userinfo/:id", adminauth, orderController.orderUserInfo);

/* ------------------------------ order status ------------------------------ */

router.post(  "/orderstatus/:id", adminauth,  orderController.adminChangeOrderStatus);

/* ------------------------- order details sale ------------------------ */

router.get("/order-details", adminauth, orderController.monthsale);

/* ------------------------------- order stat monthly------------------------------- */

router.get("/orderstatmonth", adminauth, orderController.Showstat);

/* -------------------------- admin orders details -------------------------- */

/* ---------------------------- according to date --------------------------- */

router.post("/datestat", adminauth, orderController.datestat);

/* --------------------------- according to month --------------------------- */

router.post("/monthstat", adminauth, orderController.monthstat);

/* ----------------------------- yearly reports ----------------------------- */

router.post("/yearstat", adminauth, orderController.yearstat);

/* ---------------------------------add banner page--------------------------------- */

router.get("/bannermanage", adminauth,bannercontroller.bannermanage);


/* ------------------------------- add banner ------------------------------- */


router.post("/banner", adminauth,bannercontroller.addbanner);



/* ------------------------------ delete banner ----------------------------- */


router.get("/deletebanner/:id",adminauth, bannercontroller.deletebanner);



/* --------------------------------- coupon --------------------------------- */
router.get("/couponoffer", adminauth,couponController.couponoffer_Page);

/* ------------------------------- create coupon ------------------------------ */

router.post("/coupon", adminauth, couponController.create_coupon);

/* ------------------------------ delete coupon ----------------------------- */

router.get("/deletecoupon/:id", adminauth, couponController.delete_coupon);

/* ------------------------------- validcoupon ------------------------------ */
router.get("/validcoupon/:id", adminauth, couponController.valid_Coupon);

/* ------------------------------ invalidcoupon ----------------------------- */

router.get("/invalidcoupon/:id", adminauth, couponController.invalidcoupon);

/* --------------------------- referal offer page --------------------------- */
router.get("/referraloffer", adminauth,refferalController.referralPage);


/* --------------------------- referal offer form submit post --------------------------- */


router.post("/referraloffer", adminauth, refferalController.referraloffer);


/* -------------------------- delete referral offer ------------------------- */


router.get("/deletereferaloffer/:id", adminauth, refferalController.delete_referraloffer);


module.exports = router;
