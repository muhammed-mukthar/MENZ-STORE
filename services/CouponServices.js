const { resolve } = require('path')
const Coupon=require('../models/couponoffer')

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
applyCoupon:(coupon,total)=>{
    return new Promise(async(resolve,reject)=>{
        let couponexist= await Coupon.findOne({coupon:coupon,isDelete:{$ne : true}})
        if(couponexist){
            const nowDate = new Date();
            if (nowDate.getTime() > couponexist.expires.getTime()) {
                req.session.message = {
                    type: "danger",
                     message: "Coupon is expired",
          }
                resolve()
                // res.json({ error: 'Coupon is expired' })
            }
            else if (couponexist.min < total) {
                
                discountPrice = total-couponexist.min
                req.session.fulltotal=discountPrice
                resolve()
            }else{
                req.session.message = {
                    type: "danger",
                     message: "Coupon valid on order above <%=%>",
                  }
                  resolve()
                
            }
    }else{
        req.session.message = {
            type: "danger",
             message: "Invalid coupon",
          }
          resolve()
    }
    })
}

}
