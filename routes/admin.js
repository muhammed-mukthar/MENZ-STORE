const router = require("express").Router();
const Product = require("../models/product");
const Category = require("../models/category");
const adminController=require('../controller/admincontroller')
const userController=require('../controller/usercontroller')
const productController=require('../controller/productcontroller')
const categoryController=require('../controller/categoryController')

const fs = require("fs");


/* ----------------------------- checking admin ----------------------------- */

const adminauth = (req, res, next) => {
  if (req.session.adminlog) {
    next();
  } else {
    res.redirect("/admin/login");
  }
};

/* ------------------------- //admin  dashboard load ------------------------ */

router.get("/", adminauth, adminController.AdminAashboardpage);

/* ------------------------------ //admin login ----------------------------- */
router.get("/login", adminController.loginpage);

/* --------------------------- //admin login post --------------------------- */

router.post("/login",adminController.adminlogin);

/* ------------------------------ //adminlogout ----------------------------- */

router.get("/logout",adminController.adminlogout );


/* -------------------------- //admin get all user -------------------------- */

router.get("/usermanagement", adminauth,userController.getallusers );




/* --------------------------- //update blockuser --------------------------- */

router.get("/block/:id", adminauth, userController.blockuserupdate);

// router.put('/unblock/:id',async(req,res)=>{


/* ---------------------------- // update unblock --------------------------- */

router.get("/unblock/:id", adminauth, userController.unblokuserupdate);

/* ----------------------------- //get products ----------------------------- */

router.get("/products", adminauth, productController.allproducts);

/* ---------------------------- //get addproduct ---------------------------- */

router.get("/addproduct", adminauth, productController.addproductspage);


/* ------------------------------------ * ----------------------------------- */


/* ---------------------------- //post addproduct --------------------------- */






router.post("/addproduct",async(req,res)=>{
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
});

/* ---------------------------- //get editproduct --------------------------- */

router.get("/editproduct/:id", adminauth,productController.edit_productsPage );

/* -------------------------- //upload editproduct -------------------------- */

router.post("/editproduct/:id", productController.editProduct);

/* ----------------------------- //deleteproduct ---------------------------- */

router.get("/deleteproduct/:id", adminauth,productController.deleteproduct );

/* ----------------------------- // get category ---------------------------- */



router.get("/category", adminauth, categoryController.categorypage);

/* ----------------------------- //post category ---------------------------- */

router.post("/category",adminauth,categoryController.addCategory );

/* ---------------------------- //delete category --------------------------- */

router.get('/category/:id',adminauth,categoryController.deleteCategory)




module.exports = router;
