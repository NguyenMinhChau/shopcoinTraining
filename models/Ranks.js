const mongoose = require("mongoose")

const ranks = new mongoose.Schema({
    fee: {type: Number, default: 0.15},
    ranks: {type: String, default: "Standard"},
    total: {type: Number, default: 0}
})

const Ranks = mongoose.model('Ranks', ranks)

module.exports = Ranks
