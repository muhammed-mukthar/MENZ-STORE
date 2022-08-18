const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    products: Array
});

const cart = mongoose.model('cart',cartSchema);

module.exports = cart;