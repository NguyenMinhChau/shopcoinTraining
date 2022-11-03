const mongoose = require('mongoose');

const payment = new mongoose.Schema(
    {
        code: { type: String, default: '' },
        methodName: { type: String, default: '' },
        accountName: { type: String, default: '' },
        accountNumber: { type: String, default: '' },
        rateDeposit: { type: Number, default: 22000 },
        rateWithdraw: { type: Number, default: 21900 }
    },
    { timestamps: true }
);

const Payment = mongoose.model('Payments', payment);
module.exports = Payment;
