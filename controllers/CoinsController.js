const Coins = require('../models/Coins');
const path = require('path');
const fs = require('fs');
const { validationResult } = require('express-validator');

const methods = require('../function');
const { successCode, errCode1, errCode2 } = require('../function');

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
            // return res.json(coin)
            coin.save()
                .then((coin) => {
                    return res.json({ code: 1, coin: coin });
                })
                .catch((err) => res.json({ code: 2, message: err.message }));
        } else {
            return res.json({ code: 2, message: 'Please upload image' });
        }
    }

    // [PUT] /coins/updateCoin/:id
    updateCoin(req, res) {
        let result = validationResult(req);
        if (result.errors.length === 0) {
            const { id } = req.params;
            const { name, symbol, fullName } = req.body;
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
                        return res
                            .status(404)
                            .json({ code: 1, message: err.message });
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
                        return res
                            .status(404)
                            .json({ code: 1, message: 'Coin is not valid' });
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
            return res.json({ code: 1, message: message.msg });
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
        Coins.findById(id, (err, c) => {
            if (err)
                return res.status(404).json({ code: 1, message: err.message });

            if (c) {
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
}

module.exports = new CoinsController();
