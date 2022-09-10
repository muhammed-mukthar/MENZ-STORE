
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
          
      let productcategory=await Category.findOne({_id: ObjectId(req.body.categoryid)})
    let categoryname= productcategory.categoryname
      console.log(categoryname);
      const productsave=  new Product({
        product_name:req.body.productname,
        desc:req.body.description ,
        category:categoryname,
        categoryId: req.body.categoryid,
        size: req.body.size,
        stock: req.body.stock,
        price: req.body.price,
        offerprice:req.body.price,
        image:imgPath,
        
      })
      if(productsave){ 
           
    let   newproduct=  await productsave.save()
         console.log(newproduct._id,'new Product');
         req.session.message = {
          type: "success",
           message: "Product added succesfilly",      
          }
          //checking if category offer exist
          if(productcategory.offer){
            let newofferprice= parseInt(req.body.price * (1 - productcategory.offer.percentage / 100));

            await Product.updateOne({_id:ObjectId(newproduct._id)},{
              $set:{
                offerprice:newofferprice
              }
            })
            
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
 
  
  const id=req.params.id
  let existproduct=await Product.aggregate( [{$match:{_id:ObjectId(id)}},  { $project : { image : 1 ,_id:0} }  ] ) 
  // console.log(existproduct[0].image[0]);
  let productcategory=await Category.findOne({_id: ObjectId(req.body.categoryid)})
  let categoryname= productcategory.categoryname




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
               category:categoryname,
               categoryId: req.body.categoryid,
               size: req.body.size,
               stock: req.body.stock,
               price: req.body.price,
               offerprice:req.body.price,
               image: imagepath,
             },
           }
      )
      if(updateProduct){
        req.session.message = {
                  type: "success",
                   message: "Product updated succesfilly",
        }

          //checking if category offer exist
          if(productcategory.offer){
            let newofferprice= parseInt(  req.body.price * (1 - productcategory.offer.percentage / 100));

            await Product.updateOne({_id:ObjectId(id)},{
              $set:{
                offerprice:newofferprice
              }
            })
            
          }else{
            await Product.updateOne({_id:ObjectId(id)},{
              $set:{
                offerprice:req.body.price
              }
            })

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
          category:categoryname,
        categoryId: req.body.categoryid,
          size: req.body.size,
          stock: req.body.stock,
          price: req.body.price,
          offerprice:req.body.price,

        }
      })

      if(updateproductwithoutimage){
        req.session.message = {
          type: "success",
           message: "Product updated succesfilly",
           }


           //checking if category offer exist
           if(productcategory.offer){
            let newofferprice= parseInt(req.body.price * (1 - productcategory.offer.percentage / 100));

            await Product.updateOne({_id:ObjectId(id)},{
              $set:{
                offerprice:newofferprice
              }
            })
          }else{
            await Product.updateOne({_id:ObjectId(id)},{
              $set:{
                offerprice:req.body.price
              }
            })

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
    const categories = await Category.find();
    
    
    let offercategories=[]
    for(let j=0;j<categories.length;j++){
      if(categories[j].offer){
        offercategories.push(categories[j])
      }
    }
  const products = await Product.findById({ _id: req.params.id });

  let images = products.image;

  let imagelength = images.length;

  res.render("user/product-single", { products, imagelength,offercategories,  isuser: req.session.userlogin, });
  }catch(err){
    console.error('error occured on product view user');
  }

}

exports.displayshop=async (req, res) => {
  try {
    const allProduct = await Product.find();
    const categories = await Category.find();
    
    
    let offercategories=[]
    for(let j=0;j<categories.length;j++){
      if(categories[j].offer){
        offercategories.push(categories[j])
      }
    }
    
    if(req.session.userlogin){
      let userid= req.session.user._id
        let cartdetails= await Cart.findOne({user:userid})
        let cartcount= cartdetails?.products.length
        res.render("user/shop", {
          products: allProduct,
          isuser: req.session.userlogin,
          categories,cartcount,offercategories
        });
    }else{
      res.render("user/shop", {
        products: allProduct,
        isuser: req.session.userlogin,offercategories,
        categories,cartcount:'0'
      });

    }
  } catch (err) {
    console.log(err + "shop");
  }
}