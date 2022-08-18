const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Cart = require("../models/cart");
const Product = require("../models/product");
const bcrypt = require("bcrypt");
const crypto=require('crypto')
const cookieParser=require('cookie-parser')
router.use(cookieParser())
const dotenv = require("dotenv");
dotenv.config();
var ObjectId = require('mongoose').Types.ObjectId;

const otpcontroller=require("../controller/otpcontroller");

const userController = require("../controller/usercontroller");
const user = require("../models/user");

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



router.get('/cart',async(req,res)=>{
  let userId=req.session.user?._id;


  let cartItems = await Cart.aggregate([
    {
        $match:{user:ObjectId(userId)}
    },
    {
        $unwind:'$products'
    },
    {
        $project:{
            item:'$products.item',
            quantity:'$products.quantity'
        }
    },
    {
        $lookup:{
            from:'productdbs',
            localField:'item',
            foreignField:'_id',
            as:'product'
        }
    },
    {
        $project:{
            item: 1, quantity: 1 ,product: { $arrayElemAt: ['$product',0]}
        }
    }
])

  console.log(cartItems);

  res.render('user/cart')
})




router.get("/add-to-cart/:id",userauth, async(req, res) => {
  try{
  
let  userId= req.session.user._id
let  productId=req.params.id
console.log(userId+"user id"+productId+"cart id");
let productObj={
  item:ObjectId(productId),
  quantity:1
}
 
  let usercart=await Cart.findOne({user:userId})
  console.log(usercart+"user cart");
  if(usercart){
  await  Cart.updateOne({user:userId},{
 
      $push:{products:productObj}
 
  })

  }else{
    let newCart=await new Cart({
      user:userId,
    products: [productObj]
    })
    newCart.save()
  }
  }catch(err){
    console.log(err +'add to cart');
  }


 
  
  // res.render("user/cart/:id", { isuser: req.session.userlogin });
});







router.get('/productview/:id',async(req,res)=>{
      const products=await Product.findById({_id:req.params.id})
  res.render('user/product-single',{products});

})

router.get("/shop", async (req, res) => {
  try{
const allProduct = await Product.find();
  res.render("user/shop", {
    products: allProduct,
    isuser: req.session.userlogin,
  });
  }catch(err){
    console.log(err+"shop");
  }
  
})





module.exports = router;
