const mongoose = require('mongoose')

const withdraw = new mongoose.Schema({
    status: {type: String, default: "On hold"},
    amount: {type: Number, default: 1},
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

const Withdraw = mongoose.model('Withdraws', withdraw)
module.exports = Withdraw