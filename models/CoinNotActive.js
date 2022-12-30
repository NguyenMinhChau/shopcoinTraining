const mongoose = require('mongoose');

const coin = new mongoose.Schema(
    {
        logo: { type: String, default: '' },
        name: { type: String, default: '' },
        symbol: { type: String, default: '' },
        fullName: { type: String, default: '' }
    },
    { timestamps: true, collection: 'coin-not-active' }
);

const Coin = mongoose.model('CoinNotActive', coin);
module.exports = Coin;
