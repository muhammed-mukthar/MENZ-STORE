const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    
    coupon:{
        type: String,
        required: true
    },
    offer:{
        type:Number,
        required:true
    },
    min:{
        type:Number,
        required:true
    },
    from :{ 
        type: Date,
        required:true
    },
    expires:{
        type: Date,
        required: true
    },
    isDelete:{
        type: Boolean,
        default:false
    },
    
   
});

module.exports= mongoose.model('coupon',couponSchema);
