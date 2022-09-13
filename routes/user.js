const express = require("express");
const router = express.Router();
/* -------------------------------- models -------------------------------- */
const User = require("../models/user");
const Cart = require("../models/cart");
const Product = require("../models/product");
const Category = require("../models/category");
const Order = require("../models/order");
const Address=require('../models/savedAddress')
const WishList=require('../models/wishlist')
const Coupon=require('../models/couponoffer')
/* ------------------------------------*  ----------------------------------- */
/* ---------------------------- helpers/services ---------------------------- */
let orderServices=require('../services/orderServices')
let wishlistServices=require('../services/wishlistServices')
let couponServices=require('../services/CouponServices')


/* ------------------------------------ * ----------------------------------- */

const paypal = require('../paypal')
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
router.use(cookieParser());
const dotenv = require("dotenv");
dotenv.config();
var ObjectId = require("mongoose").Types.ObjectId;
const cartController = require("../controller/cartController");
const otpcontroller = require("../controller/otpcontroller");
const productController = require("../controller/productcontroller");
const userController = require("../controller/usercontroller");
const categoryController = require("../controller/categoryController");
const orderController=require('../controller/orderController')
const addressController=require('../controller/addressController');
const CouponServices = require("../services/CouponServices");
const userauth = (req, res, next) => {
  if (req.session.userlogin) {
    next();
  } else {
    res.redirect("/users/login");
  }
};




/* --------------------------------- paypal create order --------------------------------- */

router.post("/api/orders",userauth, async (req, res) => {
  const order = await paypal.createOrder();
  res.json(order);
});
 
/* -------------------------- paypal capture order -------------------------- */

router.post("/api/orders/:orderId/capture",userauth, async (req, res) => {
  const { orderId } = req.params;
  const captureData = await paypal.capturePayment(orderId);
  res.json(captureData);
});

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



/* -------------------------------- wishlist -------------------------------- */

router.get('/wishlist',userauth,(req,res)=>{
  let userId = req.session.user?._id;

  wishlistServices.getproducts(userId).then((wishlistItems)=>{
    console.log(wishlistItems);
    res.render('user/wishlist',{wishlistItems,userId,  isuser: req.session.userlogin,})
  })
})

/* ----------------------------- add to wishlist ---------------------------- */
router.get('/add-to-wishlist/:id',userauth,async(req,res)=>{
  try {
    let userId = req.session.user._id;
    let productId = req.params.id;

    let isWishList = await WishList.findOne({ user: userId });

    let productadd = {
      item: ObjectId(productId),
      quantity: 1,
    };
    if (isWishList == null) {
    

      let newWishList = new WishList({
        user: userId,
        products: [productadd],
      });
      newWishList.save();
     
    } else {

     const alreadyExists = isWishList.products.findIndex(product => product.item == productId)
      if (alreadyExists === -1) {
        const addWishList = await WishList.updateOne(
          { user: userId },
          { $push: { products: { item: ObjectId(productId), quantity: 1 } } }
        );
    
        console.log(addWishList);
      } else {

      }
    }
    res.redirect("/users/wishlist");
  } catch (err) {
    console.log(err + "error add to wishlist");
  }
}
  
)

/* ----------------------------- delete wishlist ---------------------------- */

router.post('/wishlist/remove',(req,res)=>{
  
  let wishlistId=req.body.wishlist;
  let productId=req.body.product
  let userId=req.body.user
  console.log(wishlistId,productId,userId);
  wishlistServices.deleteWishlistproduct(wishlistId,productId,userId).then(()=>{
    res.json(removeproduct =true)
  })

})

/* ------------------- remove wishlist when added to cart ------------------- */

router.post('/wishlist/delete',async(req,res)=>{
 
  let wishlistId=req.body.wishlist
  wishlistServices.deleteWishlist(wishlistId).then(()=>{
    res.json(removewishlist =true)
  })

})


/* ------------------------------ cart display ------------------------------ */

router.get("/cart", userauth, cartController.displaycart);

/* ------------------------- change product quantity ------------------------ */

router.post("/change-product-quantity",userauth, cartController.changequantity);

/* ------------------------------- add to cart ------------------------------ */

router.get("/add-to-cart/:id", userauth, cartController.addtocart);

/* ------------------------------ order checkout ------------------------------ */
/* -------------------------------- checkout -------------------------------- */

router.get("/checkout", userauth, cartController.ordercheckout); 

/* ------------------------------------  ----------------------------------- */

/* ------------------------------- remove cart ------------------------------ */

router.post("/cart/remove",userauth, cartController.removeCart);

/* ---------------------------------- order placed --------------------------------- */
/*


*/
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
router.post('/applycoupon',(req,res)=>{
    
  let coupon=req.body.coupon
  let userId = req.session.user?._id;
  CouponServices.applyCoupon(coupon,userId).then((couponexist)=>{
    req.session.discountprice=couponexist
    res.redirect('back')
  }).catch((err)=>{
    req.session.message = {
      message: err,
    };
    req.session.discountprice=false
    res.redirect('back')
  })
})

module.exports = router;
