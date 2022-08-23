const Coins = require('../models/Coins')
const path = require('path')
const fs = require('fs')
class CoinsController{
    // [POST] /coins/add
    addCoin(req, res){
        // console.log(req.file);
        let file1 = req.file
        let name1 = file1.originalname
        let destination = file1.destination
        let newPath1 = path.join(destination, Date.now() + "-" + name1)

        let typeFile = file1.mimetype.split('/')[0]

        if(typeFile == "image"){

            fs.renameSync(file1.path, newPath1)
            let logoCoin = path.join('./uploads/images', Date.now() + "-" + name1)
    
            // console.log(req.body)
            const {name, symbol, fullname} = req.body
            const coin = Coins({
                logo: logoCoin,
                name: name,
                symbols: symbol,
                fullName: fullname,
                unshow: [],
            })
            coin.unshow.push("test1@gmail.com")
            coin.unshow.push("test2@gmail.com")
            coin.unshow.push("test3@gmail.com")
            // return res.json(coin)
            coin.save()
            .then(coin => {
                return res.json({code: 1, coin: coin})
            })
            .catch(err => res.json({code: 2, message: err.message}))
        }else{
            return res.json({code: 2, message: "Please upload image"})
        }
    }
}

module.exports = new CoinsController