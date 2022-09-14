const { rejects } = require("assert");
const { resolve } = require("path");
var ObjectId = require("mongoose").Types.ObjectId;
const Cart = require("../models/cart");
const category = require("../models/category");
const Product = require("../models/product");
module.exports = {

  categoryoffer: (offerObj, categoryId) => {
    console.log(offerObj);
    return new Promise(async (resolve, reject) => {
      let cateforyOffer = await category.updateOne(
        { _id: ObjectId(categoryId) },
        {
          $set: {
            offer: offerObj,
          },
        }
      );
      let allProduct = await Product.find();
      let categories = await category.find();
      let offercategories = [];
      const nowDate = new Date();
      for (let j = 0; j < categories.length; j++) {
        if (categories[j].offer) {
          offercategories.push(categories[j]);
        }
      }
      console.log(offercategories, "while displaying cart");

      for (let m = 0; m < allProduct.length; m++) {
        for (let k = 0; k < offercategories.length; k++) {
         
          if (allProduct[m].category === offercategories[k].categoryname) {
            console.log("inside the loop");
            console.log(nowDate.getTime(),'nowdate',offercategories[k].offer.valid_from.getTime(),'valid from' , offercategories[k].offer.valid_from  <  nowDate < offercategories[k].offer.valid_till,'now date',offercategories[k].offer.valid_till.getTime(),'valid till');
            if (       offercategories[k].offer.valid_from.getTime()  < nowDate.getTime() < offercategories[k].offer.valid_till.getTime()) {

                let offerprice = parseInt(
              allProduct[m].price *
                (1 - offercategories[k].offer.percentage / 100)
            );
            console.log(offerprice, "hello");

            await Product.updateOne(
              {
                categoryId: ObjectId(offercategories[k].id),
                _id: allProduct[m]._id,
              },
              {
                $set: {
                  offerprice: offerprice,
                },
              }
            );
            }else{
              offercategories[k].offer.expired=true
              await category.updateOne({
                _id:ObjectId(offercategories[k].id)
              },{
                $set:{
                  offer:offercategories[k].offer
                }
              })
              reject()
            }

          
          } else {
            
            console.log("outside the loop");
          }
        }
      }

      resolve(cateforyOffer);
    });
  },

  deleteCategoryoffer:(categoryid)=>{
    return new Promise(async(resolve,reject)=>{
      let findCategory=await category.findOne({_id:ObjectId(categoryid)})
      await category.updateOne({
        _id:ObjectId(categoryid)
      },{
        $unset:{
          offer:""
        }
      })
      let allProduct = await Product.find();
      for (let m = 0; m < allProduct.length; m++) {
        
          console.log(allProduct[m].price, ObjectId(categoryid));
        
          if (allProduct[m].category == findCategory.categoryname ) {
            console.log("inside the loop");
            let offerprice = parseInt(
              allProduct[m].price 
            );
            console.log(offerprice, "hello");

            await Product.updateOne(
              {
                categoryId: ObjectId(categoryid),
                _id: allProduct[m]._id,
              },
              {
                $set: {
                  offerprice: offerprice,
                },
              }
            );
          } else {
            console.log("outside the loop");
          } 
      }
      resolve('success');
    })
  }

};
