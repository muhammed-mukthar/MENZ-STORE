
const Admin = require("../models/admin");


const path=require('path')
var ObjectId = require("mongoose").Types.ObjectId;
const fs = require("fs");   

const User = require("../models/user");
const Cart = require("../models/cart");
const Product = require("../models/product");
const Category = require("../models/category");
const Order=require('../models/order')
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");

const dotenv = require("dotenv");
dotenv.config();



/* ------------------------------ all products ------------------------------ */

exports.allproducts = async (req, res) => {
  try {
    let productdetails = await Product.find();
   
    res.render("admin/adminproduct", { productdetails });
  } catch (err) {
    console.log(err+"error in all products view");
   
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
exports.addproduct=async(req,res)=>{
  try{
    console.log(req.files.image1);
    console.log(req.files.image2);
    console.log(req.files.image3);

  let userfiles=[]

  if(req.files?.image1){ userfiles.push(req.files?.image1)}
  if(req.files?.image2){ userfiles.push(req.files?.image2)}

  if(req.files?.image3){ userfiles.push(req.files?.image3)}

    const imgPath=[]
    console.log(userfiles.length +"image length add product");
    if(userfiles.length){
      for(let i=0;i<userfiles.length;i++){
        var uploadpath='./public/productimage/'+Date.now()+i+'.jpeg'
       var img='productimage/'+Date.now()+i+'.jpeg'

        imgPath.push(img)
        userfiles[i]?.mv(uploadpath,(err)=>{
          if(err){
            console.log(err+"error happened while moving image in add product")
          }else{
            console.log("image"+i+"added");
          }})
      }//end of for loop
      
      const productsave= await new Product({
        product_name:req.body.productname,
        desc:req.body.description ,
        category: req.body.category,
        size: req.body.size,
        stock: req.body.stock,
        price: req.body.price,
        // offerprice:req.body.offerprice,
        image:imgPath,
        
      })
      if(productsave){
         await productsave.save()
         req.session.message = {
          type: "success",
           message: "Product added succesfilly",
}
         res.redirect('/admin/products')
      }else{
        res.console.log(err+"error in saving the new product in add product")
      }
//end of if statement 
    }else{
      console.log("error happend in moving images in add products");
    }
  }catch(err){
    console.log(err+"error in add product")
  }
}

/* ------------------------------ editproducts page ------------------------------ */

exports.edit_productsPage = async (req, res) => {
  try {
    let categorys = await Category.find();
    let productdetails = await Product.findById(req.params.id);
  //   let existproduct=await Product.aggregate( [{$match:{_id:ObjectId(req.params.id)}},  { $project : { image : 1 ,_id:0} }  ] ) 
  // console.log(existproduct[0].image[0]);
 
   
   
    res.render("admin/admineditproduct", {
      productdetails: productdetails,
      categorys: categorys,
    });
  } catch (err) {
    res.send(err +"error").status(500);
  }
};


/* ------------------------------ edit product ------------------------------ */

exports.editProduct = async(req, res) => {
 


  //deletingfiles to be replaced
//   let existproduct= await Product.findById({_id:id})
//   let existimages=[];
//   existimages=existproduct.image
// console.log("existing images"+existimages);
//   // for(let j=0;j<existimages.length;j++){
//     try {
//       fs.unlinkSync("/C:/Users/mukth/OneDriveDocuments/menz store/public/productimage/public/productimage/mukt.jpeg")
  
//       console.log(existimages[j]+"deleted");
//   } catch (error) {
//       console.log(error+"error occured while deleting existing images");
//   }
  
//   }

  
  const id=req.params.id
  let existproduct=await Product.aggregate( [{$match:{_id:ObjectId(id)}},  { $project : { image : 1 ,_id:0} }  ] ) 
  // console.log(existproduct[0].image[0]);
  



    console.log(existproduct[0].image[0]);
    console.log(req.files?.image2);
    console.log(req.body);
    console.log(req.files);
    console.log(req.files?.image3);
    console.log(req.params.id);
  
   let images=[]
   
    if(req.files?.image1){
        images.push(req.files?.image1)
    }
    if(req.files?.image2){
        images.push(req.files?.image2)

    }
    if(req.files?.image3){
        images.push(req.files?.image3)
    }

    const imagepath=[]

console.log(images.length+"image length here");
    if(images.length){
    
    // for(let i=1;i<=3;i++){
      console.log('mukthar');
      console.log(req.files.image1);
   if(req.files.image1){
      let uploadpath='./public/productimage/'+ Date.now()+0+ '.jpeg';
       let img='productimage/'+Date.now()+0+'.jpeg';
       imagepath.push(img)
       req.files.image1.mv(uploadpath)
   }
   else{
    let img=existproduct[0].image[0];
    imagepath.push(img)
   }

   if(req.files.image2){
    let uploadpath='./public/productimage/'+ Date.now()+1+ '.jpeg';
     let img='productimage/'+Date.now()+1+'.jpeg';
     imagepath.push(img)
     req.files.image2.mv(uploadpath)
 }
 else{
  let img=existproduct[0].image[1];
  imagepath.push(img)
 }
 if(req.files.image3){
  let uploadpath='./public/productimage/'+ Date.now()+2+ '.jpeg';
   let img='productimage/'+Date.now()+2+'.jpeg';
   imagepath.push(img)
   req.files.image3.mv(uploadpath)
}
else{
let img=existproduct[0].image[2];
imagepath.push(img)
}
     

    // }

  
       let updateProduct=   await   Product.findByIdAndUpdate({_id:id}
        ,
           {
            $set: {
               product_name: req.body.productname,
               desc: req.body.description,
               category: req.body.category,
               size: req.body.size,
               stock: req.body.stock,
               price: req.body.price,
              //  offerprice:req.body.editedofferprice,
               image: imagepath,
             },
           }
      )
      if(updateProduct){
        req.session.message = {
                  type: "success",
                   message: "Product updated succesfilly",
        }
        res.redirect('/admin/products')
      }else{
        console.log('error in updating products');
        
      }

 
    }else{
    
      let updateproductwithoutimage=await Product.findByIdAndUpdate({_id:id},{
        $set:{
          product_name: req.body.productname,
          desc: req.body.description,
          category: req.body.category,
          size: req.body.size,
          stock: req.body.stock,
          price: req.body.price,
          // offerprice:req.body.editedofferprice,

        }
      })

      if(updateproductwithoutimage){
        req.session.message = {
          type: "success",
           message: "Product updated succesfilly",
           }
          res.redirect('/admin/products')

      }
    
    }
}

/* ----------------------------- delete product ----------------------------- */

exports.deleteproduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect("/admin/products");
  } catch (err) {
    res.status(500).send(err);
  }
};


exports.productviewuser= async (req, res) => {
  try{
  const products = await Product.findById({ _id: req.params.id });

  let images = products.image;

  let imagelength = images.length;

  res.render("user/product-single", { products, imagelength,  isuser: req.session.userlogin, });
  }catch(err){
    console.error('error occured on product view user');
  }

}

exports.displayshop=async (req, res) => {
  try {
    const categories = await Category.find();
    const allProduct = await Product.find();
    if(req.session.userlogin){
      let userid= req.session.user._id
        let cartdetails= await Cart.findOne({user:userid})
        let cartcount= cartdetails?.products.length
        res.render("user/shop", {
          products: allProduct,
          isuser: req.session.userlogin,
          categories,cartcount
        });
    }else{
      res.render("user/shop", {
        products: allProduct,
        isuser: req.session.userlogin,
        categories,cartcount:'0'
      });

    }
  } catch (err) {
    console.log(err + "shop");
  }
}