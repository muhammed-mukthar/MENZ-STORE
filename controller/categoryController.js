
const router = require("express").Router();
const Admin = require("../models/admin");
const User = require("../models/user");
const Product = require("../models/product");
const Category = require("../models/category");


const offerServices=require('../services/offerServices')
var ObjectId = require("mongoose").Types.ObjectId;
const fs = require("fs");

/* ------------------------------ category page ----------------------------- */
exports.categorypage=async(req, res) => {
  try{
    let categories= await Category.find()
    let categorylength=categories.length
    res.render("admin/admincategory",{categories,categorylength});
  }catch(err){
    console.log(err,'error happened in category page');
    res.redirect('/404')
  }
   
   
  }

/* ------------------------------ add category ------------------------------ */



exports.addCategory=async (req, res) => {
  try{

 
  const categoryvalidate=await Category.findOne({categoryname:req.body.category})
 
      if(categoryvalidate){
          req.session.message = {
            type: "danger",
            message: "category already exist",
          };
          res.status(500).redirect('/admin/category')
      }else{
          var categorysave =  new Category({
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
    }catch(err){
      console.log(err,'errpr om add categpru');
      res.redirect('/404')
    }
  }
  exports.deleteCategory=async(req,res)=>{
    try{

  

    let existingcategory=await Category.findOne({_id:ObjectId(req.params.id)})
    let productExist=await Product.find({category:existingcategory.categoryname})    
    if(productExist.length > 0){
      req.session.message = {
        type: "danger",
        message: "There is products in this category please change before deleting",
      };
    }else{
        await Category.findByIdAndDelete(req.params.id)
    }
  
    res.redirect('/admin/category')
  }catch(err){
    console.log(err,'erroo happend in delete category');
    res.redirect('/404')
  }
  }

  exports.displaybycategory=async (req, res) => {
    try {
      let allcategories = await Category.find();
      let category = await Category.findOne({ _id: ObjectId(req.params.id) });
      let categoryname = category.categoryname;
    let offercategories=[]
    for(let j=0;j<allcategories.length;j++){
      if(allcategories[j].offer){
        offercategories.push(allcategories[j])
      }
    }
  
      let Prducts = await Product.find({
        category: categoryname,
      });
      if (Prducts) {
        res.render("user/shopcategory", {
          Products: Prducts,
          categories: allcategories,offercategories,
          isuser: req.session.userlogin
        });
      } else {
        res.redirect("/shop");
      }
    } catch (err) {
      console.log(err + "error in category id");
 
      res.redirect('/404')
    
    }
  }


  exports.categoryoffer=async (req, res) => {
    try {
      let newObj = {
        percentage: Number(req.body.categoryoffer),
        valid_from: new Date(req.body.validdate),
        valid_till: new Date(req.body.expiredate),
        status: false,
        expired: false,
      };
      console.log(newObj);
  
      let categoryId = req.body.category;
      offerServices
        .categoryoffer(newObj, categoryId)
        .then((result) => {
          res.redirect("back");
        })
        .catch(() => {
          res.redirect("back");
        });
    } catch (err) {
      console.log(err, "error occured on categoryoffer");
      res.redirect('/404')
    }
  }

  exports.categoryofferpage=async (req, res) => {
    try{
    let categories = await Category.find();
    let categorylength = categories;
    res.render("admin/categoryoffer", { categories, categorylength });
     } catch(err){
      console.log(err,'erroo happend in  category offer');
      res.redirect('/404')
    }
  }


  exports.deletecategoryoffer=(req, res) => {
    try {
      let cateogryid = req.params.id;
      offerServices.deleteCategoryoffer(cateogryid).then(() => {
        res.redirect("back");
      });
    } catch (err) {
      console.log("error happened in delete category offer");
      res.redirect('/404')
    }
  }