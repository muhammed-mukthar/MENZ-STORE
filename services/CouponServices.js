const { truncate } = require('fs')
const { resolve } = require('path')
const Coupon=require('../models/couponoffer')
const usedCoupon=require('../models/usedcoupon')
var ObjectId = require("mongoose").Types.ObjectId;
module.exports={
    addcoupon:(coupon,validdate,expiredate,offer,minpurchase)=>{
        return new Promise(async(resolve,reject)=>{
        let newcoupon= new Coupon({
            coupon:coupon,
            from:validdate,
            expires:expiredate,
            offer:offer,
            min:minpurchase
        })
        await newcoupon.save()
        resolve(newcoupon)
        }) 
},

allCoupon:()=>{
    return new Promise(async(resolve,reject)=>{
      let allcoupon=  await Coupon.find( { isDelete:{$ne : true} })
      resolve(allcoupon)
    })
},
deletCoupon:(id)=>{
    return new Promise(async(resolve,reject)=>{
        let deletecoupon=await Coupon.updateOne({_id:id},{
            $set:{
                isDelete:true
            }
        })
        resolve(deletecoupon)
    })
},
applyCoupon:(coupon,currentuserId)=>{
    return new Promise(async(resolve,reject)=>{
        let ifcouponused=await usedCoupon.findOne({userId:ObjectId(currentuserId),couponCode:coupon})
        let couponexist= await Coupon.findOne({coupon:coupon,isDelete:{$ne : true},status:false})
        if(couponexist){
            const nowDate = new Date();
            console.log(nowDate.getTime() < couponexist.expires.getTime(),'coupon exist');
            if (nowDate.getTime() > couponexist.expires.getTime()) {
                let err="coupon is expired"
              reject(err)
          }else if(ifcouponused){
            let err="coupon cannot be reused"
            reject(err)
          } else{
     let couponused=   new usedCoupon({
            userId:currentuserId,
            couponCode:couponexist.coupon,
            couponId:couponexist.id,
            min:couponexist.min

        })
        await couponused.save()    
        resolve(couponexist)          
            }
    }else{
        let err="Invalid Coupon"
          reject(err)
    }
    })
},

validcoupon:(couponid)=>{
    return new Promise(async(resolve,reject)=>{
        await Coupon.updateOne({
            _id:ObjectId(couponid)
        },{
            $set:{
                status:false
            }
        })
        resolve()
    })
},

Invalidcoupon:(couponid)=>{
    return new Promise(async(resolve,reject)=>{
        await Coupon.updateOne({
            _id:couponid},{$set:{
                status:true
            }
        })
        resolve()
    })
}
}
