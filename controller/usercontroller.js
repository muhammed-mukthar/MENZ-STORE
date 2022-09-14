




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
let orderServices=require('../services/orderServices')
let walletServices=require('../services/walletServices')
let ReferalServices=require('../services/referalService')
/* ------------------------------------ * ----------------------------------- */

const paypal = require('../paypal')
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const dotenv = require("dotenv");
const Wallet = require("../models/wallet");
dotenv.config();
var ObjectId = require("mongoose").Types.ObjectId;

/* ----------------------------- userlogin page ----------------------------- */

exports.userloginpage = (req, res) => {
  if(req.session.userlogin){
    res.redirect('/')
  }else{
 res.render("user/login", { loginerror: req.session.loginerr });
  req.session.loginerr = false;
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
          res.status(200).redirect("/");
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
    res.status(200).send(err+"login eroor");
  }
};



/* --------------------------------- signup --------------------------------- */
exports.signup=async (req, res) => {
  try {
    const userexist = await User.findOne({ email: req.body.email });
    console.log(userexist);
    if (userexist) {
      req.session.message = {
        message: "User already exists please login",
      };
      res.status(422).redirect("/signup");
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
    res.status(200).send(err)
  }
}



/* -------------------------- //get all users admin ------------------------- */

exports.getallusers = async (req, res) => {
  try {
    let getuser = await User.find();

    res.status(200).render("admin/adminuser", { listuser: getuser });
  } catch (err) {
    res.send(err).status(500);
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
    res.send(err).status(500);
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
    res.send(err).status(500);
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
  }
}

/* ------------------------------- user signup ------------------------------ */

exports.userSignup=(req, res) => {
  try{

  }catch(err){
    console.log(err,'error happened in user Signup');
  }
  res.render("user/signup");
}


/* ---------------------------- user profile page --------------------------- */

exports.userProfilePage=async (req, res) => {
  try{
    let userId = req.session.user._id;
  let walletdetails=await walletServices.wallet_balance(userId)
  let userdetails = await User.findOne({ _id: userId })
  let saveaddress=await Address.find({userId:ObjectId(userId)})
  let referalcode=await ReferalServices.findreferal(userId)
  console.log(walletdetails);
  res.render("user/userdetails", {
    isuser: req.session.userlogin,
    userdetails,walletdetails,
    isuser: req.session.userlogin,
    saveaddress,referalcode
  });
  }catch(err){
    console.log(err,'error happened while loading userProfile');
  }
  
}


/* -------------------------- change Password Page -------------------------- */

exports.changePasswordPage=(req, res) => {
  try{
  res.render("user/changePassword", { isuser: req.session.userlogin });
  }catch(err){
    console.log(err,'error happened while loading change password page ');
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
  }
}