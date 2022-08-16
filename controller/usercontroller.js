const Admin = require("../models/admin");
const User = require("../models/user");
const Product = require("../models/product");
const Category = require("../models/category");
const SubCategory = require("../models/subcategory");
const bcrypt=require('bcrypt')
const fs = require("fs");

/* ----------------------------- userlogin page ----------------------------- */

exports.userloginpage = (req, res) => {
  res.render("user/login", { loginerror: req.session.loginerr });
  req.session.loginerr = false;
};

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
          res.redirect("/users/login");
        } else {
          req.session.userlogin = true;
          req.session.loginerr = false;
          res.status(200).redirect("/users");
        }
      } else {
        req.session.message = {
          message: "Invalid credentials",
        };

        res.redirect("/users/login");
      }
    } else {
      req.session.message = {
        message: "invalid credentials",
      };

      res.redirect("/users/login");
    }
  } catch (err) {
    res.status(200).send(err+"login eroor");
  }
};

//get all users admin

exports.getallusers = async (req, res) => {
  try {
    let getuser = await User.find();

    res.status(200).render("admin/adminuser", { listuser: getuser });
  } catch (err) {
    res.send(err).status(500);
  }
};

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
