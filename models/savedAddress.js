const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
    userId :{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    address1:{
        type: String,
        required: true
    },
    address2 :{ 
        type: String,
        required:true
    },
    city:{
        type: String,
        required: true
    },
    pincode:{
        type: Number,
        required:true
    },
    
   
},{ timestamps: true });

module.exports= mongoose.model('Address',AddressSchema);
