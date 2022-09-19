/* -------------------------------- models -------------------------------- */
const User = require("../models/user");
const Cart = require("../models/cart");
const Product = require("../models/product");
const Category = require("../models/category");
const Order = require("../models/order");
const Address = require("../models/savedAddress");
const Couponused = require("../models/usedcoupon");

/* ------------------------------------*  ----------------------------------- */

/* ---------------------------- helpers/services ---------------------------- */

let walletServices = require("../services/walletServices");
let ReferalServices = require("../services/referalService");
let orderServices = require("../services/orderServices");
let wishlistServices = require("../services/wishlistServices");
let couponServices = require("../services/CouponServices");
let cartServices = require("../services/cartServices");
let paypalServices = require("../services/paypalService");

/* ------------------------------------ * ----------------------------------- */

/* ------------------------------------ * ----------------------------------- */

const bcrypt = require("bcrypt");
const crypto = require("crypto");

const dotenv = require("dotenv");
const { query } = require("express");
dotenv.config();
var ObjectId = require("mongoose").Types.ObjectId;

/* ------------------------- display placeorder page  ------------------------ */

exports.placeOrderpage = (req, res) => {
  try {
    res.render("user/orderplaced");
  } catch (err) {
    console.log(err, "error happened while displaying orderPage");
    res.redirect('/404')
  }
};

/* ------------------------------- place order ------------------------------ */

