const { rejects } = require("assert")
const { resolve } = require("path")
const WishList=require('../models/wishlist')
var ObjectId = require("mongoose").Types.ObjectId;

module.exports={


  /* ------------------------------ get products ------------------------------ */

    getproducts:(userID)=>{
   
        return new Promise(async(resolve,reject)=>{
          try{
          let wishlistItems = await WishList.aggregate([
              {
                $match: { user: ObjectId(userID) },
              },
              {
                $unwind:'$products'
              },{
                $project:{
                  item:'$products.item',
                  quantity:"$products.quantity"
                }
              },{
                $lookup:{
                  from:'products',
                  localField:'item',
                  foreignField:'_id',
                  as:'product'
              }
              },
              {
                $project: {
                  item: 1,
                  quantity: 1,
                  product: { $arrayElemAt: ["$product", 0] },
                },
              }
            ]).then((data)=>{
              resolve(data)
            })
          }catch(err){
            reject(err)
          }
      })  

    },


    /* ------------------------- delet wishlist product ------------------------- */


    deleteWishlistproduct:(wishlistId,productId,userId)=>{
        return new Promise(async(resolve,reject)=>{
          try{
            await WishList.updateOne({_id:ObjectId(wishlistId),user:ObjectId(userId)},{
              $pull:{
                products:{
                  item:ObjectId(productId)
                }
              }
            })
        resolve(removeproduct=true)
      }catch(err){
        reject(err)
      }
      
        })

    },


    /* ----------------------------- delete wishlist ---------------------------- */

    deleteWishlist:(wishlistId,productId)=>{
      return new Promise(async(resolve,reject)=>{
        try{
          await WishList.updateOne({_id:ObjectId(wishlistId)},{
            $pull:{
              products:{
                item:ObjectId(productId)
              }
            }
          })
          resolve(wishlistdelete=true)
        
        }catch(err){
          reject(err)
        }
       

      })
    },

    wishlistItems:()=>{
      return new Promise(async(resolve,reject)=>{
        await WishList.find()
      })
    }



}