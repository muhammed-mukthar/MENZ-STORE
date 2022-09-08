const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    product_name: {
      required: true,
      type: String,
    },
    desc: {
      requierd: true,
      type: String,
    },
    category: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    stock: { type: Number, required: true },
    offerprice:{
      type: Number,
      default:0,
    },
    price: {
      type: Number,
      required: true,
    },  
    image: Array
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", ProductSchema);
