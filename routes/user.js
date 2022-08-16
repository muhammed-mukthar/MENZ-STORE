const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Product = require("../models/product");
const bcrypt = require("bcrypt");
const crypto=require('crypto')
const cookieParser=require('cookie-parser')
router.use(cookieParser())
const dotenv = require("dotenv");
dotenv.config();

const otpcontroller=require("../controller/otpcontroller");

const userController = require("../controller/usercontroller");

const userauth = (req, res, next) => {
  if (req.session.userlogin) {
    next();
  } else {
    res.redirect("/users/login");
  }
};

/* ------------------------------- //get login ------------------------------ */
router.get("/login", userController.userloginpage);

/* ------------------------------ //post login ------------------------------ */

router.post("/login", userController.userlogin);












/* --------------------------------- sendotp -------------------------------- */



router.post('/sendotp',otpcontroller.sendOTP)


/* ------------------------------- verify otp ------------------------------- */

router.post('/verifyotp',otpcontroller.verifyOtp)

/* ------------------------------ send otp page ----------------------------- */

router.get('/sendotp',otpcontroller.send_otp_page)

/* ----------------------------- verify otp page ---------------------------- */



router.get('/verifyotp',otpcontroller.verify_otp_page)

/* ------------------------------- resend otp ------------------------------- */

router.post('/resend',otpcontroller.resend_otp)











/* -------------------------------- //logout -------------------------------- */

router.get("/logout", (req, res) => {
  req.session.userlogin = false;
  res.redirect("/");
});

/* -------------------------------- user home ------------------------------- */

router.get("/", (req, res) => {
  res.render("user/home", { isuser: req.session.userlogin });
});

/* ---------------------------------get signup --------------------------------- */

router.get("/signup", (req, res) => {
  res.render("user/signup");
});



/* -------------------------------- //signup  post-------------------------------- */
router.post("/signup", userController.signup);



router.get("/cart", (req, res) => {
  res.render("user/cart", { isuser: req.session.userlogin });
});

router.get("/shop", async (req, res) => {
  const allProduct = await Product.find();
  res.render("user/shop", {
    products: allProduct,
    isuser: req.session.userlogin,
  });
})

module.exports = router;
