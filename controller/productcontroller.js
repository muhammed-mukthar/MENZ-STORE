const router = require("express").Router();
const Admin = require("../models/admin");
const User = require("../models/user");
const Product = require("../models/product");
const Category = require("../models/category");
const path=require('path')

const fs = require("fs");   

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








// exports.addproduct = (req, res) => {  
//   try {
//     console.log(req.body,req.files);
//  console.log(req.body.productname)
//    let images=[]
//     if(req.files?.image1){
//         images.push(req.files?.image1)
//     }
//     if(req.files?.image2){
//         images.push(req.files?.image2)
//     }
//     if(req.files?.image3){
//         images.push(req.files?.image3)
//     }
//     const imagepath=[]
//     if(images.length){
//     for(let i=0;i<images.length;i++){
//        let uploadpath='./public/productimage/' + Date.now()+i+'-'+ '.jpeg';
//        let img='productimage/'+Date.now()+i+'.jpeg';
//        imagepath.push(img)
//        images[i]?.mv(uploadpath,(err)=>{
//         console.log(err);
//         returnres.status(500).send(err)
//        })

//     }    
//     }

// console.log(imagepath);
//     var Productsave = new Product({
//       product_name: req.body.productname,
//       desc: req.body.desc,
//       category: req.body.category,
//       subcategory: req.body.subcategory,
//       size: req.body.size,
//       stock: req.body.stock,
//       price: req.body.price,
//       image:imagepath
//     });

//     Productsave.save((err) => {
//       if (err) {
//         res.json({ message: err.message, type: "danger" });
//       } else {
//         req.session.message = {
//           type: "success",
//           message: "User added succesfilly",
//         };
//         res.redirect("/admin/products");
//       }
//     });

//   } catch (err) {
//     res.send(err+ "edit product").status(err);
//   }
// };

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
  
  // }

  

    console.log(req.files?.editedofferprice);
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

console.log(images.length+"image length error here");
    if(images.length){
    
    for(let i=0;i<images.length;i++){
   
       let uploadpath='./public/productimage/'+ Date.now()+i+ '.jpeg';
       let img='productimage/'+Date.now()+i+'.jpeg';
       imagepath.push(img)
       images[i]?.mv(uploadpath)

    }
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
