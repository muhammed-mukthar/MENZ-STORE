
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
    let categorylength=categories.length
    // let subcategorys=categories[categorylength].subcategory
    // console.log(categories,categorylength);
    // console.log(categories[0].subcategory[0]);
    res.render("admin/admincategory",{categories,categorylength});
  }




exports.addCategory=async (req, res) => {
  const categoryvalidate=await Category.findOne({categoryname:req.body.category})
  const categoryexist=await Category.findOne({$and:[{categoryname:req.body.category},{subcategory:req.body.subcategory}]})
    console.log(categoryexist);
    if(!categoryexist){

      if(categoryvalidate){
        const subcategorys=categoryvalidate.subcategory
        subcategorys.push(req.body.subcategory)
       await Category.findByIdAndUpdate(categoryvalidate._id,
          {$set:{
          subcategory:subcategorys

        }})
        



      }else{
          var categorysave = await new Category({
      categoryname: req.body.category,
    subcategory:req.body.subcategory

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
  }else{
    req.session.message = {
      type: "danger",
      message: "category already exist",
    };
    res.status(500).redirect('/admin/category')

  }
  }

  exports.deleteCategory=async(req,res)=>{
    await Category.findByIdAndDelete(req.params.id)
    res.redirect('/admin/category')
  }