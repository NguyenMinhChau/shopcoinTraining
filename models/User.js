const mongoose = require('mongoose')
// const Coins = require('./Coins')

const user = new mongoose.Schema({
    Wallet: {
        balance: {type: Number, default: 0.0},
        deposit: {type: Number, default: 0.0},
        withdraw: {type: Number, default: 0.0},
        pending: {type: Number, default: 0.0},
    },
    payment: {
        bank :{
            bankName: {type: String, default: ""},
            name: {type: String, default: ""},
            account: {type: String, default: ""},
        },
        private: {type: Boolean, default: false},
        rule: {type: String, default: "user"},
        email: {type: String, default: ""},
        password: {type: String, default: ""},
        username: {type: String, default: ""},
        code: {type: String, default: ""},
    },
    coins: {type: [{
        amount: {type: Number, default: 0.0},
        _id: {type: mongoose.Schema.Types.ObjectId, default: "", ref: 'Coins'},
        name: {type: String, default: ""},
    }], default: []},
    createAt: {type: String, default: new Date().toUTCString()},
    updateAt: {type: String, default: new Date().toUTCString()},
    rank: {type: String, default: "Standard"},
    changeBalance: {type: Number, default: 0.0},
    fee: {type: Number, default: 0.0},
})

const User = mongoose.model('User', user)
module.exports = User