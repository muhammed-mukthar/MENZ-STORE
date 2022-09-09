const mongoose = require('mongoose');

const usedcouponSchema = new mongoose.Schema({
    userId :{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    couponId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'coupon'
    },
    totalspend:{
        type:Number,
    },
    couponCode :{ 
        type: String,
        required:true
    },
    min:{
        type:Number,
        required:true
    }
}, { timestamps: true },);

module.exports= mongoose.model('usedcoupon',usedcouponSchema);
