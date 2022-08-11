const router = require("express").Router();

const Admin = require("../models/admin");
const User = require("../models/user");
const Product = require("../models/product");
const multer = require("multer");
const fs = require("fs");


router.get("/", (req, res) => {
  res.render("admin/admin");
});

//admin login
router.get("/login", (req, res) => {
  res.render("admin/login");
});

//admin login post

router.post("/login", (req, res) => {
  try {
    Admin.findOne({ email: req.body.email }, { password: req.body.password });
    res.status(200).redirect("/admin");
  } catch (err) {
    res.status(500).send(err);
  }
});

//admin get all user

router.get("/usermanagement", async (req, res) => {
  try {
    let getuser = await User.find();

    res.status(200).render("admin/adminuser", { listuser: getuser });
  } catch (err) {
    res.send(err).status(500);
  }
});

// router.put('/block/:id',async(req,res)=>{
//   console.log(req.params.id);
//     await User.findByIdAndUpdate(req.params.id,{

//         $set:{
//             isBlocked:true
//         }
//     })
// res.redirect('/admin/usermanagement')
// })

router.get("/block/:id", async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, {
    $set: {
      isBlocked: true,
    },
  });

  res.redirect("/admin/usermanagement");
});

// router.put('/unblock/:id',async(req,res)=>{

//     await User.findByIdAndUpdate(req.params.id,{

//         $set:{
//             isBlocked:false
//         }
//     })
// res.redirect('/admin/usermanagement')
// })

router.get("/unblock/:id", async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, {
    $set: {
      isBlocked: false,
    },
  });
  res.redirect("/admin/usermanagement");
});

router.get("/product", async (req, res) => {
  let productdetails = await Product.find();

  res.render("admin/adminproduct", { productdetails });
});

router.get("/addproduct", (req, res) => {
  res.render("admin/adminaddproduct");
});

var Storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});
var upload = multer({
  storage: Storage,
}).single("productimage");

router.post("/addproduct", upload, (req, res) => {
  const Productsave = new Product({
    product_name: req.body.productname,
    desc: req.body.desc,
    category: req.body.category,
    subcategory: req.body.subcategory,
    size: req.body.size,
    stock: req.body.stock,
    price: req.body.price,
    img: req.file.filename,
  });
  Productsave.save((err) => {
    if (err) {
      res.json({ message: err.message, type: "danger" });
    } else {
      req.session.message = {
        type: "success",
        message: "User added succesfilly",
      };
      res.redirect("/");
    }
  });
});

router.get("/editproduct/:id", async (req, res) => {
  let productdetails = await Product.findById(req.params.id);

  res.render("admin/admineditproduct", { productdetails: productdetails });
});

//ed

router.post("/editproduct/:id", upload, (req, res) => {
  let id = req.params.id;
  let new_image = "";

  if (req.file) {
    new_image = req.file.filename;
    try {
      fs.unlinkSync("./uploads/" + req.body.old_image);
    } catch (err) {
      console.log(err);
    }
  } else {
    new_image = req.body.old_image;
  }
  Product.findByIdAndUpdate(id, {
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
    
  },(err,result)=>{
    if(err){
      res.json({message: err.message,type:'danger'})
    }else{
      req.session.message={
        type:"success",
        message:"User updated succesfully"
      }
    };
    res.redirect('/admin/product')

  });
});

router.get('/deleteproduct/:id',async(req,res)=>{
  await Product.findByIdAndDelete(req.params.id)
  res.redirect('/admin/product')
})


router.get('/category',(req,res)=>{
  res.render('admin/admincategory')
})

module.exports = router;
