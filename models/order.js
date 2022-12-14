const mongoose = require('mongoose');

const orderschema = new mongoose.Schema({
    deliveryDetails:{
        type: Object,
        required: true
    },
    userId :{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    paymentMethod:{
        type: String,
        required: true
    },
    date:{
        type: Date,
        required:true
    },
    products:{
        type:Array,
        required:true
    },
    totalAmount:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        required:true,
    }
    
});

const orderModel = mongoose.model('Order',orderschema);

module.exports = orderModel;