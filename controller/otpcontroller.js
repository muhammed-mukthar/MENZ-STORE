
const User = require("../models/user");


/* -------------------------------- send otp -------------------------------- */

const serviceId=process.env.SERVICE_SID
const accoutntSid=process.env.ACCOUNT_SID
const authToken=process.env.AUTH_TOKEN
const client=require('twilio')(accoutntSid,authToken)
const smskey=process.env.SMS_SECRET_KEY


exports.sendOTP=async(req,res)=>{

  try{


    const isphoneregistered=await User.findOne({phone:req.body.phone})
    console.log(isphoneregistered);
  
    if(!isphoneregistered){
      req.session.message = {
        type: "danger",
        message: "please register first",
      };
      res.redirect('/users/sendotp')
    }else{
  
  
      if(isphoneregistered.isBlocked==true){
        req.session.message={
          type:"danger",
          message:"you are restricted to login"
        }
        res.redirect('/admin/sendotp')
      }else{
  
      client.verify
    .services(serviceId)
    .verifications.create({
      to:`+91${req.body.phone}`,
      channel:"sms"
    })
    .then((resp)=>{
      console.log('response',resp);
      req.session.number=req.body.phone
      res.status(200).redirect('/users/verifyotp')
    }).catch((err)=>{
  
      console.log(err);
    })
  
      }
  
      
  }
  

  }catch(err){


    console.log(err +"error sending otp");
  }

 
  
}


/* ------------------------------- verify otp ------------------------------- */

exports.verifyOtp=(req,res)=>{
  const{otp}=req.body
  
  client.verify
  .services(serviceId)
  .verificationChecks.create({
  
    to:'+917560809706',
    code:otp
})
.then(resp =>{
console.log(resp.status,resp.valid);
  if(resp.valid){
   
       req.session.userlogin=true
    res.redirect('/users')
  }else{
    req.session.message={
      type:"danger",
      message:"you have enterd wrong code"
    }
    res.redirect('/users/verifyotp')
  }

  console.log('otp res',resp);
})
}

/* --------------------------------- sendotp page -------------------------------- */


exports.send_otp_page=(req,res)=>{
  res.render('user/otp')
}



/* ----------------------------- verify otp page ---------------------------- */

exports.verify_otp_page=(req,res)=>{

  res.render('user/validateotp',{number: req.session.number})
}

/* ------------------------------- resend otp ------------------------------- */

exports.resend_otp=(req,res)=>{
  client.verify
  .services(serviceId)
  .verifications.create({
    to:`+91${req.body.entered_value}`,
    channel:"sms"
  })
  .then((resp)=>{
    console.log('response',resp);
    res.status(200).redirect('/users/verifyotp')
  }).catch((err)=>{
    console.log(err);
  })


}