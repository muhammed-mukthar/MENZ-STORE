const User = require("../models/user");
const Cart = require("../models/cart");
const Product = require("../models/product");
const Category = require("../models/category");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
dotenv.config();
var ObjectId = require("mongoose").Types.ObjectId;
const Coupon = require("../models/couponoffer");
const Address = require("../models/savedAddress");
const Wallet = require("../models/wallet");
const user = require("../models/user");
const category = require("../models/category");
const { pipeline } = require("stream");
const { $where } = require("../models/category");
const product = require("../models/product");
const cart = require("../models/cart");

const cartServices = require("../services/cartServices");
/* ------------------------------ display cart ------------------------------ */

exports.displaycart = async (req, res) => {
  try {

    if(req.session.user._id){
    let userId = req.session.user._id;
}
    let cart = await Cart.find({ user: userId });
    let categories = await Category.find();

    req.session.discountprice = false;

    /* ---------------------- //checking for category offer --------------------- */

    let offercategories = [];
    for (let j = 0; j < categories.length; j++) {
      if (categories[j].offer) {
        offercategories.push(categories[j]);
      }
    }
    /* ----------------------------------- // ----------------------------------- */

    let cartItems = await Cart.aggregate([
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
    ]);


    let fulltotal = await cartServices.calculate_total(userId);


    req.session.fulltotal = fulltotal;

    res.render("user/cart", {
      offercategories,
      cartItems,
      user,
      isuser: req.session.userlogin,
      fulltotal,
    });
  } catch (err) {
    console.log(err, "error in display cartt");
    res.redirect("/404");
  }
};

/* ----------------------------- CHANGE QUANTITY ---------------------------- */

exports.changequantity = async (req, res, next) => {
  try {
    let count = req.body.count;
    console.log(count);
    let quantity = parseInt(req.body.quantity);

    let quantitchange = quantity;
    let singleproductprice = parseInt(req.body.singleproductprice);
    let cartid = req.body.cart;
    let productId = req.body.product;
    let userId = req.session.user?._id;
    let subtotal = Number(req.body.subtotal);

    /* ---------------------- //checking for category offer --------------------- */
    let categories = await Category.find();
    let offercategories = [];
    for (let j = 0; j < categories.length; j++) {
      if (categories[j].offer) {
        offercategories.push(categories[j]);
      }
    }
    /* ----------------------------------- // ----------------------------------- */

    if (count == -1 && quantity == 1) {
      await Cart.updateOne(
        { _id: ObjectId(cartid) },
        {
          $pull: {
            products: {
              item: ObjectId(productId),
            },
          },
        }
      );

      let totals = await cartServices.calculate_total(userId);
      //  req.session.fulltotal=totals

      res.json({ removeproduct: true, totals });
    } else {
      await Cart.updateOne(
        {
          _id: ObjectId(req.body.cart),
          "products.item": ObjectId(req.body.product),
        },
        {
          $inc: { "products.$.quantity": Number(count) },
        }
      );

      let totals = await cartServices.calculate_total(userId);

      console.log(totals, "totals in cart fsdfds");
      //  req.session.fulltotal=totals

      res.json({ status: true, totals });
    }
  } catch (err) {
    res.redirect("/404");
  }
};

/* ------------------------------- add to cart ------------------------------ */

exports.addtocart = async (req, res) => {
  try {
    let userId = req.session.user._id;
    let productId = req.params.id;
    let productdetails = await Product.findOne({ _id: productId });
    let iscart = await Cart.findOne({ user: userId });
    let productadd = {
      item: ObjectId(productId),
      quantity: 1,
      categoryId: ObjectId(productdetails.categoryId),
      category: productdetails.category,
      productprice: productdetails.price,
    };
    if (iscart == null) {
      console.log(iscart + "is caty");
      let newcarts = new Cart({
        user: ObjectId(userId),
        products: [productadd],
      });
      let savedcart = await newcarts.save();
      console.log(savedcart, "new cart");
      req.session.isproductincart = false;
    } else {
      const alreadyExists = iscart.products.findIndex(
        (product) => product.item == productId
      );
      if (alreadyExists === -1) {
        const adding = await Cart.updateOne(
          { user: userId },
          { $push: { products: productadd } }
        );
        req.session.isproductincart = false;
        console.log(adding);
      } else {
        await Cart.updateOne(
          { user: ObjectId(userId), "products.item": ObjectId(productId) },
          {
            $inc: { "products.$.quantity": 1 },
          }
        );

        req.session.isproductincart = false;
        console.log("product already added to cart");
      }
    }
    res.redirect("/cart");
  } catch (err) {
    console.log(err + "error add to cart");
    res.redirect('/404')
  }
};
/* --------------------------- order chckout page --------------------------- */

exports.ordercheckout = async (req, res) => {
  try {
    let userId = req.session.user._id;
    let userdetails = await User.findOne({ _id: ObjectId(userId) });
    let savedAddress = await Address.find({ userId: ObjectId(userId) });
    let walletdetails = await Wallet.findOne({ userId: ObjectId(userId) });
    let availableCoupons = await Coupon.find({
      isDelete: { $ne: true },
      status: false,
    }).sort({ expires: -1 });

    let fulltotal = await cartServices.calculate_total(userId);
    let couponused = false;
    if (req.session.discountprice) {
      console.log(req.session.discountprice, "disocufsljkjfal;f");
      if (fulltotal > req.session.discountprice.min) {
        couponused = true;
        fulltotal = fulltotal - req.session.discountprice.offer;
      } else {
        couponused = false;
        // req.session.message = {
        //   type: "danger",
        //    message: "Coupon not valid on this order "
        // }
      }
    }
    res.render("user/checkout", {
      walletdetails,
      total: fulltotal,
      userId,
      isuser: req.session.userlogin,
      savedAddress,
      userdetails,
      availableCoupons,
      couponused,
      usedcoupon: req.session.discountprice,
    });
  } catch (err) {
    console.log(err + "error happenedd in order checkout");
    res.redirect('/404')
  }
};

/* ------------------------------- remove cart ------------------------------ */
exports.removeCart = async (req, res) => {
  try {
    let quantity = parseInt(req.body.quantity);
    let cartid = req.body.cart;
    let productId = req.body.product;
    await Cart.updateOne(
      { _id: ObjectId(cartid) },
      {
        $pull: {
          products: {
            item: ObjectId(productId),
          },
        },
      }
    );
    res.json((removeproduct = true));
  } catch (err) {
    console.log(err + "error occured in deleting cart");
    res.redirect('/404')
  }
};
