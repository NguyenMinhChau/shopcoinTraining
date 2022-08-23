const mongoose = require('mongoose')

const deposit = new mongoose.Schema({
    status: {type: String, default: ""},
    code: {type: String, default: ""},
    amount: {type: Number, default: 0},
    user: {type: String, default: ""},
    method: {
        code: {type: String, default: ""},
        methodName: {type: String, default: ""},
        accountName: {type: String, default: ""},
        accountNumber: {type: String, default: ""},
        transform: {type: Number, default: 0},
        createAt: {type: String, default: new Date().toUTCString()},
        updateAt: {type: String, default: new Date().toUTCString()},
    },
    amountUsd: {type: Number, default: 0},
    amountVnd: {type: Number, default: 0},
    symbol: {type: String, default: ""},
    createAt: {type: String, default: new Date().toUTCString()},
    updateAt: {type: String, default: new Date().toUTCString()},
})

const Deposit = mongoose.model('Deposits', deposit)
module.exports = Deposit