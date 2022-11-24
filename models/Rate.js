const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const rate = new Schema(
    {
        from: { type: String, default: 'USD' },
        to: { type: String, default: 'VND' },
        transfer: { type: Number, default: 0 },
        sell: { type: Number, default: 0 },
        rate: { type: Number, default: 0.1 }
    },
    {
        timestamps: true
    }
);

const Rate = model('Rates', rate);
module.exports = Rate;
