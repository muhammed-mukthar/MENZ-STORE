const mongoose=require('mongoose')

const SubCategorySchema=new mongoose.Schema({
    categoryId:{type:String},
    subcategoryname:{required:true,
    type:String ,unique:true},
    
},{timestamps:true})


module.exports=mongoose.model("SubCategory",SubCategorySchema)