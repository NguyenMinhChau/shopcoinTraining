const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const withdraw = new Schema(
    {
        status: { type: String, default: 'Waiting' },
        code: { type: String, default: '' },
        method: {
            methodName: { type: String, default: '' },
            accountName: { type: String, default: '' },
            accountNumber: { type: String, default: '' },
            transform: { type: Number, default: 0 }
        },
        user: { type: String, default: '' },
        amountUsd: { type: Number, default: 0 },
        amountVnd: { type: Number, default: 0 },
        symbol: { type: String, default: 'USD' },
        commission: { type: Number, default: 0 }
    },
    { timestamps: true }
);

const Withdraw = model('Withdraws', withdraw);

module.exports = Withdraw;
