
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
const CartController=require('../controller/cartController')

const otpcontroller = require("../controller/otpcontroller");

const userController = require("../controller/usercontroller");
const user = require("../models/user");
const category = require("../models/category");
const { pipeline } = require("stream");
const { $where } = require("../models/category");
const product = require("../models/product");
const cart = require("../models/cart");



/* ------------------------------ display cart ------------------------------ */

exports.displaycart=async (req, res) => {
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
 let fulltotal= total[0]?.total

  // console.log(JSON.stringify(cartItems) + "gjhgkg");

  res.render("user/cart", { cartItems,user ,isuser: req.session.userlogin,fulltotal});
}

/* ----------------------------- CHANGE QUANTITY ---------------------------- */

  exports.changequantity=async(req,res,next)=>{
    try{
    let  count = req.body.count
      console.log(count);
    let quantity = parseInt(req.body.quantity)
    let cartid=req.body.cart;
    let productId=req.body.product
    let userId = req.session.user?._id;
    
    if(count==-1 && quantity==1){
    
    
      await Cart.updateOne({_id:ObjectId(cartid)},{
        $pull:{
          products:{
            item:ObjectId(productId) 
          }
        }
      })
    
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
   
     let totals= total[0]?.total
    
      
        res.json({removeproduct:true,totals})
     
    }else{
    
      await Cart.updateOne({_id:ObjectId(req.body.cart),'products.item':ObjectId(req.body.product )},
                {
                    $inc:{'products.$.quantity':Number(count)}
                })
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
               let totals= total[0].total
    
                
    
    
    
          res.json({status:true,totals})
                
    

    }
    }catch(err){
      console.error("eoor"+err);
    
    }
    }



    /* ------------------------------- add to cart ------------------------------ */


    exports.addtocart= async (req, res) => {
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
    }
/* --------------------------- order chckout page --------------------------- */

      exports.ordercheckout=async(req,res)=>{
        try{
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
        res.render('user/checkout',{total:fulltotal,userId,islogin: req.session.userlogin })
        }catch(err){
          console.log(err+"error happenedd in order checkout");
        }
      }

      /* ------------------------------- remove cart ------------------------------ */


    exports.removeCart=async(req,res)=>{
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
    }
      