const Coins = require('../models/Coins');
const path = require('path');
const fs = require('fs');
const { validationResult } = require('express-validator');

const methods = require('../function');
const { successCode, errCode1, errCode2, dataCode } = require('../function');
const { default: axios } = require('axios');

class CoinsController {
    // [POST] /coins/add
    addCoin(req, res) {
        // console.log(req.file);
        let date = Date.now();
        let file1 = req.file;
        let name1 = file1.originalname;
        let destination = file1.destination;
        let newPath1 = path.join(destination, date + '-' + name1);

        let typeFile = file1.mimetype.split('/')[0];

        if (typeFile == 'image') {
            fs.renameSync(file1.path, newPath1);
            let logoCoin = path.join('/images', date + '-' + name1);

            const { name, symbol, fullname, unshow } = req.body;
            const coin = Coins({
                logo: logoCoin,
                name: name,
                symbol: symbol,
                fullName: fullname,
                unshow: [unshow]
            });
            coin.save()
                .then((coin) => {
                    // return res.json({ code: 1, coin: coin });
                    dataCode(res, coin);
                })
                .catch((err) => errCode1(res, err));
        } else {
            // return res.json({ code: 2, message: 'Please upload image' });
            errCode2(res, 'Please upload image');
        }
    }

    // [PUT] /coins/updateCoin/:id
    updateCoin(req, res) {
        let result = validationResult(req);
        if (result.errors.length === 0) {
            const { id } = req.params;
            // const { name, symbol, fullName } = req.body;
            let date = Date.now();
            let file = req.file;
            if (file) {
                let nameFile = file.originalname;
                let destination = file.destination;
                let newPath = path.join(destination, date + '-' + nameFile);

                let typeFile = file.mimetype.split('/')[0];
                if (typeFile == 'image') {
                    fs.renameSync(file.path, newPath);
                    let logoCoin = path.join('/images', date + '-' + nameFile);
                    Coins.findById(id, (err, coin) => {
                        if (err) {
                            return res
                                .status(404)
                                .json({ code: 1, message: err.message });
                        }

                        if (coin) {
                            coin.logo = logoCoin;
                            coin.save()
                                .then((c) => {
                                    if (c) {
                                        c.updateOne(
                                            { $set: req.body },
                                            (err, coinn) => {
                                                if (err)
                                                    return res.json({
                                                        code: 1,
                                                        message: err.message
                                                    });
                                                if (coinn) {
                                                    return res.json({
                                                        code: 0,
                                                        message: 'Success',
                                                        data: coinn
                                                    });
                                                } else {
                                                    return res.json({
                                                        code: 2,
                                                        message:
                                                            'Coin can not be updated !!!'
                                                    });
                                                }
                                            }
                                        );
                                    } else {
                                        return res.status(404).json({
                                            code: 2,
                                            message: err.message
                                        });
                                    }
                                })
                                .catch((err) => {
                                    return res.status(404).json({
                                        code: 1,
                                        message: err.message
                                    });
                                });
                        } else {
                            return res.status(404).json({
                                code: 1,
                                message: 'Coin is not valid'
                            });
                        }
                    });
                }
            } else {
                Coins.findById(id, (err, coin) => {
                    if (err) {
                        errCode1(res, err);
                    }

                    if (coin) {
                        coin.updateOne({ $set: req.body }, (err, coinn) => {
                            if (err)
                                return res.json({
                                    code: 1,
                                    message: err.message
                                });
                            if (coinn) {
                                return res.json({
                                    code: 0,
                                    message: 'success',
                                    data: coinn
                                });
                            } else {
                                return res.json({
                                    code: 2,
                                    message: 'Coin can not be updated !!!'
                                });
                            }
                        });
                    } else {
                        errCode2(res, 'Coin is not valid');
                    }
                });
            }
        } else {
            let messages = result.mapped();
            let message = '';
            for (let m in messages) {
                message = messages[m];
                break;
            }
            // return res.json({ code: 1, message: message.msg });
            errCode2(res, message.msg);
        }
    }

