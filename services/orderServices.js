const { rejects } = require("assert");
const { resolve } = require("path");
const Razorpay = require("razorpay");

const User = require("../models/user");
const Cart = require("../models/cart");
const Product = require("../models/product");
const Category = require("../models/category");
const Order = require("../models/order");
const Address = require("../models/savedAddress");

const dotenv = require("dotenv");
dotenv.config();

var ObjectId = require("mongoose").Types.ObjectId;
var instance = new Razorpay({
    key_id: process.env.RAZOR_KEY_ID,
    key_secret: process.env.RAZOR_SECRET_ID,
  });
module.exports = {
  /* ---------------------------- get orders sorted --------------------------- */
  getAllOrders:()=>{
    try{
      return new Promise(async(resolve,reject)=>{
        let orderdetails=await Order.aggregate([{ $match: { 'status': { $nin: ['cancelled'] } } },{$sort:{date:-1}}])
        // let orderdetails=await Order.find({status:{$nin:['cancelled']}}).sort({date:-1})
        console.log(orderdetails);
        resolve(orderdetails)
      })

    }catch(err){
      console.log(err,'error happened in get all orders');
    }

    
  },

  /* ------------------------ get order date and amount ----------------------- */

  getOrdersDateandAmount:()=>{
    try{
      return new Promise(async(resolve,reject)=>{
        let orderDate=await Order.aggregate([ { $match: { 'status': { $nin: ['cancelled'] } } },    
              {       
                    $project:{month:{$month:"$date"},_id:0,MonthTotal:"$totalAmount"}      
               },{
                $group:{
                  _id:"$month",
                  total:{$sum:"$MonthTotal"}
  
                }
               }     
                ])
        resolve(orderDate)
  
      })

    }catch(err){
      console.log(err,'error happened in order date and amount');
    }
    
  },
  

  /* ---------------------------- generate razorpay --------------------------- */




  generateRazorpay: (orderId,total) => {
    try{
      console.log("OrderId",orderId);
      return new Promise((resolve, reject) => {
        var options = {
          amount: total*100, // amount in the smallest currency unit
          currency: "INR",
          receipt: ""+orderId,
        };
        instance.orders.create(options, function (err, order) {
          if(err){
              console.log(err);
              reject(err)
          }else{
                 console.log("New Order:",order);
          resolve(order)
          }
       
        });
      });
    }catch(err){
      console.log(err,'generate razorpay');
    }
    
  },

/* ------------------------- razorpay verify payment ------------------------ */

  verifyPayment:(details)=>{
    console.log(details,'verify payment services');
    return new Promise((resolve,reject)=>{
      try{
        const crypto=require('crypto')
        let hmac=crypto.createHmac('sha256',process.env.RAZOR_SECRET_ID)
        hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
        hmac=hmac.digest('hex')
        console.log(hmac);
        console.log(details['payment[razorpay_signature]']);

        if(hmac==details['payment[razorpay_signature]']){
          console.log('verifypayment verifyservice');
            resolve()
        }else{
            reject()
        }
      }catch(err){
        console.log(err,'error happened in verify payment service');
      }
        
    })
  },


/* ------------------------- razorpay change status ------------------------- */

  changePaymentStatus:(orderId)=>{
   
    console.log('change payment status',orderId);
    return new Promise((resolve,reject)=>{
      try{
        Order.updateOne({_id:ObjectId(orderId)},
        {
          $set:{
            status:'placed'
          }
        }).then(()=>{
          console.log('change payment status here');
          resolve()
        }).catch((err)=>{
          reject(err)
        })
      }catch(err){
        console.log(err,'error happened while change statsu');
      
      }
     
    })
  }
};