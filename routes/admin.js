const router = require("express").Router();

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

router.post("/addproduct",(req,res)=>{
  console.log(req.body); 

  console.log(req.files);
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
