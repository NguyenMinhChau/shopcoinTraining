const mongoose = require('mongoose');

const payment = new mongoose.Schema(
    {
        code: { type: String, default: '' },
        methodName: { type: String, default: '' },
        accountName: { type: String, default: '' },
        accountNumber: { type: String, default: '', unique: true },
        rateDeposit: { type: Number, default: 22000 },
        rateWithdraw: { type: Number, default: 21900 },
        type: {type: String, default: "user"}
    },
    { timestamps: true }
);

const Payment = mongoose.model('Payments', payment);
module.exports = Payment;
