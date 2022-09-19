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
    rank: {type: String, default: "Standard"},
    changeBalance: {type: Number, default: 0.0},
    fee: {type: Number, default: 0.15},
    uploadCCCDFont: {type: String, default: ""},
    uploadCCCDBeside: {type: String, default: ""},
    uploadLicenseFont: {type: String, default: ""},
    uploadLicenseBeside: {type: String, default: ""},
    blockUser: {type: Boolean, default: false}
},{ timestamps: true })

const User = mongoose.model('User', user)
module.exports = User