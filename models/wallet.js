const mongoose = require("mongoose");
const WalletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount:{
    type:Number,
    required:true,
    default:0
  },
  email:{type:String,required:true}
},{
    timestamps:true
});
const Wallet = mongoose.model('Wallet',WalletSchema);
module.exports = Wallet;