exports.placeOrder = async (req, res) => {
  try {
    
    let userId = req.body.userId;

    let cart = await Cart.findOne({ user: ObjectId(userId) });

    let products = cart?.products;

    let totalPrice = await cartServices.calculate_total(userId);

  
    
    // console.log(totalPrice, typeof totalPrice, "totalPrice in placeorder");
    if (req.session.discountprice) {
      totalPrice = totalPrice - req.session.discountprice.offer;
      await Couponused.updateOne(
        { userId: userId },
        { $set: { totalspend: totalPrice } }
      );
    }

    let status = req.body["paymentmethod"] === "cod" ? "placed" : "pending";
    let order = req.body;
    console.log("order", JSON.stringify(order));

    let deliverydetails = {};

    if (order.savedAddress) {
      let savedAddress = JSON.parse(req.body.savedAddress);

      deliverydetails = {
        
        address1: savedAddress.address1,
        address2: savedAddress.address2,
        pincode: savedAddress.pincode,
        city: savedAddress.city,
      };
    } else {
      deliverydetails = {
     
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

    let savedOrder = await ordersave.save();
    console.log(savedOrder + "fdkjkhfjfds", savedOrder._id);
    if (req.body["paymentmethod"] === "cod") {
      res.json({ codSuccess: true });
    } else if (req.body["paymentmethod"] === "RazorPay") {
      orderServices
        .generateRazorpay(savedOrder._id, totalPrice)
        .then((response) => {
          res.json(response);
        }).catch((err)=>{res.redirect('/admin/orderplaced')});
    } else if (req.body["paymentmethod"] === "paypal") {
      orderServices.changePaymentStatus(savedOrder._id).then((response) => {
        res.json({ paypalSuccess: true });
      });
    } else if (req.body["paymentmethod"] === "wallet") {
      orderServices.changePaymentStatus(savedOrder._id).then(() => {
        walletServices.wallet_payment(userId, totalPrice).then(() => {
          res.json({ codSuccess: true });
        });
      });
    }
    await Cart.deleteOne({ user: ObjectId(order.userId) });
  
  } catch (err) {
    console.log(err + "error happened while placing order");
    res.redirect('/404')
  }
};

/* --------------------------- verify razorpayment -------------------------- */

exports.razorVerifyPayment = (req, res) => {
  try {
    console.log(req.body, "verify paymentfghjh");
    orderServices
      .verifyPayment(req.body)
      .then(() => {
        orderServices
          .changePaymentStatus(req.body["order[receipt]"])
          .then(() => {
            console.log("payment successfull");
            res.json({ status: true });
          });
      })
      .catch((err) => {
        console.log("verify payment post");
        res.redirect('/404');
      });
  } catch (err) {
    console.log(err, "error happened while verifying razor Payment");
    res.redirect('/404')
  }
};

/* ------------------------------ cancel order ------------------------------ */

exports.cancelOrder = async (req, res) => {
  try {
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
    walletServices.refund_order_status(id).then(() => {
      res.json("res");
    });
  } catch (err) {
    console.log(err, "error happened while cancel order");
    res.redirect('/404')
  }
};

/* ----------------------- ordered product admin view ----------------------- */

exports.orderedProductsAdmin = async (req, res) => {
  try {
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
    console.log("this is make ", orderdItems);
    res.render("admin/orderproducts", { orderdItems });
  } catch (err) {
    console.log(
      err,
      "error happened while viewing ordered products in admin side"
    );
    res.redirect('/404')
  }
};

/* ------------------------ ordered products details ------------------------ */

exports.orderedProducts = async (req, res) => {
  try {
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
  } catch (err) {
    console.log(err, "error happened while showing ordered products details");
    res.redirect('/404')
  }
};

/* ------------------------------- user orders page ------------------------------ */

exports.orderPage = async (req, res) => {
  try {
    let userId = req.session.user._id;
    var limit = 5;
    var page = 1;
    if (req.query.page) {
      page = req.query.page;
    }
    var search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    let orders = await Order.find({
      userId: ObjectId(userId),
      $or: [
        {
          paymentMethod: { $regex: ".*" + search + ".*", $options: "i" },
        },
        {
          status: { $regex: ".*" + search + ".*", $options: "i" },
        },
      ],
    })
      .sort({ date: -1 })
      .limit(5)
      .skip((page - 1) * limit)
      .exec();

    console.log(orders.length, "orders here");

    let count = await Order.find({
      userId: ObjectId(userId),
      $or: [
        {
          paymentMethod: { $regex: ".*" + search + ".*", $options: "i" },
        },
        {
          status: { $regex: ".*" + search + ".*", $options: "i" },
        },
      ],
    }).countDocuments();

    let date = orders[0]?.date.toLocaleDateString();
    console.log(date);
    req.session.discountprice = false;
    res.render("user/orderdetails", {
      orders,
      isuser: req.session.userlogin,
      totalPages: Math.ceil(count / limit),
      previous: page - 1,
    });
  } catch (err) {
    console.log(err, "error happened  showing orders page user side");
    res.redirect('/404')
  }
};

/* ---------------------------- admin orders page --------------------------- */
exports.ordersPageAdmin = async (req, res) => {
  try {
    var limit = 5;
    var page = 1;
    if (req.query.page) {
      page = req.query.page;
    }
    var search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    let orderinfo = await Order.find({
      $or: [
        {
          paymentMethod: { $regex: ".*" + search + ".*", $options: "i" },
        },
        {
          status: { $regex: ".*" + search + ".*", $options: "i" },
        },
      ],
    })
      .sort({ date: -1 })
      .limit(8)
      .skip((page - 1) * limit)
      .exec();

    let count = await Order.find({
      $or: [
        {
          paymentMethod: { $regex: ".*" + search + ".*", $options: "i" },
        },
        {
          status: { $regex: ".*" + search + ".*", $options: "i" },
        },
      ],
    }).countDocuments();

    res.render("admin/adminorder", {
      orderinfo,
      totalPages: Math.ceil(count / limit),
      previous: page - 1,
    });
  } catch (err) {
    console.log(err, "error happened while loading orders page in admin side");
    res.redirect('/404')
  }
};

/* ------------------------------- month sale ------------------------------- */
exports.monthsale = async (req, res) => {
  try {
    let orders = await orderServices.getAllOrders();

    res.json(orders);
  } catch (err) {
    console.log(err, "error happened in order-details admin");
    res.redirect('/404')
  }
};

/* ---------------------------------- stat ---------------------------------- */

exports.Showstat = async (req, res) => {
  try {
    let OrdersDateandAmount = await orderServices.getOrdersDateandAmount();
    res.status(200).json(OrdersDateandAmount);
    console.log(OrdersDateandAmount);
  } catch (err) {
    console.log(err, "error happened in stat");
    res.redirect('/404')
  }
};

/* ---------------------------- ordered user Info --------------------------- */

exports.orderUserInfo = async (req, res) => {
  try{
    let orderId = req.params.id;

    const userDetails = await Order.aggregate([
      {
        $match: { _id: ObjectId(orderId) },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userData",
        },
      },
    ]);
    console.log(userDetails[0].userData[0].name);
  
    res.render("admin/orderedusers", { userDetails });
  }catch(err){
    console.log(err,'order user inf');
    res.redirect('/404')
  }
 
};

/* ------------------------ change order status admin ----------------------- */

exports.adminChangeOrderStatus = async (req, res) => {
  try {
    let orderId = req.params.id;
    let updatedstatus = req.body.status;
    await Order.updateOne(
      { _id: orderId },
      {
        $set: {
          status: updatedstatus,
        },
      }
    );
    walletServices.refund_order_status(orderId).then(() => {
      res.redirect("/admin/orders");
    });
  } catch (err) {
    console.log("error happened in order status" + err);
    res.redirect('/404')
  }
};

/* --------------------------------- paypal create order --------------------------------- */

exports.paypal_createorder = async (req, res) => {
  try{
 let userId = req.session.user._id;
  let total = await cartServices.calculate_total(userId).catch((err)=>{res.redirect('/404')});
  console.log(total, "total here");
  const order = await paypalServices.createOrder(total);
  res.json(order);
}catch(err){
  console.log(err);
  res.redirect('/404')
}
};

/* -------------------------- paypal capture order -------------------------- */

exports.paypal_captureOrder = async (req, res) => {
  try{
const { orderId } = req.params;
  const captureData = await paypalServices.capturePayment(orderId);
  res.json(captureData);
  }catch(err){
    console.log(err);
    res.redirect('/404')
  }
  
};


/* -------------------------------- sales according to date stat ------------------------------- */


exports.datestat=async (req, res) => {
  try{
    let date = req.body.Datestat;
    const daysales = await Order.aggregate([
      { $match: { status: { $nin: ["cancelled"] } } },
      {
        $project: {
          order: "$userId",
          date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          paymentmode: "$paymentMethod",
          total: "$totalAmount",
        },
      },
      {
        $match: { date: req.body.Datestat },
      },
    ]);
    console.log(daysales);
    res.render("admin/orderstat", { sales: daysales });
  }catch(err){
    console.log('error jappened in date stat');
    res.redirect('/404')
  }
 
}

/* ---------------------------stat according to month --------------------------- */

exports.monthstat=async (req, res) => {
  try{
    let matchkey = req.body.m_year + "-" + req.body.m_month;
    console.log(matchkey);
    const monthsales = await Order.aggregate([
      { $match: { status: { $nin: ["cancelled"] } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
  
          yearmonth: {
            $first: { $dateToString: { format: "%Y-%m", date: "$date" } },
          },
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $match: { yearmonth: matchkey },
      },
    ]);
  
    console.log(monthsales);
  
    res.render("admin/orderstat", { sales: monthsales });

  }catch(err){
    console.log(err,'error happened in month stat');
    res.redirect('/404')
  }
 
}

exports.yearstat=async (req, res) => {
  try{

    let year = req.body.yearstat;
    const yearsales = await Order.aggregate([
      { $match: { status: { $nin: ["cancelled"] } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          month: {
            $first: { $dateToString: { format: "%Y-%m", date: "$date" } },
          },
  
          yearmonth: {
            $first: { $dateToString: { format: "%Y", date: "$date" } },
          },
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $match: { yearmonth: year },
      },
    ]);
  
    console.log(yearsales, "sfsaff");
  
    res.render("admin/orderstat", { sales: yearsales });
  }catch(err){
    console.log('err in yearstat');
    res.redirect('/404')
  }
 
}