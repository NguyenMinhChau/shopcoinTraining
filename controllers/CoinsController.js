const Coins = require('../models/Coins')

class CoinsController{
    // [POST] /coins/add
    addCoin(req, res){
        // const {logo, name, symbols} = req.body
        // const coin = Coins({
        //     logo: logo,
        //     coinName: name,
        //     symbols: symbols,
        // })
        // coin.save()
        // .then(coin => {
        //     return res.json({code: 1, coin: coin})
        // })
        // .catch(err => res.json({code: 2, message: err.message}))
        console.log(req.file);
        // let file1 = req.files
        // let name1 = file1.originalname
        // let newPath1 = path.join(pathUploads, name1)
        // fs.renameSync(file1.path, newPath1)
        // fs.rename(file1.path, newPath1, function(err) {
        //     if ( err ) console.log('ERROR: ' + err);
        // });

        // let logoCoin = path.join('images', name1)
        return res.json("OK")
    }
}

module.exports = new CoinsController