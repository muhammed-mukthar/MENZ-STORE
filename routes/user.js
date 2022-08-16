const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Product = require("../models/product");
const bcrypt = require("bcrypt");
const crypto=require('crypto')
const cookieParser=require('cookie-parser')
router.use(cookieParser())
const dotenv = require("dotenv");
dotenv.config();

const userController = require("../controller/usercontroller");

const serviceId=process.env.SERVICE_SID
const accoutntSid=process.env.ACCOUNT_SID
const authToken=process.env.AUTH_TOKEN
const client=require('twilio')(accoutntSid,authToken)
const smskey=process.env.SMS_SECRET_KEY


const userauth = (req, res, next) => {
  if (req.session.userlogin) {
    next();
  } else {
    res.redirect("/users/login");
  }
};

/* ------------------------------- //get login ------------------------------ */
router.get("/login", userController.userloginpage);

/* ------------------------------ //post login ------------------------------ */

router.post("/login", userController.userlogin);


/* --------------------------------- sendotp -------------------------------- */



router.post('/sendotp',(req,res)=>{

  client.verify
  .services(serviceId)
  .verifications.create({
    to:`+91${req.body.phone}`,
    channel:"sms"

  })
  .then((resp)=>{
    console.log('response',resp);
    res.status(200).redirect('/users/verifyotp')
  }).catch((err)=>{
    console.log(err);
  })
})

router.post('/verifyotp',(req,res)=>{
  const{otp}=req.body
  
  client.verify
  .services(serviceId)
  .verificationChecks.create({
  
    to:'+917560809706',
    code:otp
})
.then(resp =>{
  console.log('otp res',resp);
})
})



router.get('/sendotp',(req,res)=>{
  res.render('user/otp')
})
router.get('/verifyotp',userauth,(req,res)=>{

  res.render('user/validateotp')
})

// router.post('/sendotp',userauth,async(req,res)=>{

//   const userexist=await User.findOne({phone:req.body.phone})

//   if(!userexist){
    
   
//     req.session.message = {
//       type: "danger",
//       message: "please signup first",
//     };
//     res.redirect('users/sendotp',)
//   }else{

//     if(userexist.isBlocked==true){
//       req.session.message = {
//         type: "danger",
//         message: "please signup first",
//       };
//       res.redirect('/users/sendotp')
//     }else{
      
// const phone=req.body.phone;
// const otp=Math.floor(100000+ Math.random()*900000)
// const ttl=2*60*1000
// const expires=Date.now()+ttl;
// const data=`${phone}.${otp}.${expires}`
// var  hash= crypto.createHmac('sha256',smskey).update(data).digest('hex')
// const fullhash=`${hash}.${expires}`
// client.messages.create({
//   body:`your one time login password is ${otp}`,
//   from:+12183079171,
//   to:phone

// }).then((messages)=>{
//   console.log(messages);
//   res.status(200).send({phone,hash:fullhash,otp})
// }).catch((err)=>{
//   console.error(err);
// })


// } 
//     }
// })


// router.post('/verifyotp',(req,res)=>{
//   const phone=req.body.phone;
//   const hash=req.body.hash;
//   const otp=req.body.otp;
//   let [hashValue,expires]=hash.split('.')

//   let now=Date.now();
//   if(now>parseInt(expires)){
//     return res.status(504).send({msg:`Timeout Pls Try again`})
//   }
//   const data=`${phone}.${otp}.${expires}`
//   const newCalculatedhash=crypto.createHmac('sha256',smskey).update(data).digest('hex')

//   if(newCalculatedhash=== hashValue){

//     req.session.userlogin=true
//     return res.status(202).send({msg:'user Confirmed'})
//   }else{
//     return res.status(400).send({verification:false, message:`Incorrect otp`})
//   }
   
// })













/* -------------------------------- //logout -------------------------------- */

router.get("/logout", (req, res) => {
  req.session.userlogin = false;
  res.redirect("/");
});

/* -------------------------------- user home ------------------------------- */

router.get("/", (req, res) => {
  res.render("user/home", { isuser: req.session.userlogin });
});

/* ---------------------------------get signup --------------------------------- */

router.get("/signup", (req, res) => {
  res.render("user/signup");
});



/* -------------------------------- //signup -------------------------------- */
router.post("/signup", async (req, res) => {
  try {
    const userexist = await User.findOne({ email: req.body.email });
    console.log(userexist);
    if (userexist) {
      req.session.message = {
        message: "User already exists please login",
      };
      res.status(422).redirect("/users/signup");
    } else {
      const userdetails = await new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: await bcrypt.hash(req.body.password, 10),
      });
      await userdetails.save();
      res.status(200).redirect("/users/login");
    }
  } catch (err) {
    res.status(200).send(err);
  }
});

router.get("/cart", (req, res) => {
  res.render("user/cart", { isuser: req.session.userlogin });
});

router.get("/shop", async (req, res) => {
  const allProduct = await Product.find();
  res.render("user/shop", {
    products: allProduct,
    isuser: req.session.userlogin,
  });
});

module.exports = router;
