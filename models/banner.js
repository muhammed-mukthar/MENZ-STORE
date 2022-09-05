const mongoose=require('mongoose')

const bannerSchema= mongoose.Schema({
    image:{
        type:String,
        
    },
    heading:{
        type:String,
        required:true
    },
    desc:{
        type:String,
        required:true
    }
})
const banner = mongoose.model('banner',bannerSchema);

module.exports = banner;
