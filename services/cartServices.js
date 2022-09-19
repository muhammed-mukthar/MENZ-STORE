
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
const Coupon=require('../models/couponoffer')
const Address=require('../models/savedAddress')
const user = require("../models/user");
const category = require("../models/category");
const { pipeline } = require("stream");
const { $where } = require("../models/category");
const product = require("../models/product");
const cart = require("../models/cart");

module.exports={

    calculate_total:(userId)=>{
      try{

        return new Promise(async(resolve,reject)=>{
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
                total:{$sum:{$multiply:['$quantity','$product.offerprice']}}
              }
            }
            ])
        let fulltotal=total[0]?.total
        resolve(fulltotal)
      })


    }catch(err){
    console.log(err);
 
      }
  },

      
       
   
    
}

