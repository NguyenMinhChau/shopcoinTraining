const mongoose = require('mongoose')

const withdraw = new mongoose.Schema({
    status: {type: String, default: "On hold"},
    code: {type: String, default: ""},
    amount: {type: Number, default: 1},
    method: {
        methodName: {type: String, default: ""},
        accountName: {type: String, default: ""},
        accountNumber: {type: String, default: ""},
        transform: {type: Number, default: 0},
        createAt: {type: String, default: new Date().toUTCString()},
        updateAt: {type: String, default: new Date().toUTCString()},
    },
    user: {type: String, default: ""},
    amountUsd: {type: Number, default: 0},
    amountVnd: {type: Number, default: 0},
    symbol: {type: String, default: ""},
}, { timestamps: true })

const Withdraw = mongoose.model('Withdraws', withdraw)
module.exports = Withdraw