let Wallet=require('../models/wallet')
let Order=require('../models/order')
var ObjectId = require("mongoose").Types.ObjectId;
module.exports={
    createWallet:(userId,user_email)=>{
        return new Promise(async(resolve,reject)=>{
            let newWallet= new Wallet({
                userId:ObjectId(userId),
                email:user_email
            })
            await newWallet.save()
            resolve()
        })

    },
    wallet_balance:(userId)=>{
        return new Promise(async(resolve,reject)=>{
        let wallet_balance=   await Wallet.findOne({userId:userId})
           resolve(wallet_balance)
        })
    },
    refund_order_status:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            let order=await Order.findOne({_id:ObjectId(orderId)})
            if(order.status=="cancelled" && order.paymentMethod != "cod"){
                //if cancelled adding the amount to wallet
              await  Wallet.updateOne({userId:ObjectId(order.userId)},{
               $inc:{
                amount:order.totalAmount
               }
              })

            }
            resolve()
        })
    },
    wallet_payment:(userId,totalAmount)=>{
        return new Promise(async(resolve,reject)=>{
            await  Wallet.updateOne({userId:ObjectId(userId)},{
                $inc:{
                 amount: -totalAmount
                }
               })

               resolve()
        })

    }
}