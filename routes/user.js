const express = require("express");
const router = express.Router();
/* -------------------------------- models -------------------------------- */
const User = require("../models/user");
const Cart = require("../models/cart");
const Product = require("../models/product");
const Category = require("../models/category");
const Order = require("../models/order");
const Address=require('../models/savedAddress')
/* ------------------------------------*  ----------------------------------- */
/* ---------------------------- helpers/services ---------------------------- */
let orderServices=require('../services/orderServices')


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

const { pipeline } = require("stream");
const { $where } = require("../models/category");

const userauth = (req, res, next) => {
  if (req.session.userlogin) {
    next();
  } else {


    res.redirect("/users/login");
  }
};






router.post("/api/orders", async (req, res) => {
  const order = await paypal.createOrder();
  res.json(order);
});

router.post("/api/orders/:orderId/capture", async (req, res) => {
  const { orderId } = req.params;
  const captureData = await paypal.capturePayment(orderId);
  res.json(captureData);
});

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
  req.session.user = false;
  res.redirect("/users");
});

/* -------------------------------- user home ------------------------------- */

router.get("/", async (req, res) => {
  let newproducts = await Product.find().sort({ createdAt: -1 }).limit(3);
  console.log(newproducts);
  if (req.session.userlogin) {
    let userid = req.session.user._id;
    console.log(userid);
    let cartdetails = await Cart.findOne({ user: userid });
    let cartcount = cartdetails?.products.length;
    res.render("user/home", {
      isuser: req.session.userlogin,
      cartcount,
      newproducts,
    });
  } else {
    res.render("user/home", {
      isuser: req.session.userlogin,
      cartcount: "0",
      newproducts,
    });
  }
});

/* ---------------------------------get signup --------------------------------- */

router.get("/signup", (req, res) => {
  res.render("user/signup");
});

/* -------------------------------- //signup  post-------------------------------- */
router.post("/signup", userController.signup);

/* ------------------------------ cart display ------------------------------ */

router.get("/cart", userauth, cartController.displaycart);

/* ------------------------- change product quantity ------------------------ */

router.post("/change-product-quantity", cartController.changequantity);

/* ------------------------------- add to cart ------------------------------ */

router.get("/add-to-cart/:id", userauth, cartController.addtocart);

/* ------------------------------ order checkout ------------------------------ */
/* -------------------------------- checkout -------------------------------- */

router.get("/checkout", userauth, cartController.ordercheckout); 

/* ------------------------------------  ----------------------------------- */

/* ------------------------------- remove cart ------------------------------ */

router.post("/cart/remove", cartController.removeCart);

/* ---------------------------------- order placed --------------------------------- */
/*


*/
router.post("/place-order", async (req, res) => {
  try {
    let userId = req.body.userId;
    
    let cart = await Cart.findOne({ user: ObjectId(userId) });
    let total = await Cart.aggregate([
      {
        $match: { user: ObjectId(userId) },
      },
      {
        $unwind: "$products",
      },
      {
        $project: {
          item: "$products.item",
          quantity: "$products.quantity",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "item",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $project: {
          item: 1,
          quantity: 1,
          product: { $arrayElemAt: ["$product", 0] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ["$quantity", "$product.price"] } },
        },
      },
    ]);
    let products = cart?.products;
    let totalPrice = total[0]?.total;
    let status = req.body["paymentmethod"] === "cod" ? "placed" : "pending";
let order = req.body;
console.log("order",JSON.stringify(order))


let deliverydetails={}

if(order.savedAddress){
  let savedAddress=JSON.parse(req.body.savedAddress) 
  
   deliverydetails = {
    mobile: order.phone,
    address1: savedAddress.address1,
    address2: savedAddress.address2,
    pincode: savedAddress.pincode,
    city: savedAddress.city,
  };
 
}else{
  deliverydetails = {
      mobile: order.phone,
      address1: order.address1,
      address2: order.address2,
      pincode: order.postcode,
      city: order.town,
    };
}


let ordersave = new Order({
  deliveryDetails: deliverydetails,
  userId: ObjectId(order.userId),
  paymentMethod: order["paymentmethod"],
  products: products,
  totalAmount: totalPrice,
  status: status,
  date: new Date(),
});

let savedOrder=  await ordersave.save();
console.log(savedOrder+"fdkjkhfjfds",savedOrder._id);
if(  req.body["paymentmethod"] === "cod"){
   res.json({ codSuccess: true });
}else{
  orderServices.generateRazorpay(savedOrder._id,totalPrice).then((response)=>{
    res.json(response)
  })
}
       
    await Cart.deleteOne({ user: ObjectId(order.userId) });
  } catch (err) {
    console.log(err + "error happened while placing order");
  }
});

/* ------------------------------ verifypayment razorpay ----------------------------- */


router.post('/verifypayment',(req,res)=>{
  
    console.log(req.body,"verify paymentfghjh");
    orderServices.verifyPayment(req.body).then(()=>{

      orderServices.changePaymentStatus(req.body['order[receipt]']).then(()=>{
        console.log('payment successfull');
        res.json({status:true})
      })
    }).catch((err)=>{
      console.log('verify payment post');
      res.json({status: false,errMsg:''})
    })

 
})




/* ----------------------------- get orderplacedpage ----------------------------- */

router.get("/orderplaced", userauth, (req, res) => {
  res.render("user/orderplaced");
});

/* ----------------------------- order cancelled ---------------------------- */

