const router = require("express").Router();
const Admin = require("../models/admin");
const User = require("../models/user");
const Product = require("../models/product");
const Category = require("../models/category");
const orderServices = require("../services/orderServices");

const Order = require("../models/order");
const userServices = require("../services/userServices");

//admin_login, admin_logout admin_getall_users admin_blockuser admin_unblockuser admin_get_Allproducts admin_add_Product admin_edit_Product admin_delete_products admin_add_category admin_delete_category

/* -------------------------------- loginpage ------------------------------- */

exports.loginpage = (req, res) => {
  try{
    res.render("admin/login");
  }catch(err){
    console.log('error happened in admin login');
    res.redirect('/404')
  }

};

/* --------------------------- admindashboard page -------------------------- */

exports.AdminAashboardpage = async (req, res) => {
  try {
    let total = 0;
    await orderServices.getAllOrders().then((orders) => {
      orders.forEach((data) => {
        total = total + data.totalAmount;
      });
    });

    userServices.getAllUser().then((usersdetails) => {
      orderServices.getAllOrders().then((orderdetails) => {
        res.render("admin/admin", { total, usersdetails, orderdetails });
      })
    }).catch((err)=>{ res.redirect("/404");})
  } catch (err) {
    console.log(err + "error happened in admin dashbord");
    res.redirect("/404");
  }
};

/* ------------------------------- adminlogin ------------------------------- */

exports.adminlogin = async (req, res) => {
  try {
    if (req.session.adminlog) {
      res.redirect("/admin");
    } else {
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
    }
  } catch (err) {
    console.log(err,'admin login');
    res.redirect('/404')
  }
};

/* ------------------------------- adminlogout ------------------------------ */

exports.adminlogout = (req, res) => {
  try{
    req.session.adminlog = false;
    res.redirect("/admin/login");
  }catch(err){
    console.log(err,'admin logout');
    res.redirect('/404')
  }

};
