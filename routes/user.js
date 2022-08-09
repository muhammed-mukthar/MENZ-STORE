const express = require("express");
const router = express.Router();
const User = require("../models/user");


//get login
router.get("/login", (req, res) => {
  res.render("user/login");
});

//post login

router.post('/login',async(req,res)=>{
    try{
        
    const verifyUser= await  User.findOne({email:req.body.email})
    console.log(req.body);
    if(verifyUser){
        res.status(200).redirect('/users')
    }else{
        res.redirect('/users/login')
    }

    }catch(err){
        res.status(200).send(err)

    }
  
    

    
 

})



router.get("/", (req, res) => {
  res.render("user/home");
});

router.get("/signup", (req, res) => {
  res.render("user/signup");
});


//signup
router.post("/signup", async (req, res) => {
  try {
    const userdetails = new User(req.body);
    await userdetails.save();
    res.status(200).redirect("/users/login");
  } catch (err) {
    res.status(200).send(err);
  }
});

router.get("/cart", (req, res) => {
  res.render("user/cart");
});

router.get("/shop", (req, res) => {
  res.render("user/shop");
});

module.exports = router;
