const mongoose = require('mongoose');

const withdraw = new mongoose.Schema(
    {
        status: { type: String, default: 'Waiting' },
        code: { type: String, default: '' },
        amount: { type: Number, default: 1 },
        method: {
            methodName: { type: String, default: '' },
            accountName: { type: String, default: '' },
            accountNumber: { type: String, default: '' },
            transform: { type: Number, default: 0 }
        },
        user: { type: String, default: '' },
        amountUsd: { type: Number, default: 0 },
        amountVnd: { type: Number, default: 0 },
        symbol: { type: String, default: 'USDT' }
    },
    { timestamps: true }
);

const Withdraw = mongoose.model('Withdraws', withdraw);
module.exports = Withdraw;
