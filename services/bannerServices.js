const Banner=require('../models/banner')
const fs=require('fs')
module.exports={


    /* ------------------------------- add banner ------------------------------- */
    add:(heading,desc)=>{
        return new Promise(async(resolve,reject)=>{
            
                 let bannersave= new Banner({
                    // image:img,
                    heading:heading,
                    desc:desc
                 })
               let saved= await bannersave.save()
               
               resolve(saved)
             
        })
    },
    /* ---------------------------- add banner image ---------------------------- */
    bannerimage:(image,insertedid)=>{
        return new Promise(async(resolve,reject)=>{
            if(image){
                let uploadpath='./public/bannerimage/'+insertedid+'.jpeg';
                 let img='bannerimage/'+insertedid+'.jpeg';
                 image.mv(uploadpath)
                 await Banner.updateOne({_id:insertedid},{
                    $set:{
                        image:img
                    }
                 })
                 resolve()
        }
    })
    },


/* ----------------------------- get banner page ---------------------------- */
    getbannerpage:()=>{
        return new Promise(async(resolve,reject)=>{
        let bannerdetails=await Banner.find()
        resolve(bannerdetails)
        })
    },

    /* --------------------------- delete banner page --------------------------- */

    deletebanner:(bannerId)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                await Banner.deleteOne({_id:bannerId})
         fs.unlinkSync(`./public/bannerimage/${bannerId}.jpeg`)
        resolve()
            } catch (error) {
                reject(error)
            }
        
    })
    }
}