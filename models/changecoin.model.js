const mongoose = require('mongoose');

const change_coin = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['ADD USDT', 'SUB USDT', 'ADD COIN', 'SUB COIN'],
            default: ''
        },
        status: { type: String, default: 'On hold' },
        amount: { type: Number, default: 1 },
        user: { type: String, default: '' },
        createBy: { type: String, default: '' },
        amountUsd: { type: Number, default: 0 },
        symbol: { type: String, default: 'USDT' },
        note: { type: String, default: '' }
    },
    { timestamps: true, collection: 'change-coin-different' }
);

const Change_coin = mongoose.model('change-coin-different', change_coin);
module.exports = Change_coin;
