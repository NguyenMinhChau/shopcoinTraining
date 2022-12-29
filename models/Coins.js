const mongoose = require('mongoose');

const CounterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
});
const counter = mongoose.model('counter', CounterSchema);

const coin = new mongoose.Schema(
    {
        logo: { type: String, default: '' },
        index: { type: Number, default: 0.0 },
        name: { type: String, default: '' },
        symbol: { type: String, default: '' },
        price: { type: Number, default: 0 },
        fullName: { type: String, default: '' },
        private: { type: Boolean, default: false },
        unshow: { type: [String], default: [] },
        low: { type: Number, default: 0 },
        high: { type: Number, default: 0 }
    },
    { timestamps: true }
);

coin.pre('save', function (next) {
    var doc = this;
    counter
        .findByIdAndUpdate(
            { _id: 'entityId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        )
        .then(function (count, err) {
            // console.log("...count: "+JSON.stringify(count));
            if (err) {
                throw err;
            }
            doc.index = count.seq;
            next();
        });
});

const Coin = mongoose.model('Coin', coin);
module.exports = Coin;
