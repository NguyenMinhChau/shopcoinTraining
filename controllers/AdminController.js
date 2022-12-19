//import lib

const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const path = require('path');
const fs = require('fs');
const jwt_decoded = require('jwt-decode');

const methods = require('../function');
const mongoose = require('mongoose');

// import model
const User = require('../models/User');
const Coins = require('../models/Coins');
const Payments = require('../models/Payments');
const Withdraws = require('../models/Withdraws');
const Deposits = require('../models/Deposits');
const Bills = require('../models/Bills');
const Rank = require('../models/Ranks');
const Commission = require('../models/Commission');

// import function
const { mail, dataCode, precisionRound } = require('../function');
const { resolve } = require('path');
const RateWithdrawDeposit = require('../models/RateWithdrawDeposit');
const { depositSuccess } = require('../mailform/depositForm');
const { transSuccess, sellSuccess } = require('../mailform/BuySellForm');

// support function
const calculateAdd = async (total, value, callback) => {
    let res = methods.precisionRound(parseFloat(total) + parseFloat(value));
    console.log(res);
    setTimeout(() => callback(res), 500);
};

// error
function errCode1(res, err) {
    return res.json({ code: 1, message: err.message });
}

function errCode2(res, err) {
    return res.json({ code: 2, message: err });
}

function successCode(res, mess) {
    return res.json({ code: 0, message: mess });
}

// function test

// add coin is exist
function addCoinExist(user, amount, position) {
    let p = new Promise((resolve, reject) => {
        user.coins[position].amount = methods.precisionRound(
            parseFloat(user.coins[position].amount) + parseFloat(amount)
        );
        user.save()
            .then((u) => {
                if (u) {
                    resolve({
                        code: 0,
                        message: `Successfully !!! Saved information of user with id = ${user._id}`
                    });
                } else {
                    reject({
                        code: 2,
                        message: `Can not save the information of user with id = ${user._id}`
                    });
                }
            })
            .catch((err) => {
                reject({ code: 1, message: err.message });
            });
    });
    return p;
}

// add coin is not exist
function addCoinNotExist(user, coin, amount) {
    let p = new Promise((resolve, reject) => {
        user.coins.push({
            amount: amount,
            _id: coin._id,
            name: coin.fullName
        });
        user.save()
            .then((u) => {
                if (u) {
                    resolve({
                        code: 0,
                        message: `successfully, add new coin for user with id = ${user._id}`
                    });
                } else {
                    reject({
                        code: 2,
                        message: `User balance is not saved with id = ${user._id}`
                    });
                }
            })
            .catch((err) => {
                reject({ code: 1, message: err.message });
            });
    });
    return p;
}

// subCoinDisappear
function subCoinDisappear(coin, user, afterAmount) {
    let p = new Promise((resolve, reject) => {
        const newCoinList = user.coins.filter((object) => {
            return !coin._id.equals(object._id);
        });

        user.coins = newCoinList;
        user.save()
            .then((u) => {
                if (u) {
                    resolve({
                        code: 0,
                        message: `Saved the information of user with id = ${user._id}`
                    });
                } else {
                    reject({
                        code: 2,
                        message: `Can not save the information of user with id = ${user._id}`
                    });
                }
            })
            .catch((err) => {
                reject({ code: 1, message: err.message });
            });
    });
    return p;
}

// subCoinNotDisappear
function subCoinNotDisappear(user, afterAmount, position) {
    let p = new Promise((resolve, reject) => {
        user.coins[position].amount = afterAmount;
        user.save()
            .then((u) => {
                if (u) {
                    resolve({
                        code: 0,
                        message: `Saved information of user with id = ${user._id}`
                    });
                } else {
                    reject({
                        code: 2,
                        message: `Can not save the information of user with id = ${user._id}`
                    });
                }
            })
            .catch((err) => {
                reject({ code: 1, message: err.message });
            });
    });
    return p;
}

// [PUT] handleBuyCoin

function handleAddCoinAuto(symbol, amount, user) {
    let p = new Promise((resolve, reject) => {
        Coins.findOne({ symbol: symbol }, (err, coin) => {
            if (err) reject({ code: 1, message: err.message });

            if (coin) {
                let tmp = '';
                let positionTEMP = 0;
                for (let i = 0; i < user.coins.length; i++) {
                    if (coin._id.equals(user.coins[i]._id)) {
                        tmp = coin._id;
                        positionTEMP = i;
                    }
                }

                if (tmp != '') {
                    let resultAddCoinExist = addCoinExist(
                        user,
                        amount,
                        positionTEMP
                    );
                    resultAddCoinExist
                        .then((a) => {
                            coin.total = methods.precisionRound(
                                parseFloat(coin.total) + parseFloat(amount)
                            );
                            coin.save()
                                .then((co) => {
                                    resolve({
                                        code: 0,
                                        message: `Successfully !!! Add coin to user with id = ${user._id}`
                                    });
                                })
                                .catch((err) => {
                                    reject({
                                        code: 1,
                                        message:
                                            'Can not save total of coin in add coin exist'
                                    });
                                });
                        })
                        .catch((err) => {
                            reject({ code: 1, message: err.message });
                        });
                } else {
                    let resultAddCoinNotExist = addCoinNotExist(
                        user,
                        coin,
                        amount
                    );
                    resultAddCoinNotExist
                        .then((res) => {
                            coin.total = methods.precisionRound(
                                parseFloat(coin.total) + parseFloat(amount)
                            );
                            coin.save()
                                .then((co) => {
                                    resolve({
                                        code: 0,
                                        message: `Successfully !!! Add coin coin to user with id = ${user._id}`
                                    });
                                })
                                .catch((err) => {
                                    reject({
                                        code: 1,
                                        message:
                                            'Can not save total of coin in add coin not exist'
                                    });
                                });
                        })
                        .catch((err) => {
                            reject({ code: 1, message: err.message });
                        });
                }
            } else {
                reject({
                    code: 2,
                    message: `Coin is not exist with symbol = ${symbol}`
                });
            }
        });
    });
    return p;
}

function handleSubCoinAuto(symbol, amount, user) {
    let p = new Promise((resolve, reject) => {
        Coins.findOne({ symbol: symbol }, (err, coin) => {
            if (err) reject({ code: 1, message: err.message });

            if (coin) {
                let positionTemp = 0;
                for (let i = 0; i < user.coins.length; i++) {
                    if (coin._id.equals(user.coins[i]._id)) {
                        positionTemp = i;
                    }
                }

                if (user.coins[positionTemp]) {
                    let currAmount = parseFloat(
                        user.coins[positionTemp].amount
                    );
                    let subAmount = parseFloat(amount);

                    let afterAmount = methods.precisionRound(
                        parseFloat(currAmount - subAmount)
                    );

                    if (afterAmount > 0) {
                        let resultSubCoinNotDisappear = subCoinNotDisappear(
                            user,
                            afterAmount,
                            positionTemp
                        );
                        resultSubCoinNotDisappear
                            .then((ress) => {
                                coin.total = methods.precisionRound(
                                    parseFloat(coin.total) - parseFloat(amount)
                                );
                                coin.save()
                                    .then((s) => {
                                        resolve({
                                            code: 0,
                                            message: `Sub coin Successfully when cancel buy coin of user with id = ${user._id}`
                                        });
                                    })
                                    .catch((err) => {
                                        reject({
                                            code: 1,
                                            message: err.message
                                        });
                                    });
                            })
                            .catch((err) => {
                                reject({ code: 1, message: err.message });
                            });
                    } else if (afterAmount == 0) {
                        let resultSubCoinDisappear = subCoinDisappear(
                            coin,
                            user,
                            afterAmount
                        );
                        resultSubCoinDisappear
                            .then((ress) => {
                                coin.total = methods.precisionRound(
                                    parseFloat(coin.total) - parseFloat(amount)
                                );
                                coin.save()
                                    .then((d) => {
                                        resolve({
                                            code: 0,
                                            message: `Sub coin Successfully when cancel buy coin !!! of user with id = ${user._id}`
                                        });
                                    })
                                    .catch((err) => {
                                        reject({
                                            code: 1,
                                            message: err.message
                                        });
                                    });
                            })
                            .catch((err) => {
                                reject({ code: 1, message: err.message });
                            });
                    } else {
                        reject({
                            code: 2,
                            message: `The amount of coin want to sell is not true, own is: ${currAmount} and sell is: ${subAmount}`
                        });
                    }
                } else {
                    reject({
                        code: 1,
                        message: `This coin is not valid in this user`
                    });
                }
            } else {
                reject({ code: 2, message: `Coin is not exist` });
            }
        });
    });

    return p;
}

class AdminController {
    // ---------------------------------------------services-------------------------------------------------

    // [GET] /admin/getAllUser
    async getAllUser(req, res) {
        const pages = req.query.page;
        const typeShow = req.query.show || 10;
        const step = typeShow * pages - typeShow;

        try {
            if (pages) {
                const total = User.countDocuments();
                const allUser = User.find()
                    .sort({ 'payment.username': '1' })
                    .skip(step)
                    .limit(typeShow);
                const [totalUser, all] = await Promise.all([total, allUser]);
                return res.json({
                    code: 0,
                    dataUser: all,
                    page: pages,
                    typeShow: typeShow,
                    total: totalUser
                });
            } else {
                const total = User.countDocuments();
                const allUser = User.find().sort({ 'payment.username': '1' });
                const [totalUser, all] = await Promise.all([total, allUser]);
                return res.json({
                    code: 0,
                    dataUser: all,
                    page: pages,
                    typeShow: typeShow,
                    total: totalUser
                });
            }
        } catch {
            errCode2(res, `Error something in get all users`);
        }
    }

    // [DELETE] /admin/deleteUser/:id
    deleteUser(req, res) {
        const { id } = req.params;
        User.findById(id, (err, user) => {
            if (err) errCode1(res, err);

            if (user) {
                User.deleteOne({ _id: id })
                    .then(() => {
                        successCode(
                            res,
                            `Delete user successfully with id = ${id}`
                        );
                    })
                    .catch((err) => {
                        errCode1(res, err);
                    });
            } else {
                errCode2(res, `User is not valid with id = ${id}`);
            }
        });
    }

    // [GET] /admin/getUser/:id
    getUser(req, res) {
        const { id } = req.params;
        User.findById(id, (err, user) => {
            if (err) errCode1(res, err);

            if (user) {
                methods.dataCode(res, user);
            } else {
                errCode2(res, `User is not valid with id = ${id}`);
            }
        });
    }

    // [GET] /admin/getAllPayments
    async getAllPayments(req, res) {
        const pages = req.query.page || 1;
        const typeShow = req.query.show || 10;
        const step = parseInt(pages - 1) * parseInt(typeShow);
        try {
            const total = Payments.countDocuments();
            const allPayment = Payments.find()
                .sort({ createdAt: 'desc' })
                .skip(step)
                .limit(typeShow);
            const [totalPayment, all] = await Promise.all([total, allPayment]);
            return res.json({
                code: 0,
                data: all,
                page: pages,
                typeShow: typeShow,
                total: totalPayment
            });
        } catch {
            errCode2(res, `No payment`);
        }
    }

    // [GET] /admin/getPayment/:id
    getPayment(req, res) {
        const { id } = req.params;
        Payments.findById(id, (err, p) => {
            if (err) {
                errCode1(res, err);
            }

            if (p) {
                // return res.json({ code: 0, message: 'Success', data: p });
                methods.dataCode(res, p);
            } else {
                errCode2(res, `Payment is not valid with id = ${id}`);
            }
        });
    }

    // [GET] /admin/getWithdraw/:id
    getWithdraw(req, res) {
        const { id } = req.params;
        Withdraws.findById(id, (err, p) => {
            if (err) {
                errCode1(res, err);
            }

            if (p) {
                // return res.json({ code: 0, message: 'Success', data: p });
                methods.dataCode(res, p);
            } else {
                errCode2(res, `Payment is not valid with id = ${id}`);
            }
        });
    }

    // [GET] /admin/getDeposit/:id
    getDeposit(req, res) {
        const { id } = req.params;
        Deposits.findById(id, (err, p) => {
            if (err) {
                errCode1(res, err);
            }

            if (p) {
                // return res.json({ code: 0, message: 'Success', data: p });
                methods.dataCode(res, p);
            } else {
                errCode2(res, `Deposit is not valid with id = ${id}`);
            }
        });
    }

    // [GET] /admin/getAllWithdraw
    async getAllWithdraw(req, res) {
        const pages = req.query.page || 1;
        const typeShow = req.query.show || 10;
        const step = parseInt(pages - 1) * parseInt(typeShow);
        try {
            const total = Withdraws.countDocuments();
            const allWithdraw = Withdraws.find()
                .sort({ createdAt: 'desc' })
                .skip(step)
                .limit(typeShow);
            const [totalWithdraw, all] = await Promise.all([
                total,
                allWithdraw
            ]);
            return res.json({
                code: 0,
                data: all,
                page: pages,
                typeShow: typeShow,
                total: totalWithdraw
            });
        } catch {
            errCode2(res, `Error something`);
        }
    }

    // [GET] /admin/getAllDeposit
    async getAllDeposit(req, res) {
        const pages = req.query.page || 1;
        const typeShow = req.query.show || 10;
        const step = parseInt(pages - 1) * parseInt(typeShow);
        try {
            const total = Deposits.countDocuments();
            const allDeposits = Deposits.find()
                .sort({ createdAt: 'desc' })
                .skip(step)
                .limit(typeShow);
            const [totalDeposits, all] = await Promise.all([
                total,
                allDeposits
            ]);
            return res.json({
                code: 0,
                data: all,
                page: pages,
                typeShow: typeShow,
                total: totalDeposits
            });
        } catch {
            errCode2(res, `Error something about get deposit`);
        }
    }

    // [PUT] /admin/updatePayment/:id
    updatePayment(req, res) {
        let date = new Date().toUTCString();
        const { id } = req.params;
        Payments.findById(id, (err, payment) => {
            if (err) {
                errCode1(res, err);
            } else {
                if (payment) {
                    req.body.updatedAt = date;
                    payment
                        .updateOne({ $set: req.body })
                        .then((p) => {
                            if (p) {
                                successCode(
                                    res,
                                    `Update payment successfully with id = ${id}`
                                );
                            } else {
                                errCode2(
                                    res,
                                    `Can not update payment with id = ${id}`
                                );
                            }
                        })
                        .catch((err) => {
                            errCode1(res, err);
                        });
                } else {
                    errCode2(res, `Payment is not valid with id = ${id}`);
                }
            }
        });
    }

    // [DELETE] /admin/deletePayment/:id
    deletePayment(req, res) {
        const { id } = req.params;
        Payments.findById(id, (err, payment) => {
            if (err) {
                errCode1(res, err);
            }
            if (payment) {
                Payments.deleteOne({ _id: id }, (err) => {
                    if (err) errCode1(res, err);
                    successCode(res, 'Delete payment success with id = ' + id);
                });
            } else {
                errCode2(res, 'No payment is valid !!!');
            }
        });
    }

    // [PUT] /admin/updateWithdraw/:id
    updateWithdraw(req, res) {
        let date = new Date().toUTCString();
        const id = req.params.id;
        Withdraws.findById(id, (err, withdraw) => {
            if (err) {
                errCode1(res, err);
            } else {
                req.body.updatedAt = date;
                withdraw
                    .updateOne({ $set: req.body })
                    .then((p) => {
                        if (p) {
                            successCode(
                                res,
                                `Update successfully with id = ${id}`
                            );
                        } else {
                            errCode2(res, `Update failed with id = ${id}`);
                        }
                    })
                    .catch((err) => {
                        errCode1(res, err);
                    });
            }
        });
    }

    // [DELETE] /admin/deleteWithdraw/:id
    deleteWithdraw(req, res) {
        const { id } = req.params;
        Withdraws.findById(id, (err, withdraw) => {
            if (err) {
                errCode1(res, err);
            }
            if (withdraw) {
                Withdraws.deleteOne({ _id: id }, (err) => {
                    if (err) errCode1(res, err);
                    successCode(res, `Delete withdraw success with id = ${id}`);
                });
            } else {
                errCode2(res, `No withdraw with id = ${id}`);
            }
        });
    }

    // [PUT] /admin/updateDeposit/:id
    updateDeposit(req, res) {
        const id = req.params.id;
        let date = new Date().toUTCString();
        Deposits.findById(id, (err, deposit) => {
            if (err) {
                errCode1(res, err);
            } else {
                req.body.updatedAt = date;
                deposit
                    .updateOne({ $set: req.body })
                    .then((p) => {
                        if (p) {
                            successCode(
                                res,
                                `Update successfully with id = ${id}`
                            );
                        } else {
                            errCode2(res, `Update failed with id = ${id}`);
                        }
                    })
                    .catch((err) => {
                        errCode1(res, err);
                    });
            }
        });
    }

    // [DELETE] /admin/deleteDeposit/:id
    deleteDeposit(req, res) {
        const { id } = req.params;
        Deposits.findById(id, (err, deposit) => {
            if (err) {
                errCode1(res, err);
            }
            if (deposit) {
                Deposits.deleteOne({ _id: id }, (err) => {
                    if (err) errCode1(res, err);
                    successCode(res, `Delete deposit success with id = ${id}`);
                });
            } else {
                errCode2(res, `Deposit is not valid with id = ${id}`);
            }
        });
    }

    // [POST] /admin/withdraw
    withdraw(req, res) {
        let result = validationResult(req);
        if (result.errors.length === 0) {
            const codeWithdraw = otpGenerator.generate(20, {
                upperCaseAlphabets: false,
                specialChars: false
            });

            const { user, amount, amountUsd, amountVnd, symbol } = req.body;

            const newWithdraw = new Withdraws({
                user: user,
                code: codeWithdraw,
                amount: amount,
                amountUsd: amountUsd,
                amountVnd: amountVnd,
                symbol: symbol
            });

            newWithdraw
                .save()
                .then((withdraw) => {
                    methods.dataCode(res, withdraw);
                })
                .catch((err) => {
                    errCode1(res, err);
                });
        } else {
            let messages = result.mapped();
            let message = '';
            for (let m in messages) {
                message = messages[m];
                break;
            }
            errCode2(res, message.msg);
        }
    }

    // [POST] /admin/payment
    payment(req, res) {
        let result = validationResult(req);
        if (result.errors.length === 0) {
            const codePayment = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                specialChars: false
            });
            const {
                methodName,
                accountName,
                accountNumber,
                rateDeposit,
                rateWithdraw
            } = req.body;
            const newPayment = new Payments({
                code: codePayment,
                methodName: methodName,
                accountName: accountName,
                accountNumber: accountNumber,
                rateDeposit: rateDeposit,
                rateWithdraw: rateWithdraw
            });

            newPayment
                .save()
                .then((payment) => {
                    methods.dataCode(res, payment);
                })
                .catch((err) => {
                    errCode1(res, err);
                });
        } else {
            let messages = result.mapped();
            let message = '';
            for (let m in messages) {
                message = messages[m];
                break;
            }
            errCode2(res, message.msg);
        }
    }

    // [POST] /admin/deposit
    deposit(req, res) {
        const codeDeposit = otpGenerator.generate(10, {
            upperCaseAlphabets: false,
            specialChars: false
        });
        const { amount, user, amountUsd, amountVnd, symbol } = req.body;

        if (
            amount == '' ||
            user == '' ||
            amountUsd == '' ||
            amountVnd == '' ||
            symbol == '' ||
            !amount ||
            !user ||
            !amountUsd ||
            !amountVnd ||
            !symbol ||
            !req.file
        ) {
            errCode2(res, 'Please enter fields');
        }

        let file1 = req.file;
        let name1 = file1.originalname;
        let destination = file1.destination;
        let newPath1 = path.join(destination, Date.now() + '-' + name1);

        let typeFile = file1.mimetype.split('/')[0];

        if (typeFile == 'image') {
            fs.renameSync(file1.path, newPath1);
            let statement = path.join(
                './uploads/images',
                Date.now() + '-' + name1
            );

            const newDeposit = new Deposits({
                code: codeDeposit,
                amount: amount,
                user: user,
                amountUsd: amountUsd,
                amountVnd: amountVnd,
                symbol: symbol,
                statement: statement
            });

            newDeposit
                .save()
                .then((deposit) => {
                    methods.dataCode(res, deposit);
                })
                .catch((err) => {
                    errCode1(res, err);
                });
        } else {
            errCode2(res, 'Please upload image');
        }
    }

    // [GET] /admin/getAllSell
    async getAllSell(req, res) {
        const query = {
            type: 'SellCoin'
        };

        const pages = req.query.page || 1;
        const typeShow = req.query.show || 10;
        const step = parseInt(pages - 1) * parseInt(typeShow);
        try {
            const total = Bills.countDocuments(query);
            const allBuys = Bills.find(query)
                .sort({ createdAt: 'desc' })
                .skip(step)
                .limit(typeShow);
            const [totalBuys, all] = await Promise.all([total, allBuys]);
            return res.json({
                code: 0,
                data: all,
                page: pages,
                typeShow: typeShow,
                total: totalBuys
            });
        } catch {
            errCode2(res, `Error something in get Buys`);
        }
    }

    // [GET] /admin/getAllBuy
    async getAllBuy(req, res) {
        const query = {
            type: 'BuyCoin'
        };
        const pages = req.query.page || 1;
        const typeShow = req.query.show || 10;
        const step = parseInt(pages - 1) * parseInt(typeShow);
        try {
            const total = Bills.countDocuments(query);
            const allSells = Bills.find(query)
                .sort({ createdAt: 'desc' })
                .skip(step)
                .limit(typeShow);
            const [totalSells, all] = await Promise.all([total, allSells]);
            return res.json({
                code: 0,
                data: all,
                page: pages,
                typeShow: typeShow,
                total: totalSells
            });
        } catch {
            errCode2(res, `Error something in get Buys`);
        }
    }

    // [GET] /admin/getSell/:id
    getSell(req, res) {
        const { id } = req.params;
        const query = {
            _id: id,
            type: 'SellCoin'
        };
        Bills.findOne(query, (err, bill) => {
            if (err) errCode1(res, err);

            if (bill) {
                methods.dataCode(res, bill);
            } else {
                errCode2(res, `Biên bán coin này không tồn tại với id = ${id}`);
            }
        });
    }

    // [GET] /admin/getBuy/:id
    getBuy(req, res) {
        const { id } = req.params;
        const query = {
            _id: id,
            type: 'BuyCoin'
        };
        Bills.findOne(query, (err, bill) => {
            if (err) errCode1(res, err);

            if (bill) {
                methods.dataCode(res, bill);
            } else {
                errCode2(res, `Biên bán coin này không tồn tại với id = ${id}`);
            }
        });
    }

    // [PUT] /admin/handleBuyCoin/:id
    // handleBuyCoin(req, res) {
    //     const { id } = req.params;
    //     const { status } = req.body;

    //     if (status === 'Confirmed') {
    //         const query = {
    //             _id: id,
    //             status: 'On hold',
    //             type: 'BuyCoin',
    //         };

    //         Bills.findOne(query, (err, bill) => {
    //             if (err) errCode1(res, err);

    //             if (bill) {
    //                 let emailUser = bill.buyer.gmailUSer;
    //                 User.findOne(
    //                     { 'payment.email': emailUser },
    //                     (err, user) => {
    //                         if (err)
    //                             return res
    //                                 .status(404)
    //                                 .json({ code: 1, message: err.message });

    //                         if (user) {
    //                             let prepare = {
    //                                 id: bill._id,
    //                                 amount: bill.amount,
    //                                 symbol: bill.symbol,
    //                                 fee: bill.fee,
    //                                 price: bill.price,
    //                             };
    //                             let result = handleAddCoinAuto(
    //                                 prepare.symbol,
    //                                 prepare.amount,
    //                                 user
    //                             );
    //                             result
    //                                 .then((val) => {
    //                                     user.Wallet.balance =
    //                                         methods.precisionRound(
    //                                             parseFloat(
    //                                                 user.Wallet.balance
    //                                             ) -
    //                                                 methods.precisionRound(
    //                                                     parseFloat(
    //                                                         prepare.amount
    //                                                     ) *
    //                                                         parseFloat(
    //                                                             prepare.price
    //                                                         ) *
    //                                                         (1 +
    //                                                             parseFloat(
    //                                                                 prepare.fee
    //                                                             ))
    //                                                 )
    //                                         );
    //                                     user.save()
    //                                         .then((u) => {
    //                                             if (u) {
    //                                                 bill.status = status;
    //                                                 bill.save()
    //                                                     .then(async (b) => {
    //                                                         if (b) {
    //                                                             const commision =
    //                                                                 Commission.findById(
    //                                                                     process
    //                                                                         .env
    //                                                                         .ID_COMMISSION
    //                                                                 );
    //                                                             const [comm] =
    //                                                                 await Promise.all(
    //                                                                     [
    //                                                                         commision,
    //                                                                     ]
    //                                                                 );
    //                                                             if (comm) {
    //                                                                 const commissionRes =
    //                                                                     comm;
    //                                                                 commissionRes.commission =
    //                                                                     methods.precisionRound(
    //                                                                         parseFloat(
    //                                                                             commissionRes.commission
    //                                                                         ) +
    //                                                                             parseFloat(
    //                                                                                 prepare.amount
    //                                                                             ) *
    //                                                                                 parseFloat(
    //                                                                                     prepare.price
    //                                                                                 ) *
    //                                                                                 parseFloat(
    //                                                                                     prepare.fee
    //                                                                                 )
    //                                                                     );
    //                                                                 commissionRes
    //                                                                     .save()
    //                                                                     .then(
    //                                                                         (
    //                                                                             result
    //                                                                         ) => {
    //                                                                             successCode(
    //                                                                                 res,
    //                                                                                 `Confirmed the bill with type buyCoin successfully with id = ${prepare.id}`
    //                                                                             );
    //                                                                         }
    //                                                                     )
    //                                                                     .catch(
    //                                                                         (
    //                                                                             err
    //                                                                         ) => {
    //                                                                             errCode1(
    //                                                                                 res,
    //                                                                                 err
    //                                                                             );
    //                                                                         }
    //                                                                     );
    //                                                             } else {
    //                                                                 console.log(
    //                                                                     comm
    //                                                                 );
    //                                                                 errCode2(
    //                                                                     res,
    //                                                                     `Can not find commision`
    //                                                                 );
    //                                                             }
    //                                                         } else {
    //                                                             errCode2(
    //                                                                 res,
    //                                                                 `Bill status is not save with id = ${prepare.id}`
    //                                                             );
    //                                                         }
    //                                                     })
    //                                                     .catch((err) => {
    //                                                         errCode1(res, err);
    //                                                     });
    //                                             } else {
    //                                                 errCode2(
    //                                                     res,
    //                                                     `Can not save sub the balance of user with id = ${user._id}`
    //                                                 );
    //                                             }
    //                                         })
    //                                         .catch((err) => {
    //                                             errCode1(res, err);
    //                                         });
    //                                 })
    //                                 .catch((err) => {
    //                                     errCode1(res, err);
    //                                 });
    //                         } else {
    //                             errCode2(
    //                                 res,
    //                                 `User is not valid with id = ${user._id}`
    //                             );
    //                         }
    //                     }
    //                 );
    //             } else {
    //                 errCode2(
    //                     res,
    //                     `Bill of buy coin is not exist with id = ${id}`
    //                 );
    //             }
    //         });
    //     } else if (status === 'Canceled') {
    //         const query = {
    //             _id: id,
    //             status: 'Confirmed',
    //             type: 'BuyCoin',
    //         };

    //         Bills.findOne(query, (err, bill) => {
    //             if (err) errCode1(res, err);

    //             if (bill) {
    //                 let emailUser = bill.buyer.gmailUSer;
    //                 User.findOne(
    //                     { 'payment.email': emailUser },
    //                     (err, user) => {
    //                         if (err)
    //                             return res
    //                                 .status(404)
    //                                 .json({ code: 1, message: err.message });

    //                         if (user) {
    //                             let prepare = {
    //                                 id: bill._id,
    //                                 amount: bill.amount,
    //                                 symbol: bill.symbol,
    //                                 fee: bill.fee,
    //                                 price: bill.price,
    //                             };

    //                             let resultCanCel = handleSubCoinAuto(
    //                                 prepare.symbol,
    //                                 prepare.amount,
    //                                 user
    //                             );
    //                             resultCanCel
    //                                 .then((ress) => {
    //                                     user.Wallet.balance =
    //                                         methods.precisionRound(
    //                                             parseFloat(
    //                                                 user.Wallet.balance
    //                                             ) +
    //                                                 methods.precisionRound(
    //                                                     parseFloat(
    //                                                         prepare.amount
    //                                                     ) *
    //                                                         parseFloat(
    //                                                             prepare.price
    //                                                         )
    //                                                 )
    //                                         );
    //                                     user.save()
    //                                         .then((u) => {
    //                                             if (u) {
    //                                                 bill.status = status;
    //                                                 bill.save()
    //                                                     .then(async (b) => {
    //                                                         const commission =
    //                                                             Commission.findById(
    //                                                                 process.env
    //                                                                     .ID_COMMISSION
    //                                                             );
    //                                                         const [comm] =
    //                                                             await Promise.all(
    //                                                                 [commission]
    //                                                             );

    //                                                         if (comm) {
    //                                                             const commissionRes =
    //                                                                 comm;
    //                                                             commissionRes.commission =
    //                                                                 methods.precisionRound(
    //                                                                     parseFloat(
    //                                                                         commissionRes.commission
    //                                                                     ) -
    //                                                                         parseFloat(
    //                                                                             prepare.amount
    //                                                                         ) *
    //                                                                             parseFloat(
    //                                                                                 prepare.price
    //                                                                             ) *
    //                                                                             parseFloat(
    //                                                                                 prepare.fee
    //                                                                             )
    //                                                                 );
    //                                                             // console.log(
    //                                                             //     methods.precisionRound(
    //                                                             //         parseFloat(
    //                                                             //             commissionRes.commission
    //                                                             //         ) -
    //                                                             //             parseFloat(
    //                                                             //                 prepare.amount
    //                                                             //             ) *
    //                                                             //                 parseFloat(
    //                                                             //                     prepare.price
    //                                                             //                 ) *
    //                                                             //                 parseFloat(
    //                                                             //                     prepare.fee
    //                                                             //                 )
    //                                                             //     )
    //                                                             // );
    //                                                             commissionRes
    //                                                                 .save()
    //                                                                 .then(
    //                                                                     (
    //                                                                         result
    //                                                                     ) => {
    //                                                                         successCode(
    //                                                                             res,
    //                                                                             `Successfully cancel buy coin with id = ${id}`
    //                                                                         );
    //                                                                     }
    //                                                                 )
    //                                                                 .catch(
    //                                                                     (
    //                                                                         err
    //                                                                     ) => {
    //                                                                         errCode1(
    //                                                                             res,
    //                                                                             err
    //                                                                         );
    //                                                                     }
    //                                                                 );
    //                                                         } else {
    //                                                             errCode2(
    //                                                                 res,
    //                                                                 `Can not find commission`
    //                                                             );
    //                                                         }
    //                                                     })
    //                                                     .catch((err) => {
    //                                                         errCode1(req, err);
    //                                                     });
    //                                             } else {
    //                                                 errCode2(
    //                                                     res,
    //                                                     `Can not save user with email ${emailUser}`
    //                                                 );
    //                                             }
    //                                         })
    //                                         .catch((err) => {
    //                                             errCode1(res, err);
    //                                         });
    //                                 })
    //                                 .catch((err) => {
    //                                     errCode1(res, err);
    //                                 });
    //                         } else {
    //                             errCode2(
    //                                 res,
    //                                 `User is not valid with email = ${emailUser}`
    //                             );
    //                         }
    //                     }
    //                 );
    //             } else {
    //                 errCode2(
    //                     res,
    //                     `Bill with type buy is not valid with id = ${id}`
    //                 );
    //             }
    //         });
    //     } else {
    //         const query = {
    //             _id: id,
    //             type: 'BuyCoin',
    //         };
    //         Bills.findOne(query, (err, bill) => {
    //             if (err) errCode1(res, err);

    //             if (bill) {
    //                 bill.status = status;
    //                 bill.save()
    //                     .then((b) => {
    //                         if (b) {
    //                             successCode(
    //                                 res,
    //                                 `Change status of bill type buyCoin with id = ${id}`
    //                             );
    //                         } else {
    //                             errCode2(
    //                                 res,
    //                                 `Can not save status bill with id = ${id}`
    //                             );
    //                         }
    //                     })
    //                     .catch((err) => {
    //                         errCode1(res, err);
    //                     });
    //             } else {
    //                 errCode2(res, `Bill is not valid with id = ${id}`);
    //             }
    //         });
    //     }
    // }

    // [PUT] /admin/handleBuyCoin/:id
    async handleBuyCoin(req, res) {
        const { id } = req.params;
        const { status } = req.body;
        try {
            const orderBuy = await Bills.findById(id);
            if (!orderBuy) {
                errCode2(res, `Order buy is not valid with id = ${id}`);
            } else {
                if (orderBuy.type == 'BuyCoin') {
                    const user = await User.findOne({
                        'payment.email': orderBuy.buyer.gmailUSer
                    });
                    if (!user) {
                        errCode2(
                            res,
                            `User is not valid with email:  ${orderBuy.buyer.gmailUSer}`
                        );
                    } else {
                        if (status == 'Completed') {
                            if (orderBuy.status == 'Pending') {
                                // dataCode(res, orderBuy);
                                // dataCode(res, user);
                                let prepare = {
                                    id: orderBuy._id,
                                    amount: orderBuy.amount,
                                    symbol: orderBuy.symbol,
                                    fee: orderBuy.fee,
                                    price: orderBuy.price
                                };
                                // dataCode(res, prepare);
                                let result = handleAddCoinAuto(
                                    prepare.symbol,
                                    prepare.amount,
                                    user
                                );

                                result
                                    .then(() => {
                                        let balanceAfter = precisionRound(
                                            parseFloat(user.Wallet.balance) -
                                                precisionRound(
                                                    parseFloat(prepare.amount) *
                                                        parseFloat(
                                                            prepare.price
                                                        ) *
                                                        (1 +
                                                            parseFloat(
                                                                prepare.fee
                                                            ))
                                                )
                                        );
                                        user.Wallet.balance = balanceAfter;
                                        user.save()
                                            .then(async () => {
                                                const commission =
                                                    await Commission.findById(
                                                        process.env
                                                            .ID_COMMISSION
                                                    );
                                                const commisionAfter =
                                                    precisionRound(
                                                        parseFloat(
                                                            commission.commission
                                                        ) +
                                                            precisionRound(
                                                                parseFloat(
                                                                    prepare.amount
                                                                ) *
                                                                    parseFloat(
                                                                        prepare.price
                                                                    ) *
                                                                    parseFloat(
                                                                        prepare.fee
                                                                    )
                                                            )
                                                    );
                                                commission.commission =
                                                    commisionAfter;
                                                commission
                                                    .save()
                                                    .then(() => {
                                                        orderBuy.status =
                                                            status;
                                                        orderBuy
                                                            .save()
                                                            .then(() => {
                                                                mail(
                                                                    user.payment
                                                                        .email,
                                                                    transSuccess(
                                                                        user
                                                                            .payment
                                                                            .username,
                                                                        orderBuy
                                                                    ),
                                                                    'Buy Coins successfully'
                                                                )
                                                                    .then(
                                                                        () => {
                                                                            successCode(
                                                                                res,
                                                                                `${status} the order buy with id = ${id}`
                                                                            );
                                                                        }
                                                                    )
                                                                    .catch(
                                                                        (
                                                                            err
                                                                        ) => {
                                                                            errCode1(
                                                                                res,
                                                                                err
                                                                            );
                                                                        }
                                                                    );
                                                            })
                                                            .catch((err) => {
                                                                errCode1(
                                                                    res,
                                                                    err
                                                                );
                                                            });
                                                    })
                                                    .catch((err) => {
                                                        errCode1(res, err);
                                                    });
                                            })
                                            .catch((err) => {
                                                errCode1(res, err);
                                            });
                                    })
                                    .catch((err) => {
                                        errCode1(res, err);
                                    });
                            } else {
                                errCode2(
                                    res,
                                    `Can not execute this command because it is not enough condition for ${status}. Please pending first.`
                                );
                            }
                        } else if (status === 'Canceled') {
                            if (orderBuy.status == 'Completed') {
                                let prepare = {
                                    id: orderBuy._id,
                                    amount: orderBuy.amount,
                                    symbol: orderBuy.symbol,
                                    fee: orderBuy.fee,
                                    price: orderBuy.price
                                };

                                let resultCanCel = handleSubCoinAuto(
                                    prepare.symbol,
                                    prepare.amount,
                                    user
                                );
                                resultCanCel
                                    .then(() => {
                                        let balanceAfter = precisionRound(
                                            parseFloat(user.Wallet.balance) +
                                                precisionRound(
                                                    parseFloat(prepare.amount) *
                                                        parseFloat(
                                                            prepare.price
                                                        ) *
                                                        (1 +
                                                            parseFloat(
                                                                prepare.fee
                                                            ))
                                                )
                                        );
                                        user.Wallet.balance = balanceAfter;
                                        user.save()
                                            .then(async () => {
                                                const commission =
                                                    await Commission.findById(
                                                        process.env
                                                            .ID_COMMISSION
                                                    );
                                                const commisionAfter =
                                                    precisionRound(
                                                        parseFloat(
                                                            commission.commission
                                                        ) -
                                                            precisionRound(
                                                                parseFloat(
                                                                    prepare.amount
                                                                ) *
                                                                    parseFloat(
                                                                        prepare.price
                                                                    ) *
                                                                    parseFloat(
                                                                        prepare.fee
                                                                    )
                                                            )
                                                    );
                                                commission.commission =
                                                    commisionAfter;
                                                commission
                                                    .save()
                                                    .then(() => {
                                                        orderBuy.status =
                                                            status;
                                                        orderBuy
                                                            .save()
                                                            .then(() => {
                                                                successCode(
                                                                    res,
                                                                    `Canceled successfully order buy and paid money to customer with id order = ${id}`
                                                                );
                                                            })
                                                            .catch((err) => {
                                                                errCode1(
                                                                    res,
                                                                    err
                                                                );
                                                            });
                                                    })
                                                    .catch((err) =>
                                                        errCode1(res, err)
                                                    );
                                            })
                                            .catch((err) => {
                                                errCode1(res, err);
                                            });
                                    })
                                    .catch((err) => {
                                        errCode1(res, err);
                                    });
                            } else if (orderBuy.status == 'Pending') {
                                orderBuy.status = status;
                                orderBuy
                                    .save()
                                    .then(() => {
                                        successCode(
                                            res,
                                            `${status} successfully for order buy coin`
                                        );
                                    })
                                    .catch((err) => errCode1(res, err));
                            } else {
                                errCode2(
                                    res,
                                    `Can not execute this command because it is not enough condition for ${status}. Please Completed first.`
                                );
                            }
                        } else if (status == 'Pending') {
                            if (orderBuy.status == 'Canceled') {
                                orderBuy.status = status;
                                orderBuy
                                    .save()
                                    .then(() => {
                                        successCode(
                                            res,
                                            `${status} successfully for order buy with id = ${id}`
                                        );
                                    })
                                    .catch((err) => errCode1(res, err));
                            } else {
                                errCode2(
                                    res,
                                    `${status} failed for order buy with id = ${id}. Please canceled first.`
                                );
                            }
                        } else {
                            errCode2(
                                res,
                                `${status} is not support for order buy coin`
                            );
                        }
                    }
                } else {
                    errCode2(
                        res,
                        `Order buy coin is not valid with id = ${id}`
                    );
                }
            }
            // dataCode(res, orderBuy);
        } catch (error) {
            errCode1(res, error);
        }
    }

    // [PUT] /admin/handleSellCoin/:id
    handleSellCoin(req, res) {
        const { id } = req.params;
        const { status } = req.body;

        if (status === 'Confirmed') {
            const query = {
                _id: id,
                status: 'On hold',
                type: 'SellCoin'
            };

            Bills.findOne(query, (err, bill) => {
                if (err) errCode1(res, err);

                if (bill) {
                    let emailUser = bill.buyer.gmailUSer;
                    User.findOne(
                        { 'payment.email': emailUser },
                        (err, user) => {
                            if (err)
                                return res
                                    .status(404)
                                    .json({ code: 1, message: err.message });

                            if (user) {
                                let prepare = {
                                    id: bill._id,
                                    amount: bill.amount,
                                    symbol: bill.symbol,
                                    fee: bill.fee,
                                    price: bill.price
                                };
                                let result = handleSubCoinAuto(
                                    prepare.symbol,
                                    prepare.amount,
                                    user
                                );
                                result
                                    .then((val) => {
                                        user.Wallet.balance =
                                            methods.precisionRound(
                                                parseFloat(
                                                    user.Wallet.balance
                                                ) +
                                                    methods.precisionRound(
                                                        parseFloat(
                                                            prepare.amount
                                                        ) *
                                                            parseFloat(
                                                                prepare.price
                                                            )
                                                    )
                                            );
                                        user.save()
                                            .then((u) => {
                                                if (u) {
                                                    bill.status = status;
                                                    bill.save()
                                                        .then((b) => {
                                                            if (b) {
                                                                successCode(
                                                                    res,
                                                                    `Confirmed the bill with type sell coin successfully with id = ${prepare.id}`
                                                                );
                                                            } else {
                                                                errCode2(
                                                                    res,
                                                                    `Bill status is not save with id = ${prepare.id}`
                                                                );
                                                            }
                                                        })
                                                        .catch((err) => {
                                                            errCode1(res, err);
                                                        });
                                                } else {
                                                    errCode2(
                                                        res,
                                                        `Can not save sub the balance of user with id = ${user._id}`
                                                    );
                                                }
                                            })
                                            .catch((err) => {
                                                errCode1(res, err);
                                            });
                                    })
                                    .catch((err) => {
                                        errCode1(res, err);
                                    });
                            } else {
                                errCode2(
                                    res,
                                    `User is not valid with id = ${user._id}`
                                );
                            }
                        }
                    );
                } else {
                    errCode2(
                        res,
                        `Bill of buy coin is not exist with id = ${id}`
                    );
                }
            });
        } else if (status === 'Canceled') {
            const query = {
                _id: id,
                status: 'Confirmed',
                type: 'SellCoin'
            };

            Bills.findOne(query, (err, bill) => {
                if (err) errCode1(res, err);

                if (bill) {
                    let emailUser = bill.buyer.gmailUSer;
                    User.findOne(
                        { 'payment.email': emailUser },
                        (err, user) => {
                            if (err)
                                return res
                                    .status(404)
                                    .json({ code: 1, message: err.message });

                            if (user) {
                                let prepare = {
                                    id: bill._id,
                                    amount: bill.amount,
                                    symbol: bill.symbol,
                                    fee: bill.fee,
                                    price: bill.price
                                };

                                let resultCanCel = handleAddCoinAuto(
                                    prepare.symbol,
                                    prepare.amount,
                                    user
                                );
                                resultCanCel
                                    .then((ress) => {
                                        user.Wallet.balance =
                                            methods.precisionRound(
                                                parseFloat(
                                                    user.Wallet.balance
                                                ) -
                                                    methods.precisionRound(
                                                        parseFloat(
                                                            prepare.amount
                                                        ) *
                                                            parseFloat(
                                                                prepare.price
                                                            )
                                                    )
                                            );
                                        user.save()
                                            .then((u) => {
                                                if (u) {
                                                    bill.status = status;
                                                    bill.save()
                                                        .then((b) => {
                                                            successCode(
                                                                res,
                                                                `Successfully cancel sub coin with id = ${id}`
                                                            );
                                                        })
                                                        .catch((err) => {
                                                            errCode1(req, err);
                                                        });
                                                } else {
                                                    errCode2(
                                                        res,
                                                        `Can not save user with email ${emailUser}`
                                                    );
                                                }
                                            })
                                            .catch((err) => {
                                                errCode1(res, err);
                                            });
                                    })
                                    .catch((err) => {
                                        errCode1(res, err);
                                    });
                            } else {
                                errCode2(
                                    res,
                                    `User is not valid with email = ${emailUser}`
                                );
                            }
                        }
                    );
                } else {
                    errCode2(
                        res,
                        `Bill with type sell is not valid with id = ${id}`
                    );
                }
            });
        } else {
            const query = {
                _id: id,
                type: 'SellCoin'
            };

            Bills.findOne(query, (err, bill) => {
                if (err) errCode1(res, err);

                if (bill) {
                    bill.status = status;
                    bill.save()
                        .then((b) => {
                            if (b) {
                                successCode(
                                    res,
                                    `Change status of bill type sell coin with id = ${id}`
                                );
                            } else {
                                errCode2(
                                    res,
                                    `Can not save status bill with id = ${id}`
                                );
                            }
                        })
                        .catch((err) => {
                            errCode1(res, err);
                        });
                } else {
                    errCode2(res, `Bill is not valid with id = ${id}`);
                }
            });
        }
    }
    // [PUT] /admin/testHandleSellCoin/:id
    async handle_sell_coin_v2(req, res, next) {
        const { id } = req.params;
        const { status } = req.body;
        try {
            if (status == undefined) {
                throw {
                    code: 1,
                    message: 'No status for this event handle sell coin'
                };
            } else {
                const orderSell = await Bills.findById(id);
                if (!orderSell) {
                    errCode2(res, `Oder sell is not valid with id = ${id}`);
                } else {
                    if (orderSell.type == 'SellCoin') {
                        const user = await User.findOne({
                            'payment.email': orderSell.buyer.gmailUSer
                        });
                        if (!user) {
                            errCode2(
                                res,
                                `User is not valid with email: ${orderSell.buyer.gmailUSer}`
                            );
                        } else {
                            let balance_user = parseFloat(user.Wallet.balance);
                            if (status == 'Completed') {
                                if (orderSell.status == 'Pending') {
                                    let prepare = {
                                        id: orderSell._id,
                                        amount: orderSell.amount,
                                        symbol: orderSell.symbol,
                                        fee: orderSell.fee,
                                        price: orderSell.price
                                    };
                                    let resultSubCoin = handleSubCoinAuto(
                                        prepare.symbol,
                                        prepare.amount,
                                        user
                                    );
                                    resultSubCoin
                                        .then(() => {
                                            let balance_after_sell =
                                                precisionRound(
                                                    balance_user +
                                                        precisionRound(
                                                            parseFloat(
                                                                prepare.amount
                                                            ) *
                                                                parseFloat(
                                                                    prepare.price
                                                                ) *
                                                                (1 -
                                                                    parseFloat(
                                                                        prepare.fee
                                                                    ))
                                                        )
                                                );
                                            user.Wallet.balance =
                                                balance_after_sell;
                                            user.save()
                                                .then(async () => {
                                                    const commission =
                                                        await Commission.findById(
                                                            process.env
                                                                .ID_COMMISSION
                                                        );
                                                    const commisionAfter =
                                                        precisionRound(
                                                            parseFloat(
                                                                commission.commission
                                                            ) +
                                                                precisionRound(
                                                                    parseFloat(
                                                                        prepare.amount
                                                                    ) *
                                                                        parseFloat(
                                                                            prepare.price
                                                                        ) *
                                                                        parseFloat(
                                                                            prepare.fee
                                                                        )
                                                                )
                                                        );
                                                    commission.commission =
                                                        commisionAfter;
                                                    commission
                                                        .save()
                                                        .then(() => {
                                                            orderSell.status =
                                                                status;
                                                            orderSell
                                                                .save()
                                                                .then(() => {
                                                                    mail(
                                                                        user
                                                                            .payment
                                                                            .email,
                                                                        sellSuccess(
                                                                            user
                                                                                .payment
                                                                                .username,
                                                                            orderSell
                                                                        ),
                                                                        'Sell Coins Successfully'
                                                                    )
                                                                        .then(
                                                                            () => {
                                                                                successCode(
                                                                                    res,
                                                                                    `${status} successfully order sell coin of user with email: ${orderSell.buyer.gmailUSer}`
                                                                                );
                                                                            }
                                                                        )
                                                                        .catch(
                                                                            (
                                                                                err
                                                                            ) => {
                                                                                errCode1(
                                                                                    res,
                                                                                    err
                                                                                );
                                                                            }
                                                                        );
                                                                })
                                                                .catch((err) =>
                                                                    errCode1(
                                                                        res,
                                                                        err
                                                                    )
                                                                );
                                                        })
                                                        .catch((err) => {
                                                            errCode1(res, err);
                                                        });
                                                })
                                                .catch((err) =>
                                                    errCode1(res, err)
                                                );
                                        })
                                        .catch((err) => errCode1(res, err));
                                } else {
                                    errCode2(
                                        res,
                                        `Can not execute this command because it is not enough condition for ${status}. Please pending first.`
                                    );
                                }
                            } else if (status == 'Canceled') {
                                if (orderSell.status == 'Completed') {
                                    let prepare = {
                                        id: orderSell._id,
                                        amount: orderSell.amount,
                                        symbol: orderSell.symbol,
                                        fee: orderSell.fee,
                                        price: orderSell.price
                                    };
                                    let resultAddCoin = handleAddCoinAuto(
                                        prepare.symbol,
                                        prepare.amount,
                                        user
                                    );
                                    resultAddCoin
                                        .then(() => {
                                            let balance_after_cancel_sell =
                                                precisionRound(
                                                    balance_user -
                                                        precisionRound(
                                                            parseFloat(
                                                                prepare.amount
                                                            ) *
                                                                parseFloat(
                                                                    prepare.price
                                                                ) *
                                                                (1 -
                                                                    parseFloat(
                                                                        prepare.fee
                                                                    ))
                                                        )
                                                );
                                            user.Wallet.balance =
                                                balance_after_cancel_sell;
                                            user.save()
                                                .then(async () => {
                                                    const commission =
                                                        await Commission.findById(
                                                            process.env
                                                                .ID_COMMISSION
                                                        );
                                                    const commisionAfter =
                                                        precisionRound(
                                                            parseFloat(
                                                                commission.commission
                                                            ) -
                                                                precisionRound(
                                                                    parseFloat(
                                                                        prepare.amount
                                                                    ) *
                                                                        parseFloat(
                                                                            prepare.price
                                                                        ) *
                                                                        parseFloat(
                                                                            prepare.fee
                                                                        )
                                                                )
                                                        );
                                                    commission.commission =
                                                        commisionAfter;
                                                    commission
                                                        .save()
                                                        .then(() => {
                                                            orderSell.status =
                                                                status;
                                                            orderSell
                                                                .save()
                                                                .then(() => {
                                                                    successCode(
                                                                        res,
                                                                        `${status} successfully order sell coin of user with email: ${orderSell.buyer.gmailUSer}`
                                                                    );
                                                                })
                                                                .catch((err) =>
                                                                    errCode1(
                                                                        res,
                                                                        err
                                                                    )
                                                                );
                                                        })
                                                        .catch((err) => {
                                                            errCode1(res, err);
                                                        });
                                                })
                                                .catch((err) =>
                                                    errCode1(res, err)
                                                );
                                        })
                                        .catch((err) => errCode1(res, err));
                                } else if (orderSell.status == 'Pending') {
                                    orderSell.status = status;
                                    orderSell
                                        .save()
                                        .then(() => {
                                            successCode(
                                                res,
                                                `${status} successfully for order sell coin`
                                            );
                                        })
                                        .catch((err) => errCode1(res, err));
                                } else {
                                    errCode2(
                                        res,
                                        `Can not execute this command because it is not enough condition for ${status}. Please Completed first.`
                                    );
                                }
                            } else if (status == 'Pending') {
                                if (orderSell.status == 'Canceled') {
                                    orderSell.status = status;
                                    orderSell
                                        .save()
                                        .then(() => {
                                            successCode(
                                                res,
                                                `${status} successfully order sell coin of user with email: ${orderSell.buyer.gmailUSer}`
                                            );
                                        })
                                        .catch((err) => errCode1(res, err));
                                } else {
                                    errCode2(
                                        res,
                                        `${status} failed order sell coin of user with email: ${orderSell.buyer.gmailUSer}. Please canceled first`
                                    );
                                }
                            } else {
                                errCode2(
                                    res,
                                    `${status} is not supported for sell coin`
                                );
                            }
                        }
                    } else {
                        errCode2(
                            res,
                            `Order sell coin is not valid with id = ${id}`
                        );
                    }
                }
            }
        } catch (error) {
            errCode1(res, error);
        }
    }

    // [DELETE] /admin/deleteBuy/:id
    deleteBuy(req, res) {
        const { id } = req.params;
        const query = {
            _id: id,
            type: 'BuyCoin'
        };

        Bills.findOne(query, (err, bill) => {
            if (err) errCode1(res, err);

            if (bill) {
                Bills.deleteOne({ _id: bill.id })
                    .then(() => {
                        successCode(
                            res,
                            `Successfully! delete buy bill with id = ${id}`
                        );
                    })
                    .catch((err) => {
                        errCode1(res, err);
                    });
            } else {
                errCode2(res, `Bill is not valid with id = ${id}`);
            }
        });
    }
    // [DELETE] /admin/deleteSell/:id
    deleteSell(req, res) {
        const { id } = req.params;
        const query = {
            _id: id,
            type: 'SellCoin'
        };

        Bills.findOne(query, (err, bill) => {
            if (err) errCode1(res, err);

            if (bill) {
                Bills.deleteOne({ _id: id })
                    .then(() => {
                        successCode(
                            res,
                            `Successfully! delete sell bill with id = ${id}`
                        );
                    })
                    .catch((err) => {
                        errCode1(res, err);
                    });
            } else {
                errCode2(res, `Bill is not valid with id = ${id}`);
            }
        });
    }

    // ---------------------------------------------services-------------------------------------------------

    // [PUT] /admin/updateRankUser/:id
    updateRankUser(req, res) {
        const { id } = req.params;
        let date = new Date().toUTCString();
        User.findById(id, (err, user) => {
            if (err) errCode1(res, err);

            if (user) {
                if (req.body.fee) {
                    req.body.updatedAt = date;
                    user.updateOne({ $set: req.body })
                        .then((u) => {
                            if (u) {
                                successCode(
                                    res,
                                    `Successfully! Update rank and fee of user`
                                );
                            } else {
                                errCode2(
                                    res,
                                    `Can not save fee and rank of user with id = ${user._id}`
                                );
                            }
                        })
                        .catch((err) => {
                            errCode1(res, err);
                        });
                } else {
                    user.updateOne({ $set: req.body })
                        .then((u) => {
                            if (u) {
                                Rank.findOne(
                                    { ranks: req.body.rank },
                                    (err, r) => {
                                        if (err) errCode1(res, err);

                                        if (r) {
                                            user.updatedAt = date;
                                            user.fee = r.fee;
                                            user.save()
                                                .then((v) => {
                                                    if (v) {
                                                        successCode(
                                                            res,
                                                            `Successfully !! Update fee and rank of user`
                                                        );
                                                    } else {
                                                        errCode2(
                                                            res,
                                                            `Can not save fee of user with id = ${u._id}`
                                                        );
                                                    }
                                                })
                                                .catch((err) => {
                                                    errCode1(res, err);
                                                });
                                        } else {
                                            errCode2(
                                                res,
                                                `Rank is not valid with rank = ${req.body.rank}`
                                            );
                                        }
                                    }
                                );
                            } else {
                                errCode2(
                                    res,
                                    `Can not save information with user_id = ${user._id}`
                                );
                            }
                        })
                        .catch((err) => {
                            errCode1(res, err);
                        });
                }
            } else {
                errCode2(res, `User is not valid with id = ${id}`);
            }
        });
    }

    // [PUT] /admin/changePWDForUser/:id
    changePWDForUser(req, res) {
        const { id } = req.params;
        const { pwd } = req.body;
        User.findById(id, (err, user) => {
            if (err) errCode1(res, err);

            if (user) {
                bcrypt
                    .hash(pwd, 10)
                    .then((hashed) => {
                        if (hashed) {
                            user.payment.password = hashed;
                            user.save()
                                .then((u) => {
                                    if (u) {
                                        successCode(
                                            res,
                                            `Changed password of user with id = ${id}`
                                        );
                                    } else {
                                        errCode2(
                                            res,
                                            `Can not change password of user with = ${id}`
                                        );
                                    }
                                })
                                .catch((err) => {
                                    errCode1(res, err);
                                });
                        } else {
                            errCode2(res, `Can not hashed password = ${pwd}`);
                        }
                    })
                    .catch((err) => {
                        errCode1(res, err);
                    });
            } else {
                errCode2(res, `User is not valid with id = ${id}`);
            }
        });
    }

    // [PUT] /admin/refreshPWD/:id
    refreshPWD(req, res) {
        const { id } = req.params;
        User.findById(id, (err, user) => {
            if (err) errCode1(res, err);

            if (user) {
                let newPWD = otpGenerator.generate(10);
                bcrypt
                    .hash(newPWD, 10)
                    .then((hashed) => {
                        if (hashed) {
                            user.payment.password = hashed;
                            user.save()
                                .then((u) => {
                                    if (u) {
                                        const mailContent = `
                  This is your new password = ${newPWD}

                  Best Regards
                `;
                                        let resultSendMail = methods.mail(
                                            user.payment.email,
                                            mailContent,
                                            'Refresh Passowrd'
                                        );
                                        resultSendMail
                                            .then((val) => {
                                                successCode(
                                                    res,
                                                    `Send mail for refresh password is successfully`
                                                );
                                            })
                                            .catch((err) => {
                                                errCode1(res, err);
                                            });
                                    } else {
                                        errCode2(
                                            res,
                                            `Can not change password of user with id =${id}`
                                        );
                                    }
                                })
                                .catch((err) => {
                                    errCode1(res, err);
                                });
                        } else {
                            errCode2(res, `Can not hash password`);
                        }
                    })
                    .catch((err) => {
                        errCode1(res, err);
                    });
            } else {
                errCode2(res, `User is not valid with id = ${id}`);
            }
        });
    }

    // [PUT] /admin/changeCoin/:id
    changeCoin(req, res) {
        const { id } = req.params;
        const { coin, quantity } = req.body;

        User.findById(id, (err, user) => {
            if (err) errCode1(res, err);

            if (user) {
                if (coin === 'USDT') {
                    if (quantity > 0) {
                        user.Wallet.balance = methods.precisionRound(
                            parseFloat(user.Wallet.balance) +
                                parseFloat(quantity)
                        );
                        user.save()
                            .then((u) => {
                                if (u) {
                                    successCode(res, `Give USDT successfully`);
                                } else {
                                    errCode2(res, `Can not give USDT for user`);
                                }
                            })
                            .catch((err) => {
                                errCode1(err);
                            });
                    } else {
                        let resultSub = methods.precisionRound(
                            parseFloat(user.Wallet.balance) +
                                parseFloat(quantity)
                        );
                        if (resultSub > 0) {
                            user.Wallet.balance = resultSub;
                            user.save()
                                .then((u) => {
                                    if (u) {
                                        successCode(
                                            res,
                                            `Give USDT successfully`
                                        );
                                    } else {
                                        errCode2(
                                            res,
                                            `Can not give USDT for user`
                                        );
                                    }
                                })
                                .catch((err) => {
                                    errCode1(err);
                                });
                        } else {
                            errCode2(
                                res,
                                `Balance of user is not enough for sub USDT with quantity = ${quantity}`
                            );
                        }
                    }
                } else {
                    if (quantity > 0) {
                        let resultAddCoin = handleAddCoinAuto(
                            coin,
                            quantity,
                            user
                        );
                        resultAddCoin
                            .then((val) => {
                                successCode(
                                    res,
                                    `Add coin ${coin} with quantity = ${quantity} successfully to user with id = ${user._id}`
                                );
                            })
                            .catch((err) => {
                                errCode1(res, err);
                            });
                    } else {
                        let new_quantity = Math.abs(quantity);
                        let resultSubcoin = handleSubCoinAuto(
                            coin,
                            new_quantity,
                            user
                        );
                        resultSubcoin
                            .then((val) => {
                                successCode(
                                    res,
                                    `Sub coin ${coin} with quantity = ${new_quantity} successfully to user with id = ${user._id}`
                                );
                            })
                            .catch((err) => {
                                errCode1(res, err);
                            });
                    }
                }
            } else {
                errCode2(res, `User is not valid with id = ${id}`);
            }
        });
    }

    async change_coin_v2(req, res) {
        const { id } = req.params;
        const { coin, quantity, createBy, bankAdmin } = req.body;

        try {
            const code = otpGenerator.generate(20);
            const user = await User.findById(id);
            const rateWithdrawDeposit = await RateWithdrawDeposit.findOne({});
            if (user) {
                const balance_user = parseFloat(user.Wallet.balance);
                if (coin === 'USDT') {
                    if (quantity > 0) {
                        const newDeposit = new Deposits({
                            code: code,
                            user: user.payment.email,
                            createBy: createBy,
                            amount: quantity,
                            amountUsd: quantity,
                            amountVnd:
                                quantity * rateWithdrawDeposit.rateDeposit
                        });
                        newDeposit
                            .save()
                            .then((deposit) => {
                                user.Wallet.balance = precisionRound(
                                    balance_user + parseFloat(quantity)
                                );
                                user.save()
                                    .then(() => {
                                        deposit.status = 'Completed';
                                        deposit
                                            .save()
                                            .then(() => {
                                                successCode(
                                                    res,
                                                    `Add USDT for user with email = ${user.payment.email} successfully with quantity = ${quantity}`
                                                );
                                            })
                                            .catch((err) => {
                                                throw {
                                                    message: err.message
                                                };
                                            });
                                    })
                                    .catch((err) => {
                                        throw {
                                            message: err.message
                                        };
                                    });
                            })
                            .catch((err) => {
                                throw {
                                    message: err.message
                                };
                            });
                    } else {
                        const checkBalance = precisionRound(
                            parseFloat(user.Wallet.balance) -
                                parseFloat(Math.abs(quantity))
                        );
                        if (checkBalance < 0) {
                            throw {
                                message: `Current balance of user: ${
                                    user.Wallet.balance
                                } but want to withdraw: ${Math.abs(
                                    quantity
                                )} is not enough`
                            };
                        } else {
                            const newWithdraw = new Withdraws({
                                code: code,
                                amount: Math.abs(quantity),
                                amountUsd: Math.abs(quantity),
                                amountVnd: precisionRound(
                                    parseFloat(Math.abs(quantity)) *
                                        parseFloat(
                                            rateWithdrawDeposit.rateWithdraw
                                        )
                                ),
                                method: {
                                    methodName: user.payment.bank.bankName,
                                    accountName: user.payment.bank.name,
                                    accountNumber: user.payment.bank.account,
                                    transform: precisionRound(
                                        parseFloat(Math.abs(quantity)) *
                                            parseFloat(
                                                rateWithdrawDeposit.rateWithdraw
                                            )
                                    )
                                },
                                createBy: createBy,
                                user: user.payment.email
                            });
                            newWithdraw
                                .save()
                                .then((withdraw) => {
                                    user.Wallet.balance = precisionRound(
                                        balance_user -
                                            parseFloat(Math.abs(quantity))
                                    );
                                    user.save()
                                        .then(() => {
                                            withdraw.status = 'Completed';
                                            withdraw
                                                .save()
                                                .then(() => {
                                                    successCode(
                                                        res,
                                                        `Subtract USDT for user with email = ${
                                                            user.payment.email
                                                        } successfully with quantity = ${Math.abs(
                                                            quantity
                                                        )}`
                                                    );
                                                })
                                                .catch((err) => {
                                                    throw {
                                                        message: err.message
                                                    };
                                                });
                                        })
                                        .catch((err) => {
                                            throw {
                                                message: err.message
                                            };
                                        });
                                })
                                .catch((err) => {
                                    throw {
                                        message: err.message
                                    };
                                });
                        }
                    }
                } else {
                    const coinFind = await Coins.findOne({ symbol: coin });
                    if (coinFind) {
                        if (quantity > 0) {
                            const newOrderBuy = new Bills({
                                fee: user.fee,
                                buyer: {
                                    gmailUSer: user.payment.email,
                                    rank: user.rank
                                },
                                amount: quantity,
                                amountUsd: precisionRound(
                                    parseFloat(quantity) *
                                        parseFloat(coinFind.price)
                                ),
                                symbol: coin,
                                price: coinFind.price,
                                type: 'BuyCoin'
                            });
                            newOrderBuy.createBy = createBy;
                            newOrderBuy
                                .save()
                                .then((order) => {
                                    handleAddCoinAuto(coin, quantity, user)
                                        .then(() => {
                                            order.status = 'Completed';
                                            order
                                                .save()
                                                .then(() => {
                                                    successCode(
                                                        res,
                                                        `Give coin ${coin} successfully to user: ${user.payment.email}`
                                                    );
                                                })
                                                .catch((err) => {
                                                    throw {
                                                        message: err.message
                                                    };
                                                });
                                        })
                                        .catch((err) => {
                                            throw {
                                                message: err.message
                                            };
                                        });
                                })
                                .catch((err) => {
                                    throw {
                                        message: err.message
                                    };
                                });
                        } else {
                            const quantity_ = Math.abs(quantity);
                            const newOrderSell = new Bills({
                                fee: user.fee,
                                buyer: {
                                    gmailUSer: user.payment.email,
                                    rank: user.rank
                                },
                                amount: quantity_,
                                amountUsd: precisionRound(
                                    parseFloat(quantity_) *
                                        parseFloat(coinFind.price)
                                ),
                                symbol: coin,
                                price: coinFind.price,
                                type: 'SellCoin'
                            });
                            newOrderSell.createBy = createBy;
                            newOrderSell
                                .save()
                                .then((order) => {
                                    handleSubCoinAuto(coin, quantity_, user)
                                        .then(() => {
                                            order.status = 'Completed';
                                            order
                                                .save()
                                                .then(() => {
                                                    successCode(
                                                        res,
                                                        `Subtract coin ${coin} successfully to user: ${user.payment.email}`
                                                    );
                                                })
                                                .catch((err) => {
                                                    errCode1(res, err);
                                                });
                                        })
                                        .catch((err) => {
                                            errCode1(res, err);
                                        });
                                })
                                .catch((err) => {
                                    throw {
                                        message: err.message
                                    };
                                });
                        }
                    } else {
                        throw {
                            message: `${coin} is not valid for give coin to user: ${user.payment.email}`
                        };
                    }
                }
            } else {
                throw {
                    message: `User is not valid with id = ${id}`
                };
            }
        } catch (error) {
            errCode1(res, error);
        }
    }

    // [PUT] /admin/lockUser/:id
    lockUser(req, res) {
        const { id } = req.params;

        User.findById(id, (err, user) => {
            if (err) errCode1(res, err);
            if (user) {
                user.updateOne({ $set: req.body })
                    .then(() => {
                        successCode(res, `User is locked with id = ${id}`);
                    })
                    .catch((err) => {
                        errCode1(res, err);
                    });
            } else {
                errCode2(res, `User is not valid with id = ${id}`);
            }
        });
    }

    // [PUT] /admin/unlockUser/:id
    unlockUser(req, res) {
        const { id } = req.params;

        User.findById(id, (err, user) => {
            if (err) errCode1(res, err);
            if (user) {
                user.updateOne({ $set: req.body })
                    .then(() => {
                        successCode(res, `User is unlocked with id = ${id}`);
                    })
                    .catch((err) => {
                        errCode1(res, err);
                    });
            } else {
                errCode2(res, `User is not valid with id = ${id}`);
            }
        });
    }

    // [PUT] /admin/handleDeposit/:id
    handleDeposit(req, res) {
        const { id } = req.params;

        const { status } = req.body;

        Deposits.findById(id, (err, deposit) => {
            if (err) errCode1(res, err);

            if (deposit) {
                User.findOne({ 'payment.email': deposit.user }, (err, user) => {
                    if (err) errCode1(res, err);

                    if (user) {
                        if (status === 'Completed') {
                            if (deposit.status == 'Confirmed') {
                                const new_balance = methods.precisionRound(
                                    parseFloat(user.Wallet.balance) +
                                        parseFloat(deposit.amountUsd)
                                );
                                user.Wallet.balance = new_balance;
                                user.Wallet.deposit = methods.precisionRound(
                                    parseFloat(user.Wallet.deposit) +
                                        parseFloat(deposit.amountUsd)
                                );
                                user.save()
                                    .then((u) => {
                                        if (u) {
                                            deposit.status = status;
                                            deposit.updatedAt = new Date();
                                            deposit
                                                .save()
                                                .then((d) => {
                                                    if (d) {
                                                        successCode(
                                                            res,
                                                            `Confirmed deposit with id = ${id}`
                                                        );
                                                    } else {
                                                        errCode2(
                                                            res,
                                                            `Can not save the status of deposit with id = ${id}`
                                                        );
                                                    }
                                                })
                                                .catch((err) => {
                                                    errCode1(res, err);
                                                });
                                        } else {
                                            errCode2(
                                                res,
                                                `User balance and deposit is not saved with email = ${user.payment.email}`
                                            );
                                        }
                                    })
                                    .catch((err) => {
                                        errCode1(res, err);
                                    });
                            } else {
                                errCode2(
                                    res,
                                    `Order Deposit is not valid for Completed`
                                );
                            }
                        } else if (status === 'Canceled') {
                            if (deposit.status == 'Completed') {
                                const new_balance = methods.precisionRound(
                                    parseFloat(user.Wallet.balance) -
                                        parseFloat(deposit.amountUsd)
                                );
                                if (new_balance < 0) {
                                    errCode2(
                                        res,
                                        `Can not Canceled the deposit of user because the money of this user is not enough`
                                    );
                                } else {
                                    user.Wallet.balance = new_balance;
                                    user.Wallet.deposit =
                                        methods.precisionRound(
                                            parseFloat(user.Wallet.deposit) -
                                                parseFloat(deposit.amountUsd)
                                        );
                                    user.save()
                                        .then((u) => {
                                            if (u) {
                                                deposit.status = status;
                                                deposit.updatedAt = new Date();
                                                deposit
                                                    .save()
                                                    .then((d) => {
                                                        if (d) {
                                                            successCode(
                                                                res,
                                                                `Canceled deposit with id = ${id}`
                                                            );
                                                        } else {
                                                            errCode2(
                                                                res,
                                                                `Can not save the status of deposit with id = ${id}`
                                                            );
                                                        }
                                                    })
                                                    .catch((err) => {
                                                        errCode1(res, err);
                                                    });
                                            } else {
                                                errCode2(
                                                    res,
                                                    `User balance and deposit is not saved with email = ${user.payment.email}`
                                                );
                                            }
                                        })
                                        .catch((err) => {
                                            errCode1(res, err);
                                        });
                                }
                            } else {
                                errCode2(
                                    res,
                                    `Order Deposit is not valid for Canceled`
                                );
                            }
                        } else {
                            deposit.status = status;
                            deposit.updatedAt = new Date();
                            deposit
                                .save()
                                .then((d) => {
                                    if (d) {
                                        successCode(
                                            res,
                                            `Changed ${status} of deposit with id = ${id}`
                                        );
                                    } else {
                                        errCode2(
                                            res,
                                            `Deposit can not change status with id = ${id}`
                                        );
                                    }
                                })
                                .catch((err) => {
                                    errCode1(res, err);
                                });
                        }
                    } else {
                        errCode2(res, `User is not vailid`);
                    }
                });
            } else {
                errCode2(res, `Deposit is not valid id = ${id}`);
            }
        });
    }

    // [PUT] /admin/handleDeposit/:id
    async handle_deposit_v2(req, res, next) {
        const { id } = req.params;
        const { status } = req.body;
        try {
            if (status == undefined) {
                throw {
                    code: 1,
                    message:
                        'Status for handle deposit is not valid. Please choose status.'
                };
            } else {
                const deposit = await Deposits.findById(id);

                if (!deposit) {
                    errCode2(res, `Deposit is not valid with id = ${id}`);
                } else {
                    const user = await User.findOne({
                        'payment.email': deposit.user
                    });
                    if (!user) {
                        errCode2(
                            res,
                            `User is not valid with id = ${id} of order deposit`
                        );
                    } else {
                        const balance_user = parseFloat(user.Wallet.balance);
                        if (status == 'Completed') {
                            if (deposit.status == 'Confirmed') {
                                let balance_after_deposit = precisionRound(
                                    balance_user + parseFloat(deposit.amountUsd)
                                );
                                let deposit_after = precisionRound(
                                    parseFloat(user.Wallet.deposit) +
                                        parseFloat(deposit.amountUsd)
                                );

                                user.Wallet.balance = balance_after_deposit;
                                user.Wallet.deposit = deposit_after;

                                user.save()
                                    .then(() => {
                                        deposit.status = status;
                                        deposit
                                            .save()
                                            .then(() => {
                                                mail(
                                                    user.payment.email,
                                                    depositSuccess(
                                                        user.payment.username,
                                                        deposit.amountUsd
                                                    ),
                                                    'Your Deposit Request was Successfully'
                                                )
                                                    .then(() => {
                                                        successCode(
                                                            res,
                                                            `${status} successfully of order deposit with id = ${id}`
                                                        );
                                                    })
                                                    .catch((err) => {
                                                        errCode1(res, err);
                                                    });
                                            })
                                            .catch((err) => errCode1(res, err));
                                    })
                                    .catch((err) => errCode1(res, err));
                            } else {
                                errCode2(
                                    res,
                                    `Can not execute this command because it is not enough condition for ${status}. Please change the status of order to On hold. Or it is already is ${status}`
                                );
                            }
                        } else if (status == 'Canceled') {
                            if (deposit.status == 'Completed') {
                                let balance_after_deposit = precisionRound(
                                    balance_user - parseFloat(deposit.amountUsd)
                                );

                                let deposit_after = precisionRound(
                                    parseFloat(user.Wallet.deposit) -
                                        parseFloat(deposit.amountUsd)
                                );

                                if (balance_after_deposit < 0) {
                                    errCode2(
                                        res,
                                        `Balance of user is not enough for repaying of order deposit with id = ${id}`
                                    );
                                } else {
                                    user.Wallet.balance = balance_after_deposit;
                                    user.Wallet.deposit = deposit_after;
                                    user.save()
                                        .then(() => {
                                            deposit.status = status;
                                            deposit
                                                .save()
                                                .then(() => {
                                                    successCode(
                                                        res,
                                                        `${status} successfully of order deposit with id = ${id}`
                                                    );
                                                })
                                                .catch((err) =>
                                                    errCode1(res, err)
                                                );
                                        })
                                        .catch((err) => errCode1(res, err));
                                }
                            } else {
                                deposit.status = status;
                                deposit
                                    .save()
                                    .then(() => {
                                        successCode(
                                            res,
                                            `${status} successfully for refusing deposit of user`
                                        );
                                    })
                                    .catch((err) => errCode1(res, err));
                            }
                        } else if (status == 'Confirmed') {
                            if (deposit.status == 'On hold') {
                                deposit.status = status;
                                deposit
                                    .save()
                                    .then(() => {
                                        successCode(
                                            res,
                                            `${status} successfully for this order deposit with id = ${id}`
                                        );
                                    })
                                    .catch((err) => errCode1(res, err));
                            } else {
                                errCode2(
                                    res,
                                    `Order deposit is not enough condition for ${status}. Please Confirmed this order deposit first. Or it is already is ${status}`
                                );
                            }
                        } else if (status == 'On hold') {
                            if (deposit.status == 'Canceled') {
                                deposit.status = status;
                                deposit
                                    .save()
                                    .then(() => {
                                        successCode(
                                            res,
                                            `${status} successfully for this order deposit with id = ${id}`
                                        );
                                    })
                                    .catch((err) => errCode1(res, err));
                            } else {
                                errCode2(
                                    res,
                                    `Order deposit is not enough condition for ${status}. Please Canceled this order deposit first. Or it is already is ${status}`
                                );
                            }
                        } else {
                            errCode2(
                                res,
                                `${status} is not support for handle Deposit`
                            );
                        }
                    }
                }
            }
        } catch (error) {
            errCode1(res, error);
        }
    }

    // [PUT] /admin/handleWithdraw/:id
    handleWithdraw(req, res) {
        const { id } = req.params;

        const { status } = req.body;

        Withdraws.findById(id, (err, withdraw) => {
            if (err) errCode1(res, err);

            if (withdraw) {
                User.findOne(
                    { 'payment.email': withdraw.user },
                    (err, user) => {
                        if (err) errCode1(res, err);

                        if (user) {
                            if (
                                status === 'Confirmed' ||
                                status === 'Completed'
                            ) {
                                if (
                                    (withdraw.status == 'On hold' &&
                                        status === 'Confirmed') ||
                                    (withdraw.status === 'Canceled' &&
                                        status === 'Completed')
                                ) {
                                    const new_balance = methods.precisionRound(
                                        parseFloat(user.Wallet.balance) -
                                            parseFloat(withdraw.amountUsd)
                                    );
                                    if (new_balance < 0) {
                                        errCode2(
                                            res,
                                            `Can not Confirmed the withdraw of user because the money of this user is not enough`
                                        );
                                    } else {
                                        user.Wallet.balance = new_balance;
                                        user.Wallet.withdraw =
                                            methods.precisionRound(
                                                parseFloat(
                                                    user.Wallet.withdraw
                                                ) +
                                                    parseFloat(
                                                        withdraw.amountUsd
                                                    )
                                            );
                                        user.save()
                                            .then((u) => {
                                                if (u) {
                                                    withdraw.status = status;
                                                    withdraw.updatedAt =
                                                        new Date();
                                                    withdraw
                                                        .save()
                                                        .then((d) => {
                                                            if (d) {
                                                                successCode(
                                                                    res,
                                                                    `Confirmed withdraw with id = ${id}`
                                                                );
                                                            } else {
                                                                errCode2(
                                                                    res,
                                                                    `Can not save the status of withdraw with id = ${id}`
                                                                );
                                                            }
                                                        })
                                                        .catch((err) => {
                                                            errCode1(res, err);
                                                        });
                                                } else {
                                                    errCode2(
                                                        res,
                                                        `User balance and withdraw is not saved with email = ${user.payment.email}`
                                                    );
                                                }
                                            })
                                            .catch((err) => {
                                                errCode1(res, err);
                                            });
                                    }
                                } else {
                                    errCode2(
                                        res,
                                        'Withdraw is not valid for Confirmed'
                                    );
                                }
                            } else if (status === 'Canceled') {
                                if (withdraw.status == 'Confirmed') {
                                    const new_balance = methods.precisionRound(
                                        parseFloat(user.Wallet.balance) +
                                            parseFloat(withdraw.amountUsd)
                                    );
                                    user.Wallet.balance = new_balance;
                                    user.Wallet.withdraw =
                                        methods.precisionRound(
                                            parseFloat(user.Wallet.withdraw) -
                                                parseFloat(withdraw.amountUsd)
                                        );
                                    user.save()
                                        .then((u) => {
                                            if (u) {
                                                withdraw.status = status;
                                                withdraw.updatedAt = new Date();
                                                withdraw
                                                    .save()
                                                    .then((d) => {
                                                        if (d) {
                                                            successCode(
                                                                res,
                                                                `Canceled withdraw with id = ${id}`
                                                            );
                                                        } else {
                                                            errCode2(
                                                                res,
                                                                `Can not save the status of withdraw with id = ${id}`
                                                            );
                                                        }
                                                    })
                                                    .catch((err) => {
                                                        errCode1(res, err);
                                                    });
                                            } else {
                                                errCode2(
                                                    res,
                                                    `User balance and withdraw is not saved with email = ${user.payment.email}`
                                                );
                                            }
                                        })
                                        .catch((err) => {
                                            errCode1(res, err);
                                        });
                                } else {
                                    withdraw.status = status;
                                    withdraw
                                        .save()
                                        .then(() => {
                                            successCode(
                                                res,
                                                `Canceled this order`
                                            );
                                        })
                                        .catch((err) => errCode1(res, err));
                                }
                            } else {
                                withdraw.status = status;
                                withdraw.updatedAt = new Date();
                                withdraw
                                    .save()
                                    .then((d) => {
                                        if (d) {
                                            successCode(
                                                res,
                                                `Changed ${status} of withdraw with id = ${id}`
                                            );
                                        } else {
                                            errCode2(
                                                res,
                                                `withdraw can not change status with id = ${id}`
                                            );
                                        }
                                    })
                                    .catch((err) => {
                                        errCode1(res, err);
                                    });
                            }
                        } else {
                            errCode2(res, `User is not vailid`);
                        }
                    }
                );
            } else {
                errCode2(res, `withdraw is not valid id = ${id}`);
            }
        });
    }

    // [PUT] /admin/handleWithdraw/:id
    async handleWithdraw_v2(req, res, next) {
        const { id } = req.params;
        const { status } = req.body;
        try {
            if (status == undefined) {
                throw {
                    code: 1,
                    message:
                        'Status for handle deposit is not valid. Please choose status.'
                };
            } else {
                const withdraw = await Withdraws.findById(id);

                if (!withdraw) {
                    errCode2(res, `Withdraw is not valid with id = ${id}`);
                } else {
                    const user = await User.findOne({
                        'payment.email': withdraw.user
                    });
                    if (!user) {
                        errCode2(
                            res,
                            `User is not valid with id = ${id} of order withdraw`
                        );
                    } else {
                        const balance_user = parseFloat(user.Wallet.balance);
                        if (status == 'Confirmed') {
                            if (withdraw.status == 'On hold') {
                                let balance_after_withdraw = precisionRound(
                                    balance_user -
                                        parseFloat(withdraw.amountUsd)
                                );
                                let withdraw_after = precisionRound(
                                    parseFloat(user.Wallet.withdraw) +
                                        parseFloat(withdraw.amountUsd)
                                );

                                if (balance_after_withdraw < 0) {
                                    errCode2(
                                        res,
                                        `Balance of user is not enough for executing the order withdraw`
                                    );
                                } else {
                                    user.Wallet.balance =
                                        balance_after_withdraw;
                                    user.Wallet.withdraw = withdraw_after;

                                    user.save()
                                        .then(() => {
                                            withdraw.status = status;
                                            withdraw
                                                .save()
                                                .then(() => {
                                                    successCode(
                                                        res,
                                                        `${status} successfully of order withdraw with id = ${id}`
                                                    );
                                                })
                                                .catch((err) =>
                                                    errCode1(res, err)
                                                );
                                        })
                                        .catch((err) => errCode1(res, err));
                                }
                            } else {
                                errCode2(
                                    res,
                                    `Can not execute this command because it is not enough condition for ${status}. Please change the status of order to On hold. Or it is already is ${status}`
                                );
                            }
                        } else if (status == 'Canceled') {
                            if (withdraw.status == 'Completed') {
                                let balance_after_withdraw = precisionRound(
                                    balance_user +
                                        parseFloat(withdraw.amountUsd)
                                );

                                let withdraw_after = precisionRound(
                                    parseFloat(user.Wallet.withdraw) -
                                        parseFloat(withdraw.amountUsd)
                                );

                                user.Wallet.balance = balance_after_withdraw;
                                user.Wallet.withdraw = withdraw_after;
                                user.save()
                                    .then(() => {
                                        withdraw.status = status;
                                        withdraw
                                            .save()
                                            .then(() => {
                                                successCode(
                                                    res,
                                                    `${status} successfully of order withdraw with id = ${id}`
                                                );
                                            })
                                            .catch((err) => errCode1(res, err));
                                    })
                                    .catch((err) => errCode1(res, err));
                            } else if (withdraw.status == 'Confirmed') {
                                let balance_after_withdraw = precisionRound(
                                    balance_user +
                                        parseFloat(withdraw.amountUsd)
                                );

                                let withdraw_after = precisionRound(
                                    parseFloat(user.Wallet.withdraw) -
                                        parseFloat(withdraw.amountUsd)
                                );

                                user.Wallet.balance = balance_after_withdraw;
                                user.Wallet.withdraw = withdraw_after;
                                user.save()
                                    .then(() => {
                                        withdraw.status = status;
                                        withdraw
                                            .save()
                                            .then(() => {
                                                successCode(
                                                    res,
                                                    `${status} successfully of order withdraw with id = ${id}`
                                                );
                                            })
                                            .catch((err) => errCode1(res, err));
                                    })
                                    .catch((err) => errCode1(res, err));
                            } else {
                                withdraw.status = status;
                                withdraw
                                    .save()
                                    .then(() => {
                                        successCode(
                                            res,
                                            `${status} successfully for refusing withdraw of user`
                                        );
                                    })
                                    .catch((err) => errCode1(res, err));
                            }
                        } else if (status == 'Completed') {
                            if (withdraw.status == 'Confirmed') {
                                withdraw.status = status;
                                withdraw
                                    .save()
                                    .then(() => {
                                        mail(user.payment.email);
                                        successCode(
                                            res,
                                            `${status} successfully for this order withdraw with id = ${id}`
                                        );
                                    })
                                    .catch((err) => errCode1(res, err));
                            } else {
                                errCode2(
                                    res,
                                    `Order withdraw is not enough condition for ${status}. Please Confirmed this order withdraw first. Or it is already is ${status}`
                                );
                            }
                        } else if (status == 'On hold') {
                            if (withdraw.status == 'Canceled') {
                                withdraw.status = status;
                                withdraw
                                    .save()
                                    .then(() => {
                                        successCode(
                                            res,
                                            `${status} successfully for this order withdraw with id = ${id}`
                                        );
                                    })
                                    .catch((err) => errCode1(res, err));
                            } else {
                                errCode2(
                                    res,
                                    `Order withdraw is not enough condition for ${status}. Please Canceled this order withdraw first. Or it is already is ${status}`
                                );
                            }
                        } else {
                            errCode2(
                                res,
                                `${status} is not support for handle withdraw`
                            );
                        }
                    }
                }
            }
        } catch (error) {
            errCode1(res, error);
        }
    }

    // [GET] /admin/totalDeposit
    async totalDeposit(req, res) {
        const { from, to } = req.body;
        if (!from || !to) {
            const totalDep = Deposits.find();
            const [deposits] = await Promise.all([totalDep]);
            if (deposits.length == 0) {
                errCode2(res, `No deposit !!`);
            } else {
                let total = 0;
                for (let i = 0; i < deposits.length; i++) {
                    total = methods.precisionRound(
                        parseFloat(total) + parseFloat(deposits[i].amountUsd)
                    );
                }
                dataCode(res, total);
            }
        } else {
            let fromDate = new Date(from);
            let toDate = new Date(to);
            const totalDep = Deposits.find({
                createdAt: {
                    $gte: fromDate,
                    $lt: toDate
                }
            });
            const [deposits] = await Promise.all([totalDep]);
            if (deposits.length == 0) {
                errCode2(res, `No deposit !!`);
            } else {
                let total = 0;
                for (let i = 0; i < deposits.length; i++) {
                    total = methods.precisionRound(
                        parseFloat(total) + parseFloat(deposits[i].amountUsd)
                    );
                }
                dataCode(res, total);
            }
        }
    }

    // [POST] /admin/totalWithdraw
    async totalWithdraw(req, res) {
        try {
            const { from, to } = req.body;
            if (!from || !to) {
                const totalWithdraw = Withdraws.find();
                const [withdraws] = await Promise.all([totalWithdraw]);
                if (withdraws.length == 0) {
                    errCode2(res, `No Withdraw !!`);
                } else {
                    let total = 0;
                    for (let i = 0; i < withdraws.length; i++) {
                        total = methods.precisionRound(
                            parseFloat(total) +
                                parseFloat(withdraws[i].amountUsd)
                        );
                    }
                    dataCode(res, total);
                }
            } else {
                let fromDate = new Date(from);
                let toDate = new Date(to);
                const totalWithdraw = Withdraws.find({
                    createdAt: {
                        $gte: fromDate,
                        $lt: toDate
                    }
                });
                const [withdraws] = await Promise.all([totalWithdraw]);
                if (withdraws.length == 0) {
                    errCode2(res, `No Withdraw !!`);
                } else {
                    let total = 0;
                    for (let i = 0; i < withdraws.length; i++) {
                        total = methods.precisionRound(
                            parseFloat(total) +
                                parseFloat(withdraws[i].amountUsd)
                        );
                    }
                    dataCode(res, total);
                }
            }
        } catch (err) {
            errCode1(res, err);
        }
    }

    // [POST] /admin/totalBalance
    async totalBalance(req, res) {
        const pages = req.query.page;
        const typeShow = req.query.show || 10;
        const step = typeShow * pages - typeShow;
        try {
            if (pages) {
                const totalUser = User.find();
                const [users] = await Promise.all([totalUser]);
                if (users.length == 0) {
                    errCode2(res, `No Balance of user !!`);
                } else {
                    let total = 0;
                    for (let i = 0; i < users.length; i++) {
                        total = methods.precisionRound(
                            parseFloat(total) +
                                parseFloat(users[i].Wallet.balance)
                        );
                    }
                    const userHaveBalance = users.filter((user) => {
                        if (parseFloat(user.Wallet.balance) > 0) {
                            return user;
                        }
                    });
                    const userFinal = userHaveBalance.slice(
                        step,
                        step + typeShow
                    );
                    const lenOfUserHaveBalance = userHaveBalance.length;
                    dataCode(res, {
                        users: userFinal,
                        total: total,
                        totalUser: lenOfUserHaveBalance
                    });
                }
            } else {
                const totalUser = User.find();
                const [users] = await Promise.all([totalUser]);
                if (users.length == 0) {
                    errCode2(res, `No Balance of user !!`);
                } else {
                    let total = 0;
                    for (let i = 0; i < users.length; i++) {
                        total = methods.precisionRound(
                            parseFloat(total) +
                                parseFloat(users[i].Wallet.balance)
                        );
                    }
                    const userHaveBalance = users
                        .filter((user) => {
                            if (parseFloat(user.Wallet.balance) > 0) {
                                return user;
                            }
                        })
                        .slice(0, typeShow);

                    const lenOfUserHaveBalance = userHaveBalance.length;
                    dataCode(res, {
                        users: userHaveBalance,
                        total: total,
                        totalUser: lenOfUserHaveBalance
                    });
                }
            }
        } catch (error) {
            errCode1(res, error);
        }
    }

    // [GET] /admin/getPaymentOfAdmin/:bank
    async getPaymentOfAdmin(req, res) {
        try {
            const { bank } = req.params;
            const paymentsGot = Payments.find({
                methodName: bank,
                type: 'admin'
            });
            const [payments] = await Promise.all([paymentsGot]);

            dataCode(res, payments);
        } catch (error) {
            errCode1(res, error);
        }
    }

    // [GET] /admin/getAllPaymentAdmin
    async getAllPaymentAdmin(req, res) {
        try {
            const paymentsGot = Payments.find({ type: 'admin' });
            const [payments] = await Promise.all([paymentsGot]);

            dataCode(res, payments);
        } catch (error) {
            errCode1(res, error);
        }
    }

    // [GET] /admin/getUSerFromWithdraw/:id
    async getUSerFromWithdraw(req, res) {
        try {
            const { id } = req.params;
            const lookUp = Withdraws.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(id)
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: 'payment.email',
                        as: 'info'
                    }
                },
                {
                    $lookup: {
                        from: 'payments',
                        localField: 'method.accountNumber',
                        foreignField: 'accountNumber',
                        as: 'payment'
                    }
                }
            ]);
            const [result] = await Promise.all([lookUp]);
            dataCode(res, result);
        } catch (error) {
            errCode1(res, error);
        }
    }

    // [GET] /admin/Commission
    async getCommission(req, res) {
        try {
            const commission = await Commission.findById(
                process.env.ID_COMMISSION
            );
            dataCode(res, commission);
        } catch (err) {
            errCode1(res, err);
        }
    }

    // [PUT] /admin/changeRates
    async changeRates(req, res) {
        const { rateDeposit, rateWithdraw } = req.body;
        try {
            const rateFindDepositWithdraw = await RateWithdrawDeposit.findOne(
                {}
            );
            rateFindDepositWithdraw.rateDeposit = rateDeposit;
            rateFindDepositWithdraw.rateWithdraw = rateWithdraw;
            rateFindDepositWithdraw
                .save()
                .then((result) => {
                    successCode(res, `Update successfully rates`);
                })
                .catch((err) => {
                    errCode1(res, err);
                });
        } catch (error) {
            errCode1(res, error);
        }
    }

    // [GET] /admin/getRates
    async getRates(req, res) {
        try {
            const rateFindDepositWithdraw = await RateWithdrawDeposit.findOne(
                {}
            );
            dataCode(res, rateFindDepositWithdraw);
        } catch (error) {
            errCode1(res, error);
        }
    }

    // [PUT] /admin/changeRoleUser/:id
    async change_role(req, res, next) {
        const { id } = req.params;
        const { rule } = req.body;
        try {
            const userFind = await User.findById(id);
            if (userFind) {
                userFind.payment.rule = rule;
                userFind
                    .save()
                    .then(() => {
                        successCode(
                            res,
                            `Change role of user: ${userFind.payment.rule} to ${rule} successfully`
                        );
                    })
                    .catch((err) => {
                        errCode1(res, err);
                    });
            } else {
                throw {
                    message: `User is not valid with id = ${id}`
                };
            }
        } catch (error) {
            errCode1(res, error);
        }
    }
}

module.exports = new AdminController();
