const mongoose = require('mongoose')

const forget = new mongoose.Schema({
    code: {type: String, default: ""},
    email: {type: String, default: ""},
    token: {type: String, default: ""}
}, { timestamps: true },)

forget.index({createdAt: 1}, {expireAfterSeconds: 180})

module.exports = mongoose.model('Forgot', forget)

