const router = require("express").Router();
const Admin = require("../models/admin");
const User = require("../models/user");
const Product = require("../models/product");
const Category = require("../models/category");
const SubCategory = require("../models/subcategory");

const fs = require("fs");
const path=require('path')
/* ------------------------------ all products ------------------------------ */

exports.allproducts = async (req, res) => {
  try {
    let productdetails = await Product.find();

    res.render("admin/adminproduct", { productdetails });
  } catch (err) {
    log(err);
    res.send(err).status(500);
  }
};

/* ---------------------------- add product page ---------------------------- */

exports.addproductspage = async (req, res) => {
  try {
    const category = await Category.find();
    res.render("admin/adminaddproduct", { category });
  } catch (err) {
    log(err);
    res.send(err).status(500);
  }
};

/* ------------------------------- add product ------------------------------ */

exports.addproduct = (req, res) => {  
    
  try {
 console.log(req.body.productname)
   let images=[]
    if(req.files?.image1){
        images.push(req.files?.image1)
    }
    if(req.files?.image2){
        images.push(req.files?.image2)

    }
    if(req.file?.image3){
        images.push(req.files?.image3)
    }
    const imagepath=[]


    if(images.length){
    for(let i=0;i<images.length;i++){
       let uploadpath='./public/productimage/' + Date.now()+i+'-'+ '.jpeg';
       let img='productimage/'+Date.now()+i+'.jpeg'
       imagepath.push(img)
       images[i]?.mv(uploadpath,(err)=>{
        console.log(err);
        returnres.status(500).send(err)
       })

    }    
    
 
    }


    var Productsave = new Product({
      product_name: req.body.productname,
      desc: req.body.desc,
      category: req.body.category,
      subcategory: req.body.subcategory,
      size: req.body.size,
      stock: req.body.stock,
      price: req.body.price,
      image:imagepath
    });

    Productsave.save((err) => {
      if (err) {
        res.json({ message: err.message, type: "danger" });
      } else {
        req.session.message = {
          type: "success",
          message: "User added succesfilly",
        };
        res.redirect("/admin/products");
      }
    });

  } catch (err) {
    res.send(err+ "edit product").status(err);
  }
};

/* ------------------------------ editproducts page ------------------------------ */

exports.edit_productsPage = async (req, res) => {
  try {
    let categorys = await Category.find();
    let productdetails = await Product.findById(req.params.id);
    res.render("admin/admineditproduct", {
      productdetails: productdetails,
      categorys: categorys,
    });
  } catch (err) {
    res.send(err).status(500);
  }
};

/* ------------------------------ edit product ------------------------------ */

exports.editProduct = (req, res) => {
  try {
   
    Product.findByIdAndUpdate(
      id,
      {
        $set: {
          product_name: req.body.productname,
          desc: req.body.desc,
          category: req.body.category,
          subcategory: req.body.subcategory,
          size: req.body.size,
          stock: req.body.stock,
          price: req.body.price,
          img: new_image,
        },
      },
      (err, result) => {
        if (err) {
          res.json({ message: err.message, type: "danger" });
        } else {
          req.session.message = {
            type: "success",
            message: "User updated succesfully",
          };
        }
        res.redirect("/admin/products");
      }
    );
  } catch (err) {
    res.status(500).send(err);
  }
};

/* ----------------------------- delete product ----------------------------- */

exports.deleteproduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect("/admin/products");
  } catch (err) {
    res.status(500).send(err);
  }
};
