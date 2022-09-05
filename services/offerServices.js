

 const { rejects } = require("assert");
const { resolve } = require("path");
var ObjectId = require("mongoose").Types.ObjectId;

const category = require("../models/category");
const categoryoffer = require("../models/categoryoffer");
module.exports={
    categoryoffer:(offer,categoryname,categoryId)=>{
        console.log(offer,categoryname,categoryId);
    return new Promise(async(resolve,reject)=>{

        let offercategory=new categoryoffer({
            categoryname:categoryname,
            categoryId:ObjectId(categoryId),
            offer:offer
        })
      let saved=  await offercategory.save()
       
        resolve(saved)
    })
       
    }
}