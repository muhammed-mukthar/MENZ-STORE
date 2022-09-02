const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    products: Array
});

const cart = mongoose.model('wishlist',wishlistSchema);

module.exports = cart;
