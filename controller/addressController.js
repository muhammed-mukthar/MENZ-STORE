const Address=require('../models/savedAddress')
var ObjectId = require("mongoose").Types.ObjectId;

/* ------------------------- save addres userprofile ------------------------ */

exports.saveAddress=async(req,res)=>{
    try{
 let address1=req.body.address1
    let address2=req.body.address2
    let town=req.body.town
    let postcode=req.body.postcode
    let userId = req.session.user._id
  console.log(address1+"address1"+address2+"address2"+town+"town "+postcode+"post code"+userId+"user id");
    let savedaddress= new Address({
      userId:ObjectId(userId),
      address1:address1,
      address2 :address2,
      city:town,
      pincode:postcode
  })
  await savedaddress.save()
  res.redirect("/userprofile");
    }catch(err){
        console.log(err,'error happend while saving address userprofile');
        res.redirect('/404')
    }
   
  }

  /* ------------------------ save address in checkout ------------------------ */

 exports.saveaddressCheckout=async(req,res)=>{
    try{
 let address1=req.body.address1
    let address2=req.body.address2
    let town=req.body.town
    let postcode=req.body.postcode
    let userId = req.session.user._id
  
    let savedaddress= new Address({
      userId:ObjectId(userId),
      address1:address1,
      address2 :address2,
      city:town,
      pincode:postcode
  })
  await savedaddress.save()
  res.redirect("/checkout");
    }catch(err){
        console.log(err,'error happend while saving address checkout');
        res.redirect('/404')
    }
   
  }

  /* ----------------------------- remove address ----------------------------- */
  exports.removeAddress=async(req,res)=>{
    try{
      let addressId=req.body.AddressId
      await Address.deleteOne({_id:addressId})
      res.json('removed')
    }catch(err){
      console.log(err+"error happened remove address");
      res.redirect('/404')
    }
    }

