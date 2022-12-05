const mongoose = require('mongoose');
// const Coins = require('./Coins')

const rateWithdrawDeposit = new mongoose.Schema(
    {
        rateDeposit: { type: Number, default: 23000 },
        rateWithdraw: { type: Number, default: 23000 }
    },
    {
        timestamps: true,
        collection: 'RateWithdrawDeposit'
    }
);

const RateWithdrawDeposit = mongoose.model(
    'RateWithdrawDeposit',
    rateWithdrawDeposit
);
module.exports = RateWithdrawDeposit;
