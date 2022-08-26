const mongoose = require('mongoose')


const bill = new mongoose.Schema({
    fee: {type: Number, default: 0},
    status: {type: String, default: "On hold"},
    buyer: {type: {
        typeUser: {type: String, default: "user"},
        gmailUSer: {type: String, default: ""},
        rank: {type: String, default: "Standard"},
    }, 
        default: {
            typeUser: "user",
            gmailUSer: "",
            rank: "Standard",
        }},
    amount: {type: Number, default: 0},
    amountUsdt: {type: Number, default: 0},
    symbol: {type: String, default: ""},
    price: {type: Number, default: 0},
    type: {type: String, default: ""},
    createAt: {type: String, default: new Date().toUTCString()},
    updateAt: {type: String, default: new Date().toUTCString()},
})

const Bill = mongoose.model('Bill', bill)
module.exports = Bill