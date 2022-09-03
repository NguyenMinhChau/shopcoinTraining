const mongoose = require('mongoose')

const CounterSchema = new mongoose.Schema({
    _id: {type: String, required: true},
    seq: { type: Number, default: 0 }
});
const counter = mongoose.model('counter', CounterSchema);

const coin = new mongoose.Schema({
    logo: {type: String, default: ""},
    index: {type: Number, default: 0.0},
    name: {type: String, default: ""},
    symbols: {type: String, default: ""},
    createAt: {type: String, default: new Date().toUTCString()},
    updateAt: {type: String, default: new Date().toUTCString()},
    fullName: {type: String, default: ""},
    private: {type: Boolean, default: false},
    unshow: {type: [String], default: []},
})

coin.pre('save', function(next) {
    var doc = this;
    counter.findByIdAndUpdate({_id: 'entityId'}, {$inc: { seq: 1} }, {new: true, upsert: true}).then(function(count, err) {
        // console.log("...count: "+JSON.stringify(count));
        if(err){
            throw err
        }
        doc.index = count.seq;
        next();
    })
});

const Coin = mongoose.model('Coin', coin)
module.exports = Coin