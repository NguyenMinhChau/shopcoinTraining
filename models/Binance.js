const mongoose = require('mongoose');

const binanceOrder = new mongoose.Schema(
    {
        type: { type: String, default: '' },
        status: {
            type: String,
            enum: ['Pending', 'Canceled', 'Completed'],
            default: 'Pending'
        },
        idOrderBinance: { type: String, default: '' },
        idOrder: { type: mongoose.Types.ObjectId, ref: 'Bill' },
        priceBinance: { type: Number, default: 0 },
        detailBinanceOrder: { type: String, default: '' }
    },
    { timestamps: true, collection: 'binance-orders-completed' }
);

const BinanceOrderCompleted = mongoose.model(
    'binance-order-completed',
    binanceOrder
);

module.exports = BinanceOrderCompleted;
