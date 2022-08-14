const mongoose=require('mongoose')

const CategorySchema=new mongoose.Schema({
    categoryname:{required:true,
    type:String },
    subcategory:[]
})


module.exports=mongoose.model("Category",CategorySchema)