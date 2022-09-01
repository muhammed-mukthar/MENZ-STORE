const router = require("express").Router();
const Product = require("../models/product");
const Category = require("../models/category");
const adminController=require('../controller/admincontroller')
const userController=require('../controller/usercontroller')
const productController=require('../controller/productcontroller')
const categoryController=require('../controller/categoryController')
const orderController=require('../controller/orderController')
const Order=require('../models/order')
const User=require('../models/user')
var ObjectId = require("mongoose").Types.ObjectId;

let orderServices=require('../services/orderServices')
/* -------------------------------- services -------------------------------- */
const fs = require("fs");


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

router.post("/login",adminController.adminlogin);

/* ------------------------------ //adminlogout ----------------------------- */

router.get("/logout",adminController.adminlogout );


/* -------------------------- //admin get all user -------------------------- */

router.get("/usermanagement", adminauth,userController.getallusers );




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






router.post("/addproduct",adminauth,productController.addproduct);

/* ---------------------------- //get editproduct --------------------------- */

router.get("/editproduct/:id", adminauth,productController.edit_productsPage );

/* -------------------------- //upload editproduct -------------------------- */

router.post("/editproduct/:id",adminauth, productController.editProduct);

/* ----------------------------- //deleteproduct ---------------------------- */

router.get("/deleteproduct/:id", adminauth,productController.deleteproduct );

/* ----------------------------- // get category ---------------------------- */



router.get("/category", adminauth, categoryController.categorypage);

/* ----------------------------- //post category ---------------------------- */

router.post("/category",adminauth,categoryController.addCategory );

/* ---------------------------- //delete category --------------------------- */

router.get('/category/:id',adminauth,categoryController.deleteCategory)


/* ------------------------------- order view page ------------------------------- */


router.get('/orders',adminauth,orderController.ordersPageAdmin)


/* --------------------------- order products info -------------------------- */

router.get('/orderedproducts/:id',adminauth,orderController.orderedProductsAdmin)


/* ----------------------------- order user info ---------------------------- */

router.get('/userinfo/:id',adminauth,orderController.orderUserInfo)


/* ------------------------------ order status ------------------------------ */

router.post('/orderstatus/:id',adminauth,orderController.adminChangeOrderStatus)

/* ------------------------- order details month sale ------------------------ */

router.get('/order-details',adminauth,orderController.monthsale)

/* ------------------------------- order stat ------------------------------- */


router.get('/orderstat',adminauth,orderController.Showstat)


module.exports = router;
