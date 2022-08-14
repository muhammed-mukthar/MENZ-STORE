const Admin = require("../models/admin");
const User = require("../models/user");
const Product = require("../models/product");
const Category=require('../models/category')
const SubCategory=require('../models/subcategory')
const multer = require("multer");
const fs = require("fs");

//get all users admin

exports.adminlistallusers=async (req, res) => {
    try {
      let getuser = await User.find();
  
      res.status(200).render("admin/adminuser", { listuser: getuser });
    } catch (err) {
      res.send(err).status(500);
    }
  }