

const router = require("express").Router();
const Admin = require("../models/admin");
const User = require("../models/user");
const Product = require("../models/product");
const Category = require("../models/category");
const SubCategory = require("../models/subcategory");

const fs = require("fs");

//admin_login, admin_logout admin_getall_users admin_blockuser admin_unblockuser admin_get_Allproducts admin_add_Product admin_edit_Product admin_delete_products admin_add_category admin_delete_category

/* -------------------------------- loginpage ------------------------------- */

exports.loginpage=(req, res) => {
    res.render("admin/login");
  }



  /* --------------------------- admindashboard page -------------------------- */


exports.AdminAashboardpage=(req, res) => {

  res.render("admin/admin");

}

/* ------------------------------- adminlogin ------------------------------- */

exports.adminlogin= async (req, res) => {
  try {
    const adminvalid = await Admin.findOne({
      $and: [{ email: req.body.email }, { password: req.body.password }],
    });
    console.log(adminvalid);
    if (adminvalid) {
      req.session.adminlog = true;
      res.status(200).redirect("/admin");
    } else {
      req.session.message = {
        type: "danger",
        message: "invalid credentials",
      };
      req.session.adminlog = false;
      res.redirect("/admin/login");
    }
  } catch (err) {
    res.status(500).send(err);
  }
}

/* ------------------------------- adminlogout ------------------------------ */

exports.adminlogout=(req, res) => {
  req.session.adminlog = false;
  res.redirect("/admin/login");
}