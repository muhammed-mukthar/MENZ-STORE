const { rejects } = require("assert");
const { resolve } = require("path");
const Razorpay = require("razorpay");

const User = require("../models/user");
const Cart = require("../models/cart");
const Product = require("../models/product");
const Category = require("../models/category");
const Order = require("../models/order");
const Address = require("../models/savedAddress");

var ObjectId = require("mongoose").Types.ObjectId;
var instance = new Razorpay({
    key_id: "rzp_test_hoOZcN9A4HjtUu",
    key_secret: "zYl9DmogSEo8eCCifjAeePlm",
  });







module.exports = {
  generateRazorpay: (orderId,total) => {
    console.log("OrderId",orderId);
    return new Promise((resolve, reject) => {
      var options = {
        amount: total, // amount in the smallest currency unit
        currency: "INR",
        receipt: ""+orderId,
      };
      instance.orders.create(options, function (err, order) {
        if(err){
            console.log(err);
        }else{
               console.log("New Order:",order);
        resolve(order)
        }
     
      });
    });
  },
};
