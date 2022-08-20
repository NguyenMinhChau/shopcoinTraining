const mongoose = require('mongoose')

const coin = new mongoose.Schema({
    logo: {type: String, defaut: null},
    coinName: {type: String, default: ""},
    symbols: {type: String, default: ""},
    createAt: {type: String, default: new Date().toUTCString()},
    updateAt: {type: String, default: new Date().toUTCString()},
})

const Coin = mongoose.model('Coin', coin)
module.exports = Coin