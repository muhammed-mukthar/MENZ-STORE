const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Cart = require("../models/cart");
const Product = require("../models/product");
const Category = require("../models/category");
const Order = require("../models/order");
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
    console.log(userId);
    console.log(req.body);
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
    console.log(products);
    let order = req.body;
    let totalPrice = total[0]?.total;
    let status = req.body["paymentmethod"] === "cod" ? "placed" : "pending";

    let deliverydetails = {
      mobile: order.phone,
      address1: order.address1,
      address2: order.address2,
      pincode: order.postcode,
      city: order.town,
    };

    let ordersave = new Order({
      deliveryDetails: deliverydetails,
      userId: ObjectId(order.userId),
      paymentMethod: order["paymentmethod"],
      products: products,
      totalAmount: totalPrice,
      status: status,
      date: new Date(),
    });
    res.json({ status: true });

    await ordersave.save();

    await Cart.deleteOne({ user: ObjectId(order.userId) });
  } catch (err) {
    console.log(err + "error happened while placing order");
  }
});

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

router.get("/userprofile", (req, res) => {
  res.render("user/userdetails");
});

module.exports = router;
