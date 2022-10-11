const mongoose = require('mongoose');

const rates = new mongoose.Schema(
    {
        from: { type: String, default: 'USD' },
        to: { type: String, default: 'VND' },
        rate: { type: Number, default: 0 }
    },
    { timestamps: true }
);

const Rates = mongoose.model('Rates', rates);

module.exports = Rates;
