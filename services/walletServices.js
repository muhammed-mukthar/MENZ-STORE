let Wallet=require('../models/wallet')
let Order=require('../models/order')
var ObjectId = require("mongoose").Types.ObjectId;
let moment=require('moment')
module.exports={

    /* ------------------------------ create wallet ----------------------------- */

    createWallet:(userId,user_email)=>{
        try{
            return new Promise(async(resolve,reject)=>{
                let newWallet= new Wallet({
                    userId:ObjectId(userId),
                    email:user_email
                })
                await newWallet.save()
                resolve()
            })
        }catch(err){
            console.log(err,'error happened in create walet service');
        }
       
    },
/* ----------------------------- wallet balancd ----------------------------- */

    wallet_balance:(userId)=>{
        
        return new Promise(async(resolve,reject)=>{
            try{
 let wallet_balance=   await Wallet.findOne({userId:userId})
           resolve(wallet_balance)
            }catch(err){
                console.log(err,'error happened in wallet balance service');
            }
       
        })
    },

    /* --------------------------- refund order status -------------------------- */

    refund_order_status:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                let order=await Order.findOne({_id:ObjectId(orderId)})
                let date=  moment(Date.now()).format('MMMM Do YYYY, h:mm:ss a')
                let message={
                    price:order.totalAmount,
                    message:'order cancelled',
                    isdebited:  false,
                    Date:date
                }
                //  message=`order cancelled   ${order.totalAmount} Rs`
                if(order.status=="cancelled" && order.paymentMethod != "cod"){
                    //if cancelled adding the amount to wallet
                  await  Wallet.updateOne({userId:ObjectId(order.userId)},{
                   $inc:{
                    amount:order.totalAmount
                   },$push:{
                    history:message
                  }
                  },)
                }
                console.log('refunded with message');
                resolve()
            }catch(err){
                console.log(err,'error happened in wallet refund');
            }
            
        })
    },
/* ----------------------------- wallwt payment ----------------------------- */

    wallet_payment:(userId,totalAmount)=>{
        try{
            return new Promise(async(resolve,reject)=>{
                let date=  moment(Date.now()).format('MMMM Do YYYY, h:mm:ss ')
                let message={
                    message:'order paid using wallet',
                    price:totalAmount,
                    isdebited:true,
                   
                    Date:date,
                    
                }
                //  message=`order payment amount debited -${totalAmount} Rs`
                await  Wallet.updateOne({userId:ObjectId(userId)},{
                    $inc:{
                     amount: -totalAmount
                    },$push:{
                        history:message
                    }
                   })
    
                   resolve()
            })

        }catch(err){
            console.log(err,'wallet payment');
        }
        

    }
}