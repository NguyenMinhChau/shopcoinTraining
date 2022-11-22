const mongoose = require('mongoose');

const otp = new mongoose.Schema(
    {
        code: { type: String, default: '' },
        email: { type: String, default: '' },
        id: { type: String, default: '' }
    },
    { timestamps: true }
);

otp.index({ createdAt: 1 }, { expireAfterSeconds: 60 });

module.exports = mongoose.model('OTP', otp);
