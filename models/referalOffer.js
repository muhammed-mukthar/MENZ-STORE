const mongoose = require("mongoose");
const referralofferSchema = new mongoose.Schema({
 referralAmount:{
    type:Number,
    default:0
  },refereduserAmount:{
    type:Number,
    default:0
  }
},{
    timestamps:true
});
const referraloffer = mongoose.model('referraloffer',referralofferSchema);
module.exports = referraloffer;
