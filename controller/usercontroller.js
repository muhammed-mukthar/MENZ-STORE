




const fs = require("fs");
const express = require("express");
const router = express.Router();
/* -------------------------------- models -------------------------------- */
const User = require("../models/user");
const Cart = require("../models/cart");
const Product = require("../models/product");
const Category = require("../models/category");
const Order = require("../models/order");
const Admin = require("../models/admin");
const Address=require('../models/savedAddress')
const Banner=require('../models/banner')

/* ------------------------------------*  ----------------------------------- */
/* ---------------------------- helpers/services ---------------------------- */

let walletServices=require('../services/walletServices')
let ReferalServices=require('../services/referalService')
let orderServices=require('../services/orderServices')
let wishlistServices=require('../services/wishlistServices')
let couponServices=require('../services/CouponServices')
let cartServices=require('../services/cartServices')
let paypalServices=require('../services/paypalService')

/* ------------------------------------ * ----------------------------------- */


const bcrypt = require("bcrypt");
const crypto = require("crypto");

const dotenv = require("dotenv");
const Wallet = require("../models/wallet");
dotenv.config();
var ObjectId = require("mongoose").Types.ObjectId;

/* ----------------------------- userlogin page ----------------------------- */

exports.userloginpage = (req, res) => {
  try{
 if(req.session.userlogin){
    res.redirect('/')
  }else{
 res.render("user/login", { loginerror: req.session.loginerr });
  req.session.loginerr = false;
  }
  }catch(err){
    console.log(err,'error happened in usrloginpage');
  res.redirect('/404')
  }
}

/* ------------------------------- user login ------------------------------- */

exports.userlogin = async (req, res) => {
  try {
    
    const verifyUser = await User.findOne({ email: req.body.email });

    if (verifyUser) {
      const validpassword = bcrypt.compareSync(
        req.body.password,
        verifyUser.password
      );

      console.log(validpassword);
      if (validpassword) {
        if (verifyUser.isBlocked) {
          req.session.message = {
            message: "you are restricted",
          };
          res.redirect("/login");
        } else {
          req.session.user=verifyUser
          req.session.userlogin = true;
          req.session.loginerr = false;
          res.redirect("/");
        }
      } else {
        req.session.message = {
          message: "Invalid credentials",
        };

        res.redirect("/login");
      }
    } else {
      req.session.message = {
        message: "invalid credentials",
      };

      res.redirect("/login");
    }
  } catch (err) {
    res.console.log(err,'eror happened in login post');
    res.redirect('/404')
  }
};



/* --------------------------------- signup --------------------------------- */
exports.signup=async (req, res) => {
  try {
    const userexist = await User.findOne({$or:[{email:req.body.email},{phone:req.body.phone}] });
  
    if (userexist) {
      req.session.message = {
        message: "User already exists please login",
      };
      res.redirect("/signup");
    } else {
      const userdetails =  new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: await bcrypt.hash(req.body.password, 10),
      });
    let saveduser=  await userdetails.save();
      //creating wallet and referalcode
      ReferalServices.createReferal(saveduser._id).then(()=>{
      walletServices.createWallet(saveduser._id,saveduser.email).then(()=>{
        ReferalServices.referralApply(req.body.referral,saveduser._id).then(()=>{
      res.redirect("/login")
    }).catch((err)=>{
      req.session.message = {
        type: "danger",
        message: err,
      }
      res.redirect("/signup")
    })
      })
      })
    }
  } catch (err) {
    console.log(err,'error happened in signup');
    res.redirect('/404')
  }
}



/* -------------------------- //get all users admin ------------------------- */

exports.getallusers = async (req, res) => {
  try {
    var limit=5
    var page=1
    if(req.query.page){
      page=req.query.page
    }
    var search=''
    if(req.query.search){
      search=req.query.search
    }
    let getuser = await User.find({$or:[
      {
       name:{$regex:'.*'+search+'.*',$options:'i'} 
      }
    ]}).limit(limit) .skip((page - 1) *limit)
    .exec(); 
let count=await User.find().countDocuments()
    res.status(200).render("admin/adminuser", { listuser: getuser ,totalPages: Math.ceil(count/limit),
    previous: page - 1, });
  } catch (err) {
    console.log(err,'get all users');
    res.redirect('/404')
  }
};


/* ------------------------------- block user ------------------------------- */

exports.blockuserupdate = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, {
      $set: {
        isBlocked: true,
      },
    });

    res.status(200).redirect("/admin/usermanagement");
  } catch (err) {
    console.log(err,'block user update');
    res.redirect('/404')
  }
};

/* ------------------------------ unblock user ------------------------------ */

exports.unblokuserupdate = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, {
      $set: {
        isBlocked: false,
      },
    });
    res.status(200).redirect("/admin/usermanagement");
  } catch (err) {
    console.log(err,'error happened in unblok user update');
    res.redirect('/404')
  }
};


/* ------------------------------ User home ---page--------------------------- */

