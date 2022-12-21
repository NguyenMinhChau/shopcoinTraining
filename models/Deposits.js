const mongoose = require('mongoose');

const deposit = new mongoose.Schema(
    {
        status: { type: String, default: 'On hold' },
        code: { type: String, default: '' },
        amount: { type: Number, default: 0 },
        user: { type: String, default: '' },
        createBy: { type: String, default: '' },
        method: {
            code: { type: String, default: '' },
            methodName: { type: String, default: '' },
            accountName: { type: String, default: '' },
            accountNumber: { type: String, default: '' },
            transform: { type: Number, default: 0.0 }
        },
        amountUsd: { type: Number, default: 0.0 },
        amountVnd: { type: Number, default: 0.0 },
        symbol: { type: String, default: 'USDT' },
        statement: { type: String, default: '' },
        bankAdmin: { type: Object, default: {} },
        note: { type: String, default: '' }
    },
    { timestamps: true }
);

const Deposit = mongoose.model('Deposits', deposit);
module.exports = Deposit;
