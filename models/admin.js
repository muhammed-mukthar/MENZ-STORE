const mongoose=require('mongoose')




const AdminSchema=new mongoose.Schema({
    email:{required:true,
    type:String ,unique:true},
    password:{type:String,required:true}
})

/* --------------------------------- sjdhaad -------------------------------- */
module.exports=mongoose.model("Admin",AdminSchema)