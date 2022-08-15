const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Product = require("../models/product");
const bcrypt = require("bcrypt");

const userController = require("../controller/usercontroller");

const userauth = (req, res, next) => {
  if (req.session.userlogin) {
    next();
  } else {
    res.redirect("/users/login");
  }
};

/* ------------------------------- //get login ------------------------------ */
router.get("/login", userController.userloginpage);

//post login

router.post("/login", userController.userlogin);

router.get("/logout", (req, res) => {
  req.session.userlogin = false;
  res.redirect("/");
});

router.get("/", (req, res) => {
  res.render("user/home", { isuser: req.session.userlogin });
});

router.get("/signup", (req, res) => {
  res.render("user/signup");
});

/* -------------------------------- //signup -------------------------------- */
router.post("/signup", async (req, res) => {
  try {
    const userexist = await User.findOne({ email: req.body.email });
    console.log(userexist);
    if (userexist) {
      req.session.message = {
        message: "User already exists please login",
      };
      res.status(422).redirect("/users/signup");
    } else {
      const userdetails = await new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: await bcrypt.hash(req.body.password, 10),
      });
      await userdetails.save();
      res.status(200).redirect("/users/login");
    }
  } catch (err) {
    res.status(200).send(err);
  }
});

router.get("/cart", (req, res) => {
  res.render("user/cart", { isuser: req.session.userlogin });
});

router.get("/shop", async (req, res) => {
  const allProduct = await Product.find();
  res.render("user/shop", {
    products: allProduct,
    isuser: req.session.userlogin,
  });
});

module.exports = router;
