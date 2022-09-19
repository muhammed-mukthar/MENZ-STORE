const express = require("express");
const router = express.Router();

const dotenv = require("dotenv");
dotenv.config();

const cartController = require("../controller/cartController");
const otpcontroller = require("../controller/otpcontroller");
const productController = require("../controller/productcontroller");
const userController = require("../controller/usercontroller");
const categoryController = require("../controller/categoryController");
const orderController=require('../controller/orderController')
const addressController=require('../controller/addressController');
const wishlistController=require('../controller/wishlistController')
const CouponController=require('../controller/couponController')


/* ------------------------ autentication middleware ------------------------ */


const userauth = (req, res, next) => {
  if (req.session.userlogin) {
    next();
  } else {
    res.redirect("/login");
  }
};




/* --------------------------------- paypal create order --------------------------------- */

router.post("/api/orders",userauth,orderController.paypal_createorder);
 
/* -------------------------- paypal capture order -------------------------- */

router.post("/api/orders/:orderId/capture",userauth, orderController.paypal_captureOrder);

/* ------------------------------------ # ----------------------------------- */




/* ------------------------------- //get login ------------------------------ */
router.get("/login", userController.userloginpage);

/* ------------------------------ //post login ------------------------------ */

router.post("/login", userController.userlogin);

/* --------------------------------- sendotp -------------------------------- */

router.post("/sendotp", otpcontroller.sendOTP);

/* ------------------------------- verify otp ------------------------------- */

router.post("/verifyotp", otpcontroller.verifyOtp);

/* ------------------------------ send otp page ----------------------------- */

router.get("/sendotp", otpcontroller.send_otp_page);

/* ----------------------------- verify otp page ---------------------------- */

router.get("/verifyotp", otpcontroller.verify_otp_page);

/* ------------------------------- resend otp ------------------------------- */

router.post("/resend", otpcontroller.resend_otp);

/* -------------------------------- //logout -------------------------------- */

router.get("/logout",userauth, userController.userLogout);

/* -------------------------------- user home ------------------------------- */

router.get("/",userController.userhomepage);

/* ---------------------------------get signup --------------------------------- */

router.get("/signup", userController.userSignup);

/* -------------------------------- //signup  post-------------------------------- */
router.post("/signup", userController.signup);

/* -------------------------------- 404 page -------------------------------- */

router.get('/404',userController.errorpage)

/* -------------------------------- wishlist -------------------------------- */

router.get('/wishlist',userauth,wishlistController.wishlist_Page)

/* ----------------------------- add to wishlist ---------------------------- */
router.get('/add-to-wishlist/:id',userauth,wishlistController.add_to_wishlist)

/* ----------------------------- delete wishlist ---------------------------- */

router.post('/wishlist/remove',userauth,wishlistController.remove_wishlist)

/* ------------------- remove wishlist when added to cart ------------------- */

router.post('/wishlist/delete',userauth,wishlistController.delete_wishlist_cart)


/* ------------------------------ cart display ------------------------------ */

router.get("/cart", userauth, cartController.displaycart);

/* ------------------------- change product quantity ------------------------ */

router.post("/change-product-quantity",userauth, cartController.changequantity);

/* ------------------------------- add to cart ------------------------------ */

router.get("/add-to-cart/:id", userauth, cartController.addtocart);

/* ------------------------------ order checkout ------------------------------ */
/* -------------------------------- checkout -------------------------------- */

router.get("/checkout", userauth, cartController.ordercheckout); 



/* ------------------------------- remove cart ------------------------------ */

router.post("/cart/remove",userauth, cartController.removeCart);

/* ---------------------------------- order placed --------------------------------- */

router.post("/place-order",userauth, orderController.placeOrder);

/* ------------------------------ verifypayment razorpay ----------------------------- */


router.post('/verifypayment',userauth,orderController.razorVerifyPayment)
/* ----------------------------- get orderplacedpage ----------------------------- */

router.get("/orderplaced", userauth, orderController.placeOrderpage);

/* ----------------------------- order cancelled ---------------------------- */

router.post("/ordercancel",userauth, orderController.cancelOrder);

/* ------------------------ ordered products details ------------------------ */

router.get("/orderproducts/:id",userauth, orderController.orderedProducts);

/* ----------------------------- goto order page ---------------------------- */

router.get("/orders", userauth, orderController.orderPage);

/* ---------------------------- productview---------------------------- */

router.get("/productview/:id", productController.productviewuser);
/* ---------------------------------- shop ---------------------------------- */

router.get("/shop", productController.displayshop);

/* ---------------------------- category display ---------------------------- */

router.get("/category/:id", categoryController.displaybycategory);

/* ------------------------------ user profilepage ------------------------------ */

router.get("/userprofile", userauth, userController.userProfilePage);

/* ----------------------------- change password ---------------------------- */

router.get("/changepassword", userauth, userController.changePasswordPage);

/* change user password check current password is correct

 if it is correct update the password and bcrypt */
router.post("/changepassword", userauth, userController.changePassword);


/* ------------------------------ edit profile ------------------------------ */

router.post("/editprofile", userauth, userController.editProfile);

/* ------------------------------ save address user ------------------------------ */


router.post('/saveaddress',userauth,addressController.saveAddress)

/* -------------------------- save address checkout ------------------------- */
router.post('/checkoutsaveaddress',userauth,addressController.saveaddressCheckout )


/* ----------------------------- remove address ----------------------------- */


router.post('/removeaddress',userauth,addressController.removeAddress)

/* ------------------------------ apply coupon ------------------------------ */
router.post('/applycoupon',userauth,CouponController.applyCoupon)

module.exports = router;
