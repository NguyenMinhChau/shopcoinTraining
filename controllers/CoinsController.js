const Coins = require('../models/Coins')

class CoinsController{
    // [POST] /coins/add
    addCoin(req, res){
        const {logo, name, symbols} = req.body
        const coin = Coins({
            logo: logo,
            coinName: name,
            symbols: symbols,
        })
        coin.save()
        .then(coin => {
            return res.json({code: 1, coin: coin})
        })
        .catch(err => res.json({code: 2, message: err.message}))
    }
}

module.exports = new CoinsController