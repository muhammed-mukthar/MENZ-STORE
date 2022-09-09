

 const { rejects } = require("assert");
const { resolve } = require("path");
var ObjectId = require("mongoose").Types.ObjectId;

const category = require("../models/category");
const categoryoffer = require("../models/categoryoffer");
module.exports={
    categoryoffer:(offerObj,categoryId)=>{
        console.log(offerObj);
    return new Promise(async(resolve,reject)=>{

        let cateforyOffer=category.updateOne({_id:ObjectId(categoryId)},{$set:{
            offer:offerObj
        
        }})
      
       
        resolve(cateforyOffer)
    })
       
    }
}