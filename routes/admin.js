const router = require("express").Router();
const Product = require("../models/product");
const Category = require("../models/category");
const Banner=require('../models/banner')
const Coupon=require('../models/couponoffer')
const adminController=require('../controller/admincontroller')
const userController=require('../controller/usercontroller')
const productController=require('../controller/productcontroller')
const categoryController=require('../controller/categoryController')
const orderController=require('../controller/orderController')
const Order=require('../models/order')
const User=require('../models/user')
var ObjectId = require("mongoose").Types.ObjectId;
let bannerServices=require('../services/bannerServices')
let orderServices=require('../services/orderServices')
let offerServices=require('../services/offerServices')
let couponServices=require('../services/CouponServices')
/* -------------------------------- services -------------------------------- */
const fs = require("fs");
const { route } = require("./user");


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


/* --------------------------- get category offer --------------------------- */
router.get('/categoryoffer',async(req,res)=>{
  let categories= await Category.find()
  let categorylength=categories.length
  res.render("admin/categoryoffer",{categories,categorylength});
})

/* ---------------------------------- post category offer ---------------------------------- */


router.post('/categoryoffer',async(req,res)=>{
 
  // let newObj={
  //     percentage:req.body.categoryoffer,
  //     valid_from:req.body.validdate,
  //     valid_till:req.body.expiredate,
  //     status:false,
  //     expired:false     
  // }
  let category=req.body.category
  let categoryId=req.body.categoryid
  console.log(categoryId,'category id');
  offerServices.categoryoffer(offer,category,categoryId).then((result)=>{
    console.log(result);
  })
  res.redirect('back')
})

/* ----------------------------- // get category ---------------------------- */



router.get("/category", adminauth, categoryController.categorypage);

/* ----------------------------- //post category ---------------------------- */

router.post("/category",adminauth,categoryController.addCategory );

/* ---------------------------- //delete category --------------------------- */

router.get('/category/:id',adminauth,categoryController.deleteCategory)


/* ------------------------------- order view page ------------------------------- */


router.get('/orders',adminauth,orderController.ordersPageAdmin)


/* --------------------------- order products info -------------------------- */

router.get('/orderedproducts/:id',adminauth,orderController.orderedProductsAdmin)


/* ----------------------------- order user info ---------------------------- */

router.get('/userinfo/:id',adminauth,orderController.orderUserInfo)


/* ------------------------------ order status ------------------------------ */

router.post('/orderstatus/:id',adminauth,orderController.adminChangeOrderStatus)

/* ------------------------- order details sale ------------------------ */

router.get('/order-details',adminauth,orderController.monthsale)

/* ------------------------------- order stat monthly------------------------------- */


router.get('/orderstatmonth',adminauth,orderController.Showstat)

/* -------------------------- admin orders details -------------------------- */


/* ---------------------------- according to date --------------------------- */

router.post('/datestat',adminauth,async(req,res)=>{
  let date=req.body.Datestat
  const daysales = await Order.aggregate([{ $match: { 'status': { $nin: ['cancelled'] } } },
  { $project: { order: '$userId', date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, paymentmode: '$paymentMethod', total: '$totalAmount' } },
  {
    $match: { date: req.body.Datestat }
  }
  ])
  console.log(daysales);
  res.render('admin/orderstat', {'sales': daysales })
})


/* --------------------------- according to month --------------------------- */

router.post('/monthstat',async(req,res)=>{
    let matchkey = req.body.m_year + "-" + req.body.m_month
    console.log(matchkey);
    const monthsales = await Order.aggregate([{ $match: { 'status': { $nin: ['cancelled'] } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
      
        yearmonth: { $first: { $dateToString: { format: "%Y-%m", date: "$date" } } },
        total: { $sum: '$totalAmount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 },
    },
    {
      $match: { yearmonth: matchkey }
    }
    ])
  
    console.log(monthsales);
  
    res.render('admin/orderstat', { 'sales':monthsales })
  })

  /* ----------------------------- yearly reports ----------------------------- */

  router.post('/yearstat',async(req,res)=>{
    let year=req.body.yearstat
    const yearsales = await Order.aggregate([{ $match: { 'status': { $nin: ['cancelled'] } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        month:{ $first: { $dateToString: { format: "%Y-%m", date: "$date" } } },
      
        yearmonth: { $first: { $dateToString: { format: "%Y", date: "$date" } } },
        total: { $sum: '$totalAmount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 },
    },
    {
      $match: { yearmonth: year }
    }
    ])
  
    console.log(yearsales);
  
    res.render('admin/orderstat', { 'sales':yearsales })
  })

  /* --------------------------------- banner --------------------------------- */

router.get('/bannermanage',adminauth,(req,res)=>{
  bannerServices.getbannerpage().then((result)=>{
      res.render('admin/banner',{'bannerdetails':result})
  })

})
router.post('/banner',adminauth,(req,res)=>{
  try{
  let bannerimage=req.files?.bannerimage
  let heading=req.body.heading
  let desc=req.body.desc
  console.log(bannerimage);
  bannerServices.add(heading,desc).then((result)=>{
    bannerServices.bannerimage(bannerimage,result._id).then(()=>{
          console.log(result._id);
    res.redirect('/admin/bannermanage')
    })
  })
  }catch(err){
    console.log(err,'error happened in banner');
  }
})
router.get('/deletebanner/:id',(req,res)=>{
  let bannerId=req.params.id
  bannerServices.deletebanner(bannerId).then(()=>{
    res.redirect('back')
  })
})

/* --------------------------------- coupon --------------------------------- */
router.get('/couponoffer',async(req,res)=>{
   couponServices.allCoupon().then((allcoupon)=>{
    console.log(allcoupon);
      res.render('admin/couponoffer',{allcoupon})
  })
})

/* ------------------------------- create coupon ------------------------------ */


router.post('/coupon',async(req,res)=>{
  try{
 let coupon=req.body.coupon
  let validdate=req.body.validdate
  let expiredate=req.body.expiredate
  let offer=req.body.offer
  let minpurchase=req.body.min

 couponServices.addcoupon(coupon,validdate,expiredate,offer,minpurchase).then((newcoupon)=>{
     console.log(newcoupon);
  
res.redirect('/admin/couponoffer')
 })

}catch(err){
    console.log(err,'error happened in coupon');
  }
})

/* ------------------------------ delete coupon ----------------------------- */

router.get('/deletecoupon/:id',(req,res)=>{
  let couponId=req.params.id
  couponServices.deletCoupon(couponId).then((delet)=>{
  
    res.redirect('back')
  })
})

/* ------------------------------- validcoupon ------------------------------ */
router.get('/validcoupon/:id',(req,res)=>{
  let couponId=req.params.id
    couponServices.validcoupon(couponId).then(()=>{
      res.redirect('back')
    })
})

/* ------------------------------ invalidcoupon ----------------------------- */

router.get('/invalidcoupon/:id',(req,res)=>{ 
    let couponId=req.params.id
      couponServices.Invalidcoupon(couponId).then(()=>{
        res.redirect('back')
      })
})


module.exports = router;
