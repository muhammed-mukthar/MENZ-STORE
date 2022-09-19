
/* -------------------------------- models -------------------------------- */
const User = require("../models/user");
const Cart = require("../models/cart");
const Product = require("../models/product");
const Category = require("../models/category");
const Order = require("../models/order");
const Address=require('../models/savedAddress')
const WishList=require('../models/wishlist')
const Coupon=require('../models/couponoffer')
/* ------------------------------------*  ----------------------------------- */

/* ---------------------------- helpers/services ---------------------------- */

let walletServices = require("../services/walletServices");
let ReferalServices = require("../services/referalService");
let orderServices = require("../services/orderServices");
let wishlistServices = require("../services/wishlistServices");
let couponServices = require("../services/CouponServices");
let cartServices = require("../services/cartServices");
let paypalServices = require("../services/paypalService");

var ObjectId = require("mongoose").Types.ObjectId;
/* ------------------------------ wishlist page ----------------------------- */

exports.wishlist_Page=(req,res)=>{
  try{
    let userId = req.session.user?._id;
  
    wishlistServices.getproducts(userId).then((wishlistItems)=>{
      console.log(wishlistItems);
      res.render('user/wishlist',{wishlistItems,userId,  isuser: req.session.userlogin,})
    }).catch((err)=>{res.redirect('/404')})
  }catch(err){
    res.redirect('/404')
  }
   
  }

  /* ----------------------------- add to wishlist ---------------------------- */

  exports.add_to_wishlist=async(req,res)=>{
    try {
      let userId = req.session.user._id;
      let productId = req.params.id;
  
      let isWishList = await WishList.findOne({ user: userId });
  
      let productadd = {
        item: ObjectId(productId),
        quantity: 1,
      };
      if (isWishList == null) {
      
  
        let newWishList = new WishList({
          user: userId,
          products: [productadd],
        });
        newWishList.save();
       
      } else {
  
       const alreadyExists = isWishList.products.findIndex(product => product.item == productId)
        if (alreadyExists === -1) {
          const addWishList = await WishList.updateOne(
            { user: userId },
            { $push: { products: { item: ObjectId(productId), quantity: 1 } } }
          );
      
          console.log(addWishList);
        } else {
  
        }
      }
      res.redirect("/wishlist");
    } catch (err) {
      console.log(err + "error add to wishlist");
      res.redirect('/404')
    }
  }
    

  /* ----------------------------- remove wishlist ---------------------------- */

  exports.remove_wishlist=(req,res)=>{
    try{
      let wishlistId=req.body.wishlist;
      let productId=req.body.product
      let userId=req.body.user
      console.log(wishlistId,productId,userId);
      wishlistServices.deleteWishlistproduct(wishlistId,productId,userId).then(()=>{
        res.json(removeproduct =true)
      }).catch((err)=>{res.redirect('/404')})
    }catch(err){
      res.redirect('/404')
    }
  
    
  
  }


  /* ------------------- remove wishlist when added to cart ------------------- */
  

  exports.delete_wishlist_cart=async(req,res)=>{
    try{
 
      let wishlistId=req.body.wishlist
      let productId=req.body.productId
      wishlistServices.deleteWishlist(wishlistId,productId).then(()=>{
        res.json(removewishlist =true)
      }).catch((err)=>{res.redirect('/404')})
    
    }catch(err){
      res.redirect('/404')
    }
  
  }