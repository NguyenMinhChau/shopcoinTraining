const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const commission = new Schema(
    {
        commission: { type: Number, default: 0 }
    },
    {
        timestamps: true
    }
);

const Commission = model('Commissions', commission);

module.exports = Commission;
