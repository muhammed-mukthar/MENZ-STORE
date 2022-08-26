const router = require("express").Router();
const Product = require("../models/product");
const Category = require("../models/category");
const adminController=require('../controller/admincontroller')
const userController=require('../controller/usercontroller')
const productController=require('../controller/productcontroller')
const categoryController=require('../controller/categoryController')
const Order=require('../models/order')
var ObjectId = require("mongoose").Types.ObjectId;

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






router.post("/addproduct",adminauth,productController.addproduct);

/* ---------------------------- //get editproduct --------------------------- */

router.get("/editproduct/:id", adminauth,productController.edit_productsPage );

/* -------------------------- //upload editproduct -------------------------- */

router.post("/editproduct/:id",adminauth, productController.editProduct);

/* ----------------------------- //deleteproduct ---------------------------- */

router.get("/deleteproduct/:id", adminauth,productController.deleteproduct );

/* ----------------------------- // get category ---------------------------- */



router.get("/category", adminauth, categoryController.categorypage);

/* ----------------------------- //post category ---------------------------- */

router.post("/category",adminauth,categoryController.addCategory );

/* ---------------------------- //delete category --------------------------- */

router.get('/category/:id',adminauth,categoryController.deleteCategory)


router.get('/orders',adminauth,async(req,res)=>{

  let  orderinfo=await Order.find()


  res.render('admin/adminorder',{orderinfo})
})


router.get('/orderedproducts/:id',async(req,res)=>{
  let orderId=req.params.id
  let orderdItems = await Order.aggregate([
    {
      $match: { _id: ObjectId(orderId) },
    },
    {
      $unwind:'$products'
    },{
      $project:{
        item:'$products.item',
        quantity:"$products.quantity"
      }
    },{
      $lookup:{
        from:'products',
        localField:'item',
        foreignField:'_id',
        as:'product'
    }
    },
    {
      $project: {
        item: 1,
        quantity: 1,
        product: { $arrayElemAt: ["$product", 0] },
      },
    }
  ])

res.render('admin/orderproducts',{orderdItems})


})

router.get('/userinfo/:id',async(req,res)=>{
  let orderId=req.params.id

  const userDetails = await Order.aggregate([
        
    {
     
        $match: { _id: ObjectId(orderId) },
      },{
        $lookup:{
            from:'users',
            localField:'userId',
            foreignField:'_id',
            as:'userData'
        }
    },
  ])
  console.log(userDetails[0].userData[0].name);

res.render('admin/orderedusers',{userDetails})
})


router.post('/orderstatus/:id',async(req,res)=>{
  try{
    let orderId=req.params.id
    let updatedstatus=req.body.status
  
    await Order.updateOne({_id:orderId},{
      $set:{
        status:updatedstatus
      }
    })
    res.redirect('/admin/orders')

  }catch(err){
    console.log('error happened in order status'+err);
  }

 
})



module.exports = router;
