const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Cart = require("../models/cart");
const Product = require("../models/product");
const Category = require("../models/category");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
router.use(cookieParser());
const dotenv = require("dotenv");
dotenv.config();
var ObjectId = require("mongoose").Types.ObjectId;

const otpcontroller = require("../controller/otpcontroller");

const userController = require("../controller/usercontroller");
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

router.get("/cart",userauth, async (req, res) => {
  let userId = req.session.user?._id;




  let cartItems = await Cart.aggregate([
    {
      $match: { user: ObjectId(userId) },
    },
    {
      $unwind:'$products'
    },{
      $project:{
        item:'$products.item',
        quantity:"$products.quantity"
      }
    },{
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
    }
  ])

  // console.log(JSON.stringify(cartItems) + "gjhgkg");

  res.render("user/cart", { cartItems,user ,isuser: req.session.userlogin});
});


/* ------------------------- change product quantity ------------------------ */

router.post('/change-product-quantity',async(req,res,next)=>{
try{
let  count = req.body.count
  console.log(count);
let quantity = parseInt(req.body.quantity)
let cartid=req.body.cart;
let productId=req.body.product

if(count==-1 && quantity==1){


  await Cart.updateOne({_id:ObjectId(cartid)},{
    $pull:{
      products:{
        item:ObjectId(productId) 
      }
    }
  }).then(
    res.json({removeproduct:true})
  )
}else{

  await Cart.updateOne({_id:ObjectId(req.body.cart),'products.item':ObjectId(req.body.product )},
            {
                $inc:{'products.$.quantity':Number(count)}
            }).then(
              res.json(true)
            )

}
}catch(err){
  console.error("eoor"+err);

}


})


/* ------------------------------- add to cart ------------------------------ */

router.get("/add-to-cart/:id", userauth, async (req, res) => {
  try {
    let userId = req.session.user._id;
    let productId = req.params.id;

    let iscart = await Cart.findOne({ user: userId });

    let productadd = {
      item: ObjectId(productId),
      quantity: 1,
    };
    if (iscart == null) {
      console.log(iscart + "is caty");

      let newcart = new Cart({
        user: userId,
        products: [productadd],
      });
      newcart.save();
      req.session.isproductincart = false;
    } else {

     const alreadyExists = iscart.products.findIndex(product => product.item == productId)
      if (alreadyExists === -1) {
        const adding = await Cart.updateOne(
          { user: userId },
          { $push: { products: { item: ObjectId(productId), quantity: 1 } } }
        );
        req.session.isproductincart = false;
        console.log(adding);
      } else {
        await Cart.updateOne({"user":ObjectId(userId),"products.item":ObjectId(productId)},
        {
            $inc:{"products.$.quantity":1}
        }
        )
        
        req.session.isproductincart = false;
        console.log("product already added to cart");
      }
    }
    res.redirect("/users/cart");
  } catch (err) {
    console.log(err + "error add to cart");
  }
});

/* ------------------------------ order checkout ------------------------------ */
/* -------------------------------- checkout -------------------------------- */



router.get('/checkout',userauth,async(req,res)=>{
  let userId = req.session.user._id;
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
  console.log(total);
 let fulltotal= total[0].total
  res.render('user/checkout',{total:fulltotal})



})






/* ------------------------------------  ----------------------------------- */


/* ------------------------------- remove cart ------------------------------ */

router.post('/cart/remove',async(req,res)=>{
  try{
    let quantity = parseInt(req.body.quantity)
let cartid=req.body.cart;
let productId=req.body.product

    await Cart.updateOne({_id:ObjectId(cartid)},{
      $pull:{
        products:{
          item:ObjectId(productId)
        }
      }
    })
res.json(removeproduct =true)
  }catch(err){
    console.log(err+"error occured in deleting cart");
    

  }
})



/* ---------------------------- productview---------------------------- */

router.get("/productview/:id", async (req, res) => {
  const products = await Product.findById({ _id: req.params.id });

  let images = products.image;

  let imagelength = images.length;

  res.render("user/product-single", { products, imagelength });
});
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


router.get("/category/:id", async (req, res) => {
  try {
    let allcategories = await Category.find();
    let category = await Category.findOne({ _id: req.params.id });
    let categoryname = category.categoryname;

    let Prducts = await Product.find({
      category: categoryname,
    });
    if (Prducts) {
      res.render("user/shopCategory", {
        Products: Prducts,
        categories: allcategories,
      });
    } else {
      res.redirect("/users/shop");
    }
  } catch (err) {
    console.log(err + "error in category id");
  }
});



module.exports = router;
