const mongoose = require("mongoose");
const referralSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  referralcode:{
    type:String,
    required:true,
  },
},{
    timestamps:true
});
const referral = mongoose.model('Referral',referralSchema);
module.exports = referral;
