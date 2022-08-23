const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Cart = require("../models/cart");
const Product = require("../models/product");
const Category = require("../models/category");
const Order=require('../models/order')
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
router.use(cookieParser());
const dotenv = require("dotenv");
dotenv.config();
var ObjectId = require("mongoose").Types.ObjectId;

const cartController=require('../controller/cartController')
const otpcontroller = require("../controller/otpcontroller");
const productController=require('../controller/productcontroller')
const userController = require("../controller/usercontroller");
const categoryController=require('../controller/categoryController')
const user = require("../models/user");
const category = require("../models/category");
const { pipeline } = require("stream");
const { $where } = require("../models/category");
const product = require("../models/product");

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

router.get("/logout", (req, res) => {
  req.session.userlogin = false;
  res.redirect("/users");
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





/* ------------------------------ cart display ------------------------------ */

router.get("/cart",userauth, cartController.displaycart);


/* ------------------------- change product quantity ------------------------ */

router.post('/change-product-quantity',cartController.changequantity)


/* ------------------------------- add to cart ------------------------------ */

router.get("/add-to-cart/:id", userauth,cartController.addtocart );

/* ------------------------------ order checkout ------------------------------ */
/* -------------------------------- checkout -------------------------------- */



router.get('/checkout',userauth,cartController.ordercheckout)






/* ------------------------------------  ----------------------------------- */


/* ------------------------------- remove cart ------------------------------ */

router.post('/cart/remove',cartController.removeCart)




/* ---------------------------------- order --------------------------------- */

router.post('/place-order',async(req,res)=>{

  try{
    let userId=req.body.userId
    console.log(userId);
    console.log(req.body);
  let cart= await Cart.findOne({user:ObjectId(userId)})
  let total=await Cart.aggregate([
    {
      $match:{user:ObjectId(userId)}
    },
    {
      $unwind:'$products'
    },{
      $project:{
        item:'$products.item',
        quantity:'$products.quantity'
      }
    },
    {
      $lookup:{
        from:'products',
        localField:'item',
        foreignField:'_id',
        as:'product'
    }
  },
  {
      $project: {
        item: 1,
        quantity: 1,
        product: { $arrayElemAt: ["$product", 0] },
      }, 
  },
  {
    $group:{
      _id:null,
      total:{$sum:{$multiply:['$quantity','$product.price']}}
    }
  }
  ])
  let products=cart?.products
  console.log(products);
  let order=req.body
  let totalPrice=total[0].total
  // let orders=req.body
  let status=req.body['paymentmethod']==='cod'?'placed':'pending'
  
 let   deliverydetails={
      mobile:order.phone,
      address:order.address1,
      pincode:order.postcode,
      city:order.town
    }

  let ordersave=new Order({
    deliveryDetails:deliverydetails,
    userId:ObjectId(order.userId),
    paymentMethod:order['paymentmethod'],
    products:products,
    totalAmount:totalPrice,
    status:status,
    date: new Date()
  })
  res.json({status:true})

  await ordersave.save()

  await Cart.deleteOne({user:ObjectId(order.userId)})
  }catch(err){
    console.log(err+"error happened while placing order");
  }
 
})



















/* ---------------------------- productview---------------------------- */

router.get("/productview/:id",productController.productviewuser);
/* ---------------------------------- shop ---------------------------------- */

router.get("/shop", async (req, res) => {
  try {
    const categories = await Category.find();
    const allProduct = await Product.find();

    res.render("user/shop", {
      products: allProduct,
      isuser: req.session.userlogin,
      categories,
    });
  } catch (err) {
    console.log(err + "shop");
  }
});







/* ---------------------------- category display ---------------------------- */


router.get("/category/:id", categoryController.displaybycategory);



module.exports = router;
