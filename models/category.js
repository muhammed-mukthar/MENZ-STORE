const mongoose=require('mongoose')

const CategorySchema=new mongoose.Schema({
    categoryname:{required:true,
    type:String },
    subcategory:[{
        type:String
    }]
})


module.exports=mongoose.model("Category",CategorySchema)