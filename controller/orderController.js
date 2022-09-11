
/* -------------------------------- models -------------------------------- */
const User = require("../models/user");
const Cart = require("../models/cart");
const Product = require("../models/product");
const Category = require("../models/category");
const Order = require("../models/order");
const Address=require('../models/savedAddress')
const Couponused=require('../models/usedcoupon')

/* ------------------------------------*  ----------------------------------- */
/* ---------------------------- helpers/services ---------------------------- */
let orderServices=require('../services/orderServices')
let cartServices=require('../services/cartServices')
let walletServices=require('../services/walletServices')

/* ------------------------------------ * ----------------------------------- */

const paypal = require('../paypal')
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const dotenv = require("dotenv");
dotenv.config();
var ObjectId = require("mongoose").Types.ObjectId;


/* ------------------------- display placeorder page  ------------------------ */


exports.placeOrderpage=(req, res) => {
    try{
res.render("user/orderplaced");
    }catch(err){
        console.log(err,'error happened while displaying orderPage');
    }
    
  }


   /* ------------------------------- place order ------------------------------ */


exports.placeOrder=async (req, res) => {
  try {
    let userId = req.body.userId;
    
    let cart = await Cart.findOne({ user: ObjectId(userId) });
 
    let products = cart?.products;
 
   let totalPrice=await cartServices.calculate_total(userId)
   console.log(totalPrice,typeof(totalPrice),'totalPrice in placeorder');
   if(req.session.discountprice){
    totalPrice=totalPrice-req.session.discountprice.offer
   await Couponused.updateOne({userId:userId},{$set:{totalspend:totalPrice}})
   }
   
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
}else if(req.body["paymentmethod"] === "RazorPay"){
  orderServices.generateRazorpay(savedOrder._id,totalPrice).then((response)=>{
    res.json(response)
  })
}else if( req.body["paymentmethod"] === "paypal"){
  orderServices.changePaymentStatus(savedOrder._id).then((response)=>{

      res.json({ paypalSuccess: true });

  })
}else if( req.body["paymentmethod"] === "wallet"){
  orderServices.changePaymentStatus(savedOrder._id).then(()=>{
      walletServices.wallet_payment(userId,totalPrice).then(()=>{
        res.json({ codSuccess: true });
  })
  })

}        
    await Cart.deleteOne({ user: ObjectId(order.userId) });
  } catch (err) {
    console.log(err + "error happened while placing order");
  }
}


/* --------------------------- verify razorpayment -------------------------- */

exports.razorVerifyPayment=(req,res)=>{
    try{
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

    }catch(err){
        console.log(err,'error happened while verifying razor Payment');
    }
}


/* ------------------------------ cancel order ------------------------------ */

exports.cancelOrder=async (req, res) => {
    try{
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
    walletServices.refund_order_status(id).then(()=>{
       res.json("res");
    })
    }catch(err){
        console.log(err,'error happened while cancel order');
    }
   
  }

/* ----------------------- ordered product admin view ----------------------- */
  
  exports.orderedProductsAdmin=async(req,res)=>{
    try{
 let orderId=req.params.id
    let orderdItems = await Order.aggregate([
      {
        $match: { _id: ObjectId(orderId) },
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
  
  res.render('admin/orderproducts',{orderdItems})
  
  
    }catch(err){
        console.log(err,'error happened while viewing ordered products in admin side');
    }
   
  }


  /* ------------------------ ordered products details ------------------------ */


  exports.orderedProducts=async (req, res) => {
    try{
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
    }catch(err){
        console.log(err,'error happened while showing ordered products details');
    }
 
  }



  /* ------------------------------- user orders page ------------------------------ */

  exports.orderPage=async (req, res) => {
    try{
  let userId = req.session.user._id;
  
    let orders = await Order.find({ userId: ObjectId(userId) }).sort({
      date: -1,
    });
  
    let date = orders[0].date.toLocaleDateString();
    console.log(date);
    req.session.discountprice=false
    res.render("user/orderdetails", { orders, isuser: req.session.userlogin });
    }catch(err){
        console.log(err,'error happened  showing orders page user side');
    }
  
  }
  
/* ---------------------------- admin orders page --------------------------- */
  exports.ordersPageAdmin=async(req,res)=>{
    try{
    let  orderinfo=await Order.find().sort({
      date: -1,
    })
    res.render('admin/adminorder',{orderinfo})
    }catch(err){
        console.log(err,'error happened while loading orders page in admin side');
    }

  }

  /* ------------------------------- month sale ------------------------------- */
exports.monthsale=async(req,res)=>{
    try{
      let orders=await orderServices.getAllOrders()
      console.log(orders,'orders monthsale');
      res.json(orders);
    }catch(err){
      console.log(err,'error happened in order-details admin');
    }
  }
  

  /* ---------------------------------- stat ---------------------------------- */

exports.Showstat=async(req,res)=>{
    try{
    let OrdersDateandAmount= await orderServices.getOrdersDateandAmount()
    res.status(200).json(OrdersDateandAmount)
    console.log(OrdersDateandAmount);
  
    }catch(err){
      console.log(err,'error happened in stat');
    }
  
  }
  
  /* ---------------------------- ordered user Info --------------------------- */

exports.orderUserInfo=async(req,res)=>{
    let orderId=req.params.id
  
    const userDetails = await Order.aggregate([
          
      {
       
          $match: { _id: ObjectId(orderId) },
        },{
          $lookup:{
              from:'users',
              localField:'userId',
              foreignField:'_id',
              as:'userData'
          }
      },
    ])
    console.log(userDetails[0].userData[0].name);
  
  res.render('admin/orderedusers',{userDetails})
  }
  
  /* ------------------------ change order status admin ----------------------- */

  exports.adminChangeOrderStatus=async(req,res)=>{
    try{
      let orderId=req.params.id
      let updatedstatus=req.body.status
    await Order.updateOne({_id:orderId},{
        $set:{
          status:updatedstatus
        }
      })
      walletServices.refund_order_status(orderId).then(()=>{
         res.redirect('/admin/orders')
      })
    }catch(err){
      console.log('error happened in order status'+err);
    }
  
   
  }