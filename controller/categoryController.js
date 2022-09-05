
const router = require("express").Router();
const Admin = require("../models/admin");
const User = require("../models/user");
const Product = require("../models/product");
const Category = require("../models/category");

var ObjectId = require("mongoose").Types.ObjectId;
const fs = require("fs");

/* ------------------------------ category page ----------------------------- */
exports.categorypage=async(req, res) => {
   
    let categories= await Category.find()
    let categorylength=categories.length
    res.render("admin/admincategory",{categories,categorylength});
  }




exports.addCategory=async (req, res) => {
  const categoryvalidate=await Category.findOne({categoryname:req.body.category})
 
  
    

      if(categoryvalidate){

          req.session.message = {
            type: "danger",
            message: "category already exist",
          };
          res.status(500).redirect('/admin/category')
      
      


      }else{
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
  }
  

  exports.deleteCategory=async(req,res)=>{
    // let categorydetails=Category.findOnf({_id:ObjectId(req.params.id)})
    // let productExist=await Product.findOne({category:categorydetails.categoryname})
    // console.log(productExist,categorydetails,categorydetails.categoryname);
   
    await Category.findByIdAndDelete(req.params.id)
    res.redirect('/admin/category')
  }

  exports.displaybycategory=async (req, res) => {
    try {
      let allcategories = await Category.find();
      let category = await Category.findOne({ _id: req.params.id });
      let categoryname = category.categoryname;
  
      let Prducts = await Product.find({
        category: categoryname,
      });
      if (Prducts) {
        res.render("user/shopCategory", {
          Products: Prducts,
          categories: allcategories,
        });
      } else {
        res.redirect("/users/shop");
      }
    } catch (err) {
      console.log(err + "error in category id");
    }
  }