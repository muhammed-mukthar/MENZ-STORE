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

// router.put('/block/:id',async(req,res)=>{
//   console.log(req.params.id);
//     await User.findByIdAndUpdate(req.params.id,{

//         $set:{
//             isBlocked:true
//         }
//     })
// res.redirect('/admin/usermanagement')
// })


/* --------------------------- //update blockuser --------------------------- */

router.get("/block/:id", adminauth, userController.blockuserupdate);

// router.put('/unblock/:id',async(req,res)=>{

//     await User.findByIdAndUpdate(req.params.id,{

//         $set:{
//             isBlocked:false
//         }
//     })
// res.redirect('/admin/usermanagement')
// })

/* ---------------------------- // update unblock --------------------------- */

router.get("/unblock/:id", adminauth, userController.unblokuserupdate);

/* ----------------------------- //get products ----------------------------- */

router.get("/products", adminauth, productController.allproducts);

/* ---------------------------- //get addproduct ---------------------------- */

router.get("/addproduct", adminauth, productController.addproductspage);

/* ------------------------ image upload using multer ----------------------- */

/* ------------------------------------ * ----------------------------------- */


/* ---------------------------- //post addproduct --------------------------- */




// router.post('/addproduct',async(req,res)=>{

//   try {
//     const productsave= await new Product({
//             product_name:req.body.productname,
//             desc:req.body.description ,
//             category: req.body.category,
//             subcategory: req.body.subcategory,
//             size: req.body.size,
//             stock: req.body.stock,
//             price: req.body.price,
//           })
//           if(productsave){
//              await productsave.save() 
//              let productid=await Product.findOne({product_name:req.body.product_name})
//            let id=productid._id
//              let image1=req.files.image1
//              let image2=req.files.image1
//              let image3=req.files.image1
//              console.log(id)
//             //  for(i=1;i<3;i++){
//   image1.mv('./public/product-images/'+id+1+'.jpg'),
//   image2.mv('./public/product-images/'+id+2+'.jpg'),
//   image3.mv('./public/product-images/'+id+3+'.jpg')
//             //  }
           

//              res.redirect('/admin/products')


//           }else{
//             res.send(err+"add product").status(500)
//           }
//   } catch (error) {

//     console.log(error);
//   }





// })








router.post("/addproduct",async(req,res)=>{
  try{
    console.log(req.files.image1);
    console.log(req.files.image2);
    console.log(req.files.image1);

  let userfiles=[]

  if(req.files?.image1){ userfiles.push(req.files?.image1)}
  if(req.files?.image2){ userfiles.push(req.files?.image2)}

  if(req.files?.image3){ userfiles.push(req.files?.image3)}

    const imgPath=[]
    if(userfiles.length){
      for(let i=0;i<userfiles.length;i++){
        var uploadpath='./public/productimage/'+Date.now()+i+'jpeg'
       var img='productimage/'+Date.now()+i+'jpeg'

        imgPath.push(img)
        userfiles[i]?.mv(uploadpath,(err)=>{
          if(err){
            console.log(err)
            return res.status(500).send(err)

          }

        })
      }
    }

    const productsave= await new Product({
      product_name:req.body.productname,
      desc:req.body.description ,
      category: req.body.category,
      size: req.body.size,
      stock: req.body.stock,
      price: req.body.price,
      image:imgPath,
      
    })
    if(productsave){
       await productsave.save()

       res.redirect('/admin/products')
    }else{
      res.send(err+"add product").status(500)
    }

  }catch(err){
    res.send(err+"add product").status(500)

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