exports.userhomepage= async (req, res) => {
  try{
let bannerimage=await Banner.find()
    let newproducts = await Product.find().sort({ createdAt: -1 }).limit(3);
    let categories=await Category.find()
    let offercategories=[]
    for(let j=0;j<categories.length;j++){
      if(categories[j].offer){
        offercategories.push(categories[j])
      }
    }

  console.log(offercategories);
  if (req.session.userlogin) {
    let userid = req.session.user._id;
    console.log(userid);
    let cartdetails = await Cart.findOne({ user: userid });
    let cartcount = cartdetails?.products.length;
    res.render("user/home", {
      isuser: req.session.userlogin,
      cartcount,
      newproducts,bannerimage,offercategories
    });
  } else {
    res.render("user/home", {
      isuser: req.session.userlogin,
      cartcount: "0",
      newproducts,bannerimage,offercategories
    });
  }

  }catch(err){
    console.log(err,'error happened in user homepage');
    res.redirect('/404')
  }
}


/* ------------------------------- user logout ------------------------------ */

exports.userLogout=(req, res) => {
  try{
  req.session.userlogin = false;
  req.session.user = false;
  res.redirect("/");
  }catch(err){
    console.log(err,'error happened while user Logout');
    res.redirect('/404')
  }
}

/* ------------------------------- user signup ------------------------------ */

exports.userSignup=(req, res) => {
  try{
    res.render("user/signup");
  }catch(err){
    console.log(err,'error happened in user Signup');
    res.redirect('/404')
  }

}


/* ---------------------------- user profile page --------------------------- */

exports.userProfilePage=async (req, res) => {
  try{
    let userId = req.session.user._id;
  let walletdetails=await walletServices.wallet_balance(userId)
  let userdetails = await User.findOne({ _id: userId })
  let saveaddress=await Address.find({userId:ObjectId(userId)})
  let referalcode=await ReferalServices.findreferal(userId)
  
  res.render("user/userdetails", {
    isuser: req.session.userlogin,
    userdetails,walletdetails,
    isuser: req.session.userlogin,
    saveaddress,referalcode
  });
  }catch(err){
    console.log(err,'error happened while loading userProfile');
    res.redirect('/404')
  }
  
}


/* -------------------------- change Password Page -------------------------- */

exports.changePasswordPage=(req, res) => {
  try{
  res.render("user/changePassword", { isuser: req.session.userlogin });
  }catch(err){
    console.log(err,'error happened while loading change password page ');
    res.redirect('/404')
  }

}

/* ----------------------------- change password ---------------------------- */

exports.changePassword=async (req, res) => {
  try{
 let userId = req.session.user._id;
  let enteredPassword = req.body.currentPassword;
  let newPassword = req.body.NewPassword;
  let userdetails = await User.findOne({ _id: userId });
  console.log(userdetails + "user details here");
  let verifypassword = bcrypt.compareSync(
    enteredPassword,
    userdetails.password
  ); //comparing changed password and new password is same

  console.log(verifypassword + "user password checking");

  if (verifypassword) {
    if (enteredPassword == newPassword) {
      req.session.message = {
        type: "danger",
        message: "cannot type old password",
      };
      res.redirect("/changePassword");
    } else {
      await User.updateOne(
        { _id: ObjectId(userId) },
        {
          $set: {
            password: bcrypt.hashSync(newPassword, 10),
          },
        }
      );

      req.session.message = {
        type: "success",
        message: "password changed",
      };

      res.redirect("/changePassword");
    }
  } else {
    req.session.message = {
      type: "danger",
      message: "password is not correct",
    };
    res.redirect("/changePassword");
  }

  }catch(err){
    console.log(err,'error happened while changing password');
    res.redirect('/404')
  }
}

/* -------------------------- edit profile details -------------------------- */


exports.editProfile=async (req, res) => {
  try {
    let userId = req.session.user._id;
    let changed_email = req.body.email;
    let changed_name = req.body.name;
    let changed_phone = req.body.phone;
    let password=req.body.password

    let userdetails = await User.findOne({ _id: ObjectId(userId) });
  
    let verifypassword = bcrypt.compareSync(
      password,
      userdetails.password
    );
    console.log(changed_email+"changed email"+userId+"userid"+changed_name+"changed name"+"changed phone"+changed_phone);
if(verifypassword){
  
  await User.updateOne(
    { _id:ObjectId(userId)  },
    {
      $set: {
        name: changed_name,
        email: changed_email,
        phone: changed_phone,
      },
    }
  );
  req.session.message = {
    type: "success",
    message: "userdetails updated",
  };
  res.redirect("/userprofile");
}else{
  req.session.message = {
    type: "danger",
    message: "invalid  password",
  };
  res.redirect("/userprofile");
}


  } catch (err) {
    console.log(err + "error at editing profile details");
    res.redirect('/404')
  }
}

exports.errorpage=(req,res)=>{
  try{
 let adminlog=req.session.adminlog;
  let userlog= req.session.userlogin
 
      

  res.render('include/404',{adminlog,userlog})
  }catch(err){
    res.redirect('/login')
    console.log(err,'error page');
  }
 
}

