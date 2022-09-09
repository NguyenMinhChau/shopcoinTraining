const Coins = require('../models/Coins')
const path = require('path')
const fs = require('fs')
const {validationResult} = require('express-validator')



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
            let logoCoin = path.join('/images', date + "-" + name1)

            

            const {name, symbol, fullname, unshow} = req.body
            const coin = Coins({
                logo: logoCoin,
                name: name,
                symbols: symbol,
                fullName: fullname,
                unshow: [unshow],
            })
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

	// [PUT] /coins/updateCoin/:id
	updateCoin(req, res){
		let result = validationResult(req)
        if(result.errors.length === 0){
					const {id} = req.params
					const {name, symbols, fullName} = req.body
					let date = Date.now()
					let file = req.file
					if(file)
					{
							let nameFile = file.originalname
							let destination = file.destination
							let newPath = path.join(destination, date + "-" + nameFile)

							let typeFile = file.mimetype.split('/')[0]
							if(typeFile == "image"){
								fs.renameSync(file.path, newPath)
								let logoCoin = path.join('/images', date + "-" + nameFile)
								Coins.findById(id, (err, coin) => {
									if(err){
										return res.status(404).json({code: 1, message: err.message})
									}

									if(coin){
										coin.logo = logoCoin
										coin.save()
										.then(c => {
											if(c){
												c.updateOne({$set: req.body}, (err, coinn) => {
														if(err) return res.json({code: 1, message: err.message})
														if(coinn){
															return res.json({code: 0, message: "Success", data: coinn})
														}else{
																return res.json({code: 2, message: "Coin can not be updated !!!"})
														}
												})
												/*c.name = name
												c.symbols = symbol
												c.fullName = fullName
												c.save()
													.then(c => {
														if(c){
															return res.json({code: 0, message: "Update coin successfully !!", data: c})
														}else{
															return res.status(404).json({code: 4, message: "Can not execute command !"})
														}
										})
										.catch(err => {
											return res.status(404).json({code: 3, message: err.message})
										})*/
											}else{
												return res.status(404).json({code: 2, message: err.message})
											}
										})
										.catch(err => {
											return res.status(404).json({code: 1, message: err.message})
										})
									}else{
										return res.status(404).json({code: 1, message: "Coin is not valid"})
									}
								})
							}

					}else{
							Coins.findById(id, (err, coin) => {
									if(err){
										return res.status(404).json({code: 1, message: err.message})
									}

									if(coin){
												coin.updateOne({$set: req.body}, (err, coinn) => {
														if(err) return res.json({code: 1, message: err.message})
														if(coinn){
															return res.json({code: 0, message: "success", data: coinn})
														}else{
																return res.json({code: 2, message: "Coin can not be updated !!!"})
														}
												})
									}else{
										return res.status(404).json({code: 1, message: "Coin is not valid"})
									}
								})
					}

		}else{
            let messages = result.mapped()
            let message = ''
            for(let m in messages){
                message = messages[m]
                break
            }
            return res.json({code: 1, message: message.msg})
        }

	}

	// [POST] /coins/deleteCoin/:id
	deleteCoin(req, res){
		const {id} = req.params
		Coins.findById(id, (err, coin) => {
			if(err){
				return res.status(404).json({code: 1, message: err.message})
			}
			if(coin){
				Coins.deleteOne({_id: id}, (err) => {
					if(err){
						return res.status(404).json({code: 1, message: err.message})
					}
					return res.json({code: 0, message: "Xoá coin thành công với id là: " + id})
				})
			}else{
				return res.status(404).json({code: 1, message: "Coin is not valid !!!!"})
			}
		})
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

	// [DELETE] /coins/getCoin/:id
	getCoin(req, res){
		const {id} = req.params
		Coins.findById(id, (err, c) => {
			if(err) return res.status(404).json({code: 1, message: err.message})

			if(c){
				return res.json({code: 0, message: "Success", data: c})
			}else{
				return res.status(500).json({code: 2, message: `Không tìm thấy coin từ id ${id}`})
			}
		})
	}
}

module.exports = new CoinsController