    // [POST] /coins/deleteCoin/:id
    deleteCoin(req, res) {
        const { id } = req.params;
        Coins.findById(id, (err, coin) => {
            if (err) {
                return res.status(404).json({ code: 1, message: err.message });
            }
            if (coin) {
                Coins.deleteOne({ _id: id }, (err) => {
                    if (err) {
                        return res
                            .status(404)
                            .json({ code: 1, message: err.message });
                    }
                    return res.json({
                        code: 0,
                        message: 'Xoá coin thành công với id là: ' + id
                    });
                });
            } else {
                return res
                    .status(404)
                    .json({ code: 1, message: 'Coin is not valid !!!!' });
            }
        });
    }

    // [GET] /coins/getAllCoin
    async getAllCoins(req, res) {
        const pages = req.query.page || 1;
        const typeShow = req.query.show || 10;
        const step = typeShow * pages - typeShow;

        try {
            const totalCoin = Coins.countDocuments();
            const allCoins = Coins.find()
                .sort({ createAt: 'desc' })
                .skip(step)
                .limit(typeShow);

            const [all, total] = await Promise.all([allCoins, totalCoin]);
            return res.json({
                code: 0,
                message: 'Success get all coin',
                data: all,
                total: total,
                page: pages,
                show: typeShow
            });
        } catch {
            methods.errCode2(res, 'Can not get all coin !!!');
        }
    }

    // [GET] /coins/getCoin/:id
    getCoin(req, res) {
        const { id } = req.params;
        const io = methods.getSocket(req, res);
        // const binance = methods.getBinance(req, res);
        Coins.findById(id, (err, c) => {
            if (err) errCode1(res, err);
            // return res.status(404).json({ code: 1, message: err.message });

            if (c) {
                // binance.futuresMiniTickerStream(c.symbol, (data) => {
                //     io.emit('send-data-coin', data);
                // });
                setInterval(() => {
                    axios
                        .get(
                            `https://api.binance.com/api/v3/ticker/24hr?symbol=${c.symbol}`
                        )
                        .then((result) => {
                            if (result.data) {
                                io.emit(`send-data-${c.symbol}`, result.data);
                            }
                        })
                        .catch((err) => {});
                }, 1000);

                return res.json({ code: 0, message: 'Success', data: c });
            } else {
                return res.status(500).json({
                    code: 2,
                    message: `Không tìm thấy coin từ id ${id}`
                });
            }
        });
    }

    // [GET] /coins/getCoinSymbol/:symbol
    getCoinSymbol(req, res) {
        const { symbol } = req.params;
        Coins.findOne({ symbol: symbol }, (err, c) => {
            if (err) errCode1(res, err);

            if (c) {
                return res.json({ code: 0, message: 'Success', data: c });
            } else {
                errCode2(res, `Không tìm thấy coin từ id ${id}`);
            }
        });
    }

    // [GET] /coins/updatePriceAllCoin
    async updatePriceAllCoin(req, res) {
        const allCoins = Coins.find();
        const [coins] = await Promise.all([allCoins]);
        coins.forEach((coin) => {
            axios
                .get(
                    // `https://api.binance.com/api/v3/ticker/24hr?symbol=${coin.symbol}`
                    `https://fapi.binance.com/fapi/v1/ticker/price`
                )
                .then((result) => {
                    let data = result.data;
                    if (data) {
                        data.forEach((c) => {
                            if (c.symbol == coin.symbol) {
                                // console.log(c);
                                coin.price = c.price;
                                coin.save().catch((err) => console.log(err));
                            }
                        });
                    }
                })
                .catch((err) => {});
        });
        successCode(res, `Update price for all coins successfully`);
    }

    // [GET] /coins/updateHighLowAllCoin
    async updateHighLowAllCoin(req, res) {
        const allCoins = Coins.find();
        const [coins] = await Promise.all([allCoins]);
        coins.forEach((coin) => {
            axios
                .get(
                    `https://api.binance.com/api/v3/ticker/24hr?symbol=${coin.symbol}`
                )
                .then((result) => {
                    if (result.data) {
                        let { lowPrice, highPrice } = result.data;
                        coin.low = lowPrice;
                        coin.high = highPrice;
                        coin.save();
                    }
                })
                .catch((err) => {});
        });
        successCode(res, `Update high low for all coins successfully`);
    }
}

module.exports = new CoinsController();