router.post("/ordercancel", async (req, res) => {
  let id = req.body.orderId;
  let updated = await Order.updateOne(
    { _id: ObjectId(id) },
    {
      $set: {
        status: "cancelled",
      },
    }
  );
  console.log(updated);
  // res.redirect('/users/orders')
  res.json("res");
});

/* ------------------------ ordered products details ------------------------ */

router.get("/orderproducts/:id", async (req, res) => {
  let orderId = req.params.id;
  let orderdItems = await Order.aggregate([
    {
      $match: { _id: ObjectId(orderId) },
    },
    {
      $unwind: "$products",
    },
    {
      $project: {
        item: "$products.item",
        quantity: "$products.quantity",
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "item",
        foreignField: "_id",
        as: "product",
      },
    },
    {
      $project: {
        item: 1,
        quantity: 1,
        product: { $arrayElemAt: ["$product", 0] },
      },
    },
  ]);

  res.render("user/orderedProducts", {
    orderdItems,
    isuser: req.session.userlogin,
  });
});

/* ----------------------------- goto order page ---------------------------- */

router.get("/orders", userauth, async (req, res) => {
  let userId = req.session.user._id;

  let orders = await Order.find({ userId: ObjectId(userId) }).sort({
    date: -1,
  });

  let date = orders[0].date.toLocaleDateString();
  console.log(date);

  res.render("user/orderdetails", { orders, isuser: req.session.userlogin });
});

/* ---------------------------- productview---------------------------- */

router.get("/productview/:id", productController.productviewuser);
/* ---------------------------------- shop ---------------------------------- */

router.get("/shop", productController.displayshop);

/* ---------------------------- category display ---------------------------- */

router.get("/category/:id", categoryController.displaybycategory);

/* ------------------------------ user profile ------------------------------ */

router.get("/userprofile", userauth, async (req, res) => {
  let userId = req.session.user._id;
  let userdetails = await User.findOne({ _id: userId })

  let saveaddress=await Address.find({userId:ObjectId(userId)})
  console.log(saveaddress);
  
  res.render("user/userdetails", {
    userdetails,
    isuser: req.session.userlogin,
    saveaddress
  });
});

/* ----------------------------- change password ---------------------------- */

router.get("/changepassword", userauth, (req, res) => {
  res.render("user/changePassword", { isuser: req.session.userlogin });
});

/* change user password check current password is correct

 if it is correct update the password and bcrypt */
router.post("/changepassword", userauth, async (req, res) => {
  let userId = req.session.user._id;
  let enteredPassword = req.body.currentPassword;
  let newPassword = req.body.NewPassword;
  let userdetails = await User.findOne({ _id: userId });
  console.log(userdetails + "user details here");
  let verifypassword = bcrypt.compareSync(
    enteredPassword,
    userdetails.password
  ); //comparing changed password and new password is same

  console.log(verifypassword + "user password checking");

  if (verifypassword) {
    if (enteredPassword == newPassword) {
      req.session.message = {
        type: "danger",
        message: "cannot type old password",
      };
      res.redirect("/users/changePassword");
    } else {
      await User.updateOne(
        { _id: ObjectId(userId) },
        {
          $set: {
            password: bcrypt.hashSync(newPassword, 10),
          },
        }
      );

      req.session.message = {
        type: "success",
        message: "password changed",
      };

      res.redirect("/users/changePassword");
    }
  } else {
    req.session.message = {
      type: "danger",
      message: "password is not correct",
    };
    res.redirect("/users/changePassword");
  }

  // res.render('user/changePassword')
});








/* ------------------------------ edit profile ------------------------------ */

router.post("/editprofile", userauth, async (req, res) => {
  try {
    let userId = req.session.user._id;
    let changed_email = req.body.email;
    let changed_name = req.body.name;
    let changed_phone = req.body.phone;
    let password=req.body.password

    let userdetails = await User.findOne({ _id: ObjectId(userId) });
  
    let verifypassword = bcrypt.compareSync(
      password,
      userdetails.password
    );

    console.log(changed_email+"changed email"+userId+"userid"+changed_name+"changed name"+"changed phone"+changed_phone);
if(verifypassword){
  
  await User.updateOne(
    { _id:ObjectId(userId)  },
    {
      $set: {
        name: changed_name,
        email: changed_email,
        phone: changed_phone,
      },
    }
  );
  req.session.message = {
    type: "success",
    message: "userdetails updated",
  };
  res.redirect("/users/userprofile");
}else{
  req.session.message = {
    type: "danger",
    message: "invalid  password",
  };
  res.redirect("/users/userprofile");
}


  } catch (err) {
    console.log(err + "error at editing profile details");
  }
});

/* ------------------------------ save address ------------------------------ */


router.post('/saveaddress',userauth,async(req,res)=>{
  let address1=req.body.address1
  let address2=req.body.address2
  let town=req.body.town
  let postcode=req.body.postcode
  let userId = req.session.user._id
console.log(address1+"address1"+address2+"address2"+town+"town "+postcode+"post code"+userId+"user id");
  let savedaddress= new Address({
    userId:ObjectId(userId),
    address1:address1,
    address2 :address2,
    city:town,
    pincode:postcode
})
await savedaddress.save()
res.redirect("/users/userprofile");
})

/* ----------------------------- remove address ----------------------------- */


router.post('/removeaddress',userauth,async(req,res)=>{
  
try{
  let addressId=req.body.AddressId
  await Address.deleteOne({_id:addressId})
  res.json('removed')
}catch(err){
  console.log(err+"error happened remove address");
}

})


module.exports = router;
