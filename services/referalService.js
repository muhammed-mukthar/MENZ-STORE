const Referal=require('../models/referal')
const ReferalAmount=require('../models/referalOffer')
const crypto = require('crypto');
const Wallet = require('../models/wallet');
var ObjectId = require("mongoose").Types.ObjectId;

module.exports={

    /* ----------------------------- create referalcode ----------------------------- */

    createReferal:(user_id)=>{
        return new Promise(async(resolve,reject)=>{
            const randomString = crypto.randomBytes(4).toString('hex');//creating random string

            let newReferal= new Referal({
                userId:ObjectId(user_id),
                referralcode:randomString
                
            })
            await newReferal.save()
            resolve()
        })
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

referralAppy:(referalcode,newuser_id)=>{
    return new Promise(async(resolve,reject)=>{
      let refferalcodematch=  await Referal.findOne({referralcode:referalcode})
      if(refferalcodematch){
      let ReferalAmountdetails=await ReferalAmount.find()
     refferaldetails= ReferalAmountdetails=ReferalAmountdetails[0]
     console.log(refferaldetails.referralAmount,'referralAmount',refferaldetails.refereduserAmount,'refereduserAmount');
      await Wallet.updateOne({userId:ObjectId(refferalcodematch.userId)},{$inc:{
        amount:refferaldetails.refereduserAmount
      }})
      await Wallet.updateOne({userId:ObjectId(newuser_id)},{$inc:{amount:refferaldetails.referralAmount}})
      }
      resolve()
    })
}

}