const mongoose = require('mongoose')

const payment = new mongoose.Schema({
    code: {type: String, default: ""},
    methodName: {type: String, default: ""},
    accountName: {type: String, default: ""},
    transform: {type: Number, default: 0},
    createAt: {type: String, default: new Date().toUTCString()},
    updateAt: {type: String, default: new Date().toUTCString()},
})

const Payment = mongoose.model('Payments', payment)
module.exports = Payment