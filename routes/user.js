const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Product = require('../models/product')

//get login
router.get("/login", (req, res) => {
  res.render("user/login", { loginerror: req.session.loginerr });
  req.session.loginerr = false;
});

//post login

router.post("/login", async (req, res) => {
  try {
    const verifyUser = await User.findOne({ email: req.body.email });

    if (verifyUser) {
      if (verifyUser.isBlocked) {
        req.session.loginerr = "you are restricted";
        res.redirect("/users/login");
      } else {
        req.session.userlogin = true;
        req.session.loginerr = false;
        res.status(200).redirect("/users");
      }
    } else {
      req.session.loginerr = "invalid credentials";

      res.redirect("/users/login");
    }
  } catch (err) {
    res.status(200).send(err);
  }
});

router.get("/", (req, res) => {
  res.render("user/home");
});



router.get("/signup", (req, res) => {
  res.render("user/signup");
});

//signup
router.post("/signup", async (req, res) => {
  try {
    const userexist= User.find({$or:{email:req.body.email,phone:req.body.phone}})
    if(userexist){
      req.session.message={
        type:"success",
        message:"User already exists please login"
      }
      res.status(422).redirect('/users/signup')

    }else{
       const userdetails = new User(req.body);
    await userdetails.save();
    res.status(200).redirect("/users/login");
    }

   
  } catch (err) {
    res.status(200).send(err);
  }
});

router.get("/cart", (req, res) => {
  res.render("user/cart");
});

router.get("/shop", async(req, res) => {
  const allProduct= await Product.find()
  res.render("user/shop",{products:allProduct});
});



module.exports = router;
