const Referal=require('../models/referal')
const ReferalAmount=require('../models/referalOffer')
const crypto = require('crypto');
const User=require('../models/user')
const Wallet = require('../models/wallet');
var ObjectId = require("mongoose").Types.ObjectId;
let moment=require('moment')

module.exports={

    /* ----------------------------- create referalcode ----------------------------- */

    createReferal:(user_id)=>{
        try{
            return new Promise(async(resolve,reject)=>{
                const randomString = crypto.randomBytes(4).toString('hex');//creating random string
    
                let newReferal= new Referal({
                    userId:ObjectId(user_id),
                    referralcode:randomString
                    
                })
                await newReferal.save()
                resolve()
            })
        }catch(err){
            console.log(err,'error in create referal service');
        }
        
    },

    /* ----------------------- find referal code for user ----------------------- */

    findreferal:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let referal=await  Referal.findOne({
                userId:ObjectId(userId)
            })
            resolve(referal.referralcode)
        })

    },

    /* -------------------------- change  referal amount ------------------------- */

    referramount:(referalAmount,referedUser)=>{
        return new Promise(async(resolve,reject)=>{
          let referalamountexist=  await ReferalAmount.find()  
          
          if(referalamountexist.length == 0){
        
        let  Referaloffer=    new ReferalAmount({
            referralAmount:referalAmount,
            refereduserAmount:referedUser
            })
            await Referaloffer.save()
          }else{

            await ReferalAmount.updateOne({
                _id:ObjectId(referalamountexist[0]._id)},{
                    $set:{
                        refereduserAmount:referedUser,
                        referralAmount:referalAmount
                    }
                })
          }
          resolve()          
    })
},

/* ------------------------- referal amount details ------------------------- */

referramountdetails:()=>{
    return new Promise(async(resolve,reject)=>{
        let ReferalAmountdetails=await ReferalAmount.find()
        resolve(ReferalAmountdetails[0])
        
    })
},

/* ------------------------- delete referral amount ------------------------- */
delete_referralOffer:(refferralOfferId)=>{
    return new Promise(async(resolve,reject)=>{
        await ReferalAmount.updateOne({
            _id:ObjectId(refferralOfferId)
        },{
            $set:{
                refereduserAmount:0,
                referralAmount:0
            }
        })
        resolve()
    })

},


/* ----------------------------- apply referral ----------------------------- */

referralApply:(referalcode,newuser_id)=>{
    try{
        return new Promise(async(resolve,reject)=>{
            if(referalcode){
                 let refferalcodematch=  await Referal.findOne({referralcode:referalcode})
          if(refferalcodematch){
          let ReferalAmountdetails=await ReferalAmount.find()
         refferaldetails= ReferalAmountdetails=ReferalAmountdetails[0]
         console.log(refferaldetails.referralAmount,'referralAmount',refferaldetails.refereduserAmount,'refereduserAmount');
       let date=  moment(Date.now()).format('MMMM Do YYYY, h:mm:ss a')
         let referaluser_msg={
            message:'referal code used ',
            price:refferaldetails.referralAmount,
            Date:date,
            isdebited:  false ,
         }
         
         let  referreduser_msg={
            message:'user used your referral  ',
            price:refferaldetails.refereduserAmount,
            Date:date,
            isdebited:  false

         }
        //  referaluser_msg=`referal code used credited Rs ${refferaldetails.referralAmount} `
        // referreduser_msg=`referal   offer  credited Rs ${refferaldetails.refereduserAmount}`

          await Wallet.updateOne({userId:ObjectId(refferalcodematch.userId)},{$inc:{
            amount:refferaldetails.refereduserAmount
          },$push:{
            history:referreduser_msg
          }})
          await Wallet.updateOne({userId:ObjectId(newuser_id)},{$inc:{amount:refferaldetails.referralAmount},$push:{
            history:referaluser_msg
          }})
          }else{
            await User.deleteOne({_id:ObjectId(newuser_id)})
            await Wallet.deleteOne({userId:ObjectId(newuser_id)})
            let err='incorrect referral code'
            reject(err)
          }
          resolve()
            }else{
                resolve()
            }
         
        })
    }catch(err){
        console.log(err,'error referalapply services');
    }
  
}

}