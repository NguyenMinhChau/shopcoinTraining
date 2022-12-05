const mongoose = require('mongoose');

const payment = new mongoose.Schema(
    {
        code: { type: String, default: '' },
        methodName: { type: String, default: '' },
        accountName: { type: String, default: '' },
        accountNumber: { type: String, default: '', unique: true },
        type: { type: String, default: 'user' }
    },
    { timestamps: true }
);

const Payment = mongoose.model('Payments', payment);
module.exports = Payment;
