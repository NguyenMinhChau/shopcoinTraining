const mongoose = require('mongoose')

const coin = new mongoose.Schema({
    logo: {type: String, default: ""},
    index: {type: Number, default: ""},
    name: {type: String, default: ""},
    symbols: {type: String, default: ""},
    createAt: {type: String, default: new Date().toUTCString()},
    updateAt: {type: String, default: new Date().toUTCString()},
    fullName: {type: String, default: ""},
    private: {type: Boolean, default: false},
    unshow: {type: [String], default: []},
})

const Coin = mongoose.model('Coin', coin)
module.exports = Coin