const Coins = require('../models/Coins')
const path = require('path')
const fs = require('fs')
class CoinsController{
    // [POST] /coins/add
    addCoin(req, res){
        // console.log(req.file);
        let date = Date.now()
        let file1 = req.file
        let name1 = file1.originalname
        let destination = file1.destination
        let newPath1 = path.join(destination, date + "-" + name1)

        let typeFile = file1.mimetype.split('/')[0]

        if(typeFile == "image"){

            fs.renameSync(file1.path, newPath1)
            let logoCoin = path.join('./uploads/images', date + "-" + name1)
            
            let rawListUnshow = req.body.unshow || ""
            let newList = rawListUnshow.split(',')
            
            const {name, symbol, fullname} = req.body
            const coin = Coins({
                logo: logoCoin,
                name: name,
                symbols: symbol,
                fullName: fullname,
                unshow: [],
            })
            newList.forEach(element => {
                // console.log(element)
                coin.unshow.push(element)
            });
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

    // [GET] /coins/getAllCoin
    getAllCoins(req, res){
        Coins.find({}, (err, coins) => {
            if(err){
                return res.json({code: 1, message: err.message})
            }

            if(coins){
                return res.json({code: 0, data: coins})
            }else{
                return res.json({code: 2, message: "No coin"})
            }
        })
    }
}

module.exports = new CoinsController