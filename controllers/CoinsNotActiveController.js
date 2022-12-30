// import Libs
const fs = require('fs');
const path = require('path');

const {
    errCode1,
    errCode2,
    dataCode,
    successCode,
    precisionRound
} = require('../function');

// import model
const CoinNA = require('../models/CoinNotActive');

class CoinsNotActiveController {
    // [GET] /CoinNA/getList
    async getList(req, res) {
        const pages = req.query.page;
        const typeShow = req.query.show || 10;
        const step = parseInt(typeShow) * parseInt(pages) - parseInt(typeShow);
        const { search } = req.query;
        try {
            const getListCoin = await CoinNA.find({});
            if (getListCoin) {
                if (getListCoin.length > 0) {
                    // dataCode(res, getListCoin);
                    if (search) {
                        if (pages) {
                            const searchCoin = await CoinNA.find({
                                $or: [
                                    {
                                        name: { $regex: search, $options: 'xi' }
                                    },
                                    {
                                        symbol: {
                                            $regex: search,
                                            $options: 'xi'
                                        }
                                    },
                                    {
                                        fullName: {
                                            $regex: search,
                                            $options: 'xi'
                                        }
                                    }
                                ]
                            })
                                .sort({ createdAt: 'desc' })
                                .skip(step)
                                .limit(typeShow);

                            dataCode(res, {
                                coins: searchCoin,
                                totalSearch: searchCoin.length,
                                page: pages,
                                show: typeShow
                            });
                        } else {
                            const searchCoin = await CoinNA.find({
                                $or: [
                                    {
                                        name: { $regex: search, $options: 'xi' }
                                    },
                                    {
                                        symbol: {
                                            $regex: search,
                                            $options: 'xi'
                                        }
                                    },
                                    {
                                        fullName: {
                                            $regex: search,
                                            $options: 'xi'
                                        }
                                    }
                                ]
                            }).sort({ createdAt: 'desc' });

                            dataCode(res, {
                                coins: searchCoin,
                                totalSearch: searchCoin.length,
                                page: pages,
                                show: typeShow
                            });
                        }
                    } else {
                        if (pages) {
                            const totalCoin = CoinNA.countDocuments();
                            const allCoins = CoinNA.find()
                                .sort({ name: '1' })
                                .skip(step)
                                .limit(typeShow);

                            const [all, total] = await Promise.all([
                                allCoins,
                                totalCoin
                            ]);
                            return res.json({
                                code: 0,
                                message: 'Success get all coin',
                                data: all,
                                total: total,
                                page: pages,
                                show: typeShow
                            });
                        } else {
                            const totalCoin = CoinNA.countDocuments();
                            const allCoins = CoinNA.find().sort({ name: '1' });

                            const [all, total] = await Promise.all([
                                allCoins,
                                totalCoin
                            ]);
                            return res.json({
                                code: 0,
                                message: 'Success get all coin',
                                data: all,
                                total: total,
                                page: pages,
                                show: typeShow
                            });
                        }
                    }
                } else {
                    errCode2(res, `No data in table Coin not active`);
                }
            } else {
                throw {
                    code: 1,
                    message: 'Something error when get list coin not active'
                };
            }
        } catch (error) {
            errCode1(res, error);
        }
    }

    // [POST] /CoinNA/add
    async addCoin(req, res) {
        const { name, symbol, fullName, logo_sub } = req.body;
        let date = Date.now();
        let file1 = req.file;

        try {
            if (!name || !symbol || !fullName) {
                errCode2(res, 'Coin is not enough input');
            } else {
                if (logo_sub) {
                    const newCoinNA = new CoinNA({
                        logo: logo_sub,
                        name: name,
                        fullName: fullName,
                        symbol: symbol
                    });
                    newCoinNA
                        .save()
                        .then(() => {
                            successCode(res, 'Add Coin successfully!');
                        })
                        .catch((err) => {
                            errCode1(res, err);
                        });
                } else {
                    let name1 = file1.originalname;
                    let destination = file1.destination;
                    let newPath1 = path.join(destination, date + '-' + name1);
                    let typeFile = file1.mimetype.split('/')[0];
                    if (typeFile != 'image') {
                        errCode2(res, 'Please choose logo is image file');
                    } else {
                        fs.renameSync(file1.path, newPath1);
                        let logoCoin = path.join('/images', date + '-' + name1);
                        const newCoinNA = new CoinNA({
                            logo: logoCoin,
                            name: name,
                            fullName: fullName,
                            symbol: symbol
                        });
                        newCoinNA
                            .save()
                            .then(() => {
                                successCode(res, 'Add Coin successfully!');
                            })
                            .catch((err) => {
                                errCode1(res, err);
                            });
                    }
                }
            }
        } catch (error) {
            errCode1(res, error);
        }
    }

    // [PUT] /CoinNA/updateCoin/:id
    async updateCoin(req, res) {
        const { id } = req.params;
        try {
            const coinFind = await CoinNA.findById(id);
            if (coinFind) {
                let date = Date.now();
                let file = req.file;
                if (file) {
                    let nameFile = file.originalname;
                    let destination = file.destination;
                    let newPath = path.join(destination, date + '-' + nameFile);

                    let typeFile = file.mimetype.split('/')[0];
                    if (typeFile == 'image') {
                        fs.renameSync(file.path, newPath);
                        let logoCoin = path.join(
                            '/images',
                            date + '-' + nameFile
                        );
                        coinFind.logo = logoCoin;
                        coinFind
                            .save()
                            .then(async (coinAfterChangeLogo) => {
                                coinAfterChangeLogo
                                    .updateOne({ $set: req.body })
                                    .then((coinUpdated) => {
                                        successCode(
                                            res,
                                            `Update coin successfully`
                                        );
                                    })
                                    .catch((err) => errCode1(res, err));
                            })
                            .catch((err) => errCode1(res, err));
                    }
                } else {
                    coinFind
                        .updateOne({ $set: req.body })
                        .then((coinUpdated) => {
                            successCode(res, 'Update coin successfully');
                        })
                        .catch((err) => errCode1(res, err));
                }
            } else {
                errCode1(res, `Coin is not valid with id = ${id}`);
            }
        } catch (error) {
            errCode1(res, error);
        }
    }

    // [DELETE] /CoinNA/deleteCoin/:id
    async deleteCoin(req, res) {
        const { id } = req.params;
        try {
            CoinNA.deleteOne({ _id: id })
                .then(() => {
                    successCode(
                        res,
                        `Delete coin with id = ${id} successfully`
                    );
                })
                .catch((err) => errCode1(res, err));
        } catch (error) {
            errCode1(res, error);
        }
    }
}

module.exports = new CoinsNotActiveController();
