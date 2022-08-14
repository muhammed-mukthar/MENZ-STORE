const router = require("express").Router();

const Admin = require("../models/admin");
const User = require("../models/user");
const Product = require("../models/product");
const Category = require("../models/category");
const SubCategory = require("../models/subcategory");
const multer = require("multer");
const fs = require("fs");

const adminauth = (req, res, next) => {
  if (req.session.adminlog) {
    next();
  } else {
    res.redirect("/admin/login");
  }
};

//admin  dashboard load

router.get("/", adminauth, (req, res) => {
  res.render("admin/admin");
});

//admin login
router.get("/login", (req, res) => {
  res.render("admin/login");
});

//admin login post

router.post("/login", async (req, res) => {
  try {
    const adminvalid = await Admin.findOne({
      $and: [{ email: req.body.email }, { password: req.body.password }],
    });
    console.log(adminvalid);
    if (adminvalid) {
      req.session.adminlog = true;
      res.status(200).redirect("/admin");
    } else {
      req.session.message = {
        type: "danger",
        message: "invalid credentials",
      };
      req.session.adminlog = false;
      res.redirect("/admin/login");
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

//adminlogout

router.get("/logout", (req, res) => {
  req.session.adminlog = false;
  res.redirect("/admin/login");
});


//admin get all user

router.get("/usermanagement", adminauth, async (req, res) => {
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


//update blockuser

router.get("/block/:id", adminauth, async (req, res) => {
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

// update unblock

router.get("/unblock/:id", adminauth, async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, {
    $set: {
      isBlocked: false,
    },
  });
  res.redirect("/admin/usermanagement");
});

//get products

router.get("/products", adminauth, async (req, res) => {
  let productdetails = await Product.find();

  res.render("admin/adminproduct", { productdetails });
});

//get addproduct

router.get("/addproduct", adminauth, async (req, res) => {
  const category = await Category.find();
  res.render("admin/adminaddproduct", { category });
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


//post addproduct

router.post("/addproduct", upload, (req, res) => {
  var Productsave = new Product({
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
      res.redirect("/admin/products");
    }
  });
});

//get editproduct

router.get("/editproduct/:id", adminauth, async (req, res) => {
  let categorys=await Category.find()
  let productdetails = await Product.findById(req.params.id);
  res.render("admin/admineditproduct", { productdetails: productdetails ,categorys:categorys});
});

//upload editproduct

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
});

//deleteproduct

router.get("/deleteproduct/:id", adminauth, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.redirect("/admin/products");
});

// get category



router.get("/category", adminauth, async(req, res) => {
  let categories= await Category.find()
  res.render("admin/admincategory",{categories});
});

//post category

router.post("/category", async (req, res) => {

  console.log(req.body.category);
  var categorysave = await new Category({
    categoryname: req.body.category,
  });
  console.log(categorysave);
  categorysave.save((err) => {
    if (err) {
      res.json({ message: err.message });
    } else {
      req.session.message = {
        type: "success",
        message: "category added succesfilly",
      };
      res.redirect("/admin/category");
    }
  });
});

//delete category

router.get('/category/:id',async(req,res)=>{

  await Category.findByIdAndDelete(req.params.id)
  res.redirect('/admin/category')
})

//get subcategory

router.get('/subcategory',adminauth,async(req,res)=>{
  let categorys=await Category.find()
  let subcategories=await SubCategory.find()
  res.render("admin/adminsubcategory", { categorys:categorys,subcategories:subcategories});
  
})

// post subcategory

router.post('/subcategory',adminauth,async(req,res)=>{
  await new  SubCategory({
    categoryId:req.body.category,
    subcategoryname:req.body.subcategory

  }).save((err)=>{
    if (err) {
      res.json({ message: err.message });
    } else {
      req.session.message = {
        type: "success",
        message: "category added succesfilly",
      };
      res.redirect("/admin/subcategory");
    }

  })
})




module.exports = router;
