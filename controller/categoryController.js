
const router = require("express").Router();
const Admin = require("../models/admin");
const User = require("../models/user");
const Product = require("../models/product");
const Category = require("../models/category");
const SubCategory = require("../models/subcategory");

const fs = require("fs");

/* ------------------------------ category page ----------------------------- */
exports.categorypage=async(req, res) => {
    let categories= await Category.find()
    res.render("admin/admincategory",{categories});
  }




exports.addCategory=async (req, res) => {

    console.log(req.body.category);
    var categorysave = await new Category({
      categoryname: req.body.category,
    });
    console.log(categorysave);
    categorysave.save((err) => {
      if (err) {
        res.json({ message: err.message });
      } else {
        req.session.message = {
          type: "success",
          message: "category added succesfilly",
        };
        res.redirect("/admin/category");
      }
    });
  }

  exports.deleteCategory=async(req,res)=>{
    await Category.findByIdAndDelete(req.params.id)
    res.redirect('/admin/category')
  }