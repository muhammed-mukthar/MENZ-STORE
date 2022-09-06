const mongoose=require('mongoose')

const CategoryofferSchema=new mongoose.Schema({
    categoryname:{required:true ,
    type:String },
    offer:{
        required:true,
        type:Number,
    }
})
module.exports=mongoose.model("Categoryoffer",CategoryofferSchema)