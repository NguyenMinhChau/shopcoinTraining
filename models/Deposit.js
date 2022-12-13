const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const deposit = new Schema(
    {
        status: { type: String, default: 'Pending' },
        code: { type: String, default: '' },
        user: { type: String, default: '' },
        method: {
            code: { type: String, default: '' },
            methodName: { type: String, default: '' },
            accountName: { type: String, default: '' },
            accountNumber: { type: String, default: '' },
            transform: { type: Number, default: 0.0 }
        },
        amountUsd: { type: Number, default: 0.0 },
        amountVnd: { type: Number, default: 0.0 },
        symbol: { type: String, default: 'USD' },
        statement: { type: String, default: '' },
        bankAdmin: { type: Object, default: {} },
        commission: { type: Number, default: 0 }
    },
    { timestamps: true }
);

const Deposit = model('Deposits', deposit);

module.exports = Deposit;
