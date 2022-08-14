const Admin = require("../models/admin");
const User = require("../models/user");
const Product = require("../models/product");
const Category=require('../models/category')
const SubCategory=require('../models/subcategory')
const multer = require("multer");
const fs = require("fs");


//display admindash

exports.adminhome=(req, res) => {
  res.render("admin/admin");
}

//get admin login

exports.admindisplaylogin=(req, res) => {
    res.render("admin/login");
  }



  //post login admin 
exports.adminpostlogin=async(req, res) => {
    try {
   const adminvalid= await Admin.findOne( {$and:[{email: req.body.email}, {password:req.body.password}]});
   console.log(adminvalid);
   if(adminvalid){
       req.session.adminlog=true
      res.status(200).redirect("/admin");
   }else{
    req.session.message={
      type:"danger",
      message:"invalid credentials"
    }
     req.session.adminlog=false
   res.redirect('/admin/login')
   }
  
    } catch (err) {
      res.status(500).send(err);
    }
  }


  //admin logout post


  exports.adminlogout=(req,res)=>{
    req.session.adminlog=false
    res.redirect('/admin/login')
  
  }
