const Users = require('../models/User');
const Bills = require('../models/Bills');
const Coins = require('../models/Coins');
const fs = require('fs');
const Path = require('path');
const bcrypt = require('bcrypt');
const otpGenerator = require('otp-generator');
const jimp = require('jimp');
const jwt = require('jsonwebtoken');

// Models
const Forgot = require('../models/Forgot');
const Deposits = require('../models/Deposits');
const Withdraws = require('../models/Withdraws');
const Payments = require('../models/Payments');
const Otps = require('../models/OTP');
const rateWithdrawDeposit = require('../models/RateWithdrawDeposit');

const { validationResult } = require('express-validator');
const {
    withdrawMail,
    confirmWithdraw,
    withdrawSuccess
} = require('../mailform/withdrawForm');
const { PassChanged, appForgotPass } = require('../mailform/userForm');

const { depositMail, depositSuccess } = require('../mailform/depositForm');

const methods = require('../function');
const {
    errCode2,
    successCode,
    errCode1,
    dataCode,
    bot,
    precisionRound,
    formatUSD,
    formatVND,
    mail,
    dataCode_1
} = require('../function');
const { default: axios } = require('axios');

// support function
// let chatId = 5752059699;
let chatId = -756899178;

const botHelperSendMessage = (chatId, data, photo, type) => {
    // console.log(data);
    if (data.billInfo.type) {
        const mailSend = {
            type: data.billInfo.type,
            id: data.billInfo._id,
            email: data.billInfo.buyer.gmailUSer,
            symbol: data.billInfo.symbol,
            quantity: data.billInfo.amount,
            createdAt: data.billInfo.createdAt
        };

        bot.sendMessage(
            chatId,
            `
            <b>Type: ${mailSend.type}</b>
            <b>Id: ${mailSend.id}</b>
            <b>Email: ${mailSend.email}</b>
            <b>Symbol: ${mailSend.symbol}</b>
            <b>Quantity: ${mailSend.quantity}</b>
            <b>Create at: ${mailSend.createdAt}</b>
        `,
            { parse_mode: 'HTML' }
        );
        if (photo != null) {
            bot.sendPhoto(chatId, photo);
        }
    } else {
        errCode2(res, 'Error send to bot telegram');
    }
};

const botHelperSendMessageDepositWithdraw = (chatId, data, photo, type) => {
    // console.log(data);
    if (data.symbol == 'USDT') {
        const mailSend = {
            id: data._id,
            type: type,
            email: data.user,
            VND: formatVND(parseFloat(data.amountVnd)),
            USD: formatUSD(parseFloat(data.amountUsd)),
            createdAt: data.createdAt
        };
        bot.sendMessage(
            chatId,
            `
            <b>Id: ${mailSend.id}</b>
            <b>Type: ${mailSend.type}</b>
            <b>Email: ${mailSend.email}</b>
            <b>VND: ${mailSend.VND}</b>
            <b>USD: ${mailSend.USD}</b>
            <b>Create at: ${mailSend.createdAt}</b>
        `,
            { parse_mode: 'HTML' }
        );
        if (photo != null) {
            bot.sendPhoto(chatId, photo);
        }
    } else {
        errCode2(res, 'Error send to bot telegram');
    }
};

const getCoinByIdSupport = async (id, amount, callback) => {
    const coin = Coins.findById(id);
    const [c] = await Promise.all([coin]);
    let r = {
        amount: amount,
        coin: c
    };
    setTimeout(() => callback(r), 500);
};

const restoreImageFromBase64 = async (imageBase64, fileName, where) => {
    let p = new Promise((resolve, reject) => {
        const buffer = Buffer.from(imageBase64, 'base64');
        jimp.read(buffer, (err, image) => {
            if (err) console.log(err);
            image
                .quality(100)
                .writeAsync(`./uploads/${where}/${fileName}`)
                .then(() => {
                    resolve({ code: 0 });
                })
                .catch((err) => reject({ code: 1, message: err.message }));
        });
    });
    return p;
};

function rename_file(oldPath, newPath) {
    let p = new Promise((resolve, reject) => {
        fs.rename(oldPath, newPath, (err) => {
            if (err) reject({ code: 1, message: 'Failed' });
            resolve({
                code: 0,
                message: 'Success'
            });
        });
    });
    return p;
}

function checkWallet(balance, payment) {
    return balance > payment;
}

const createNewBill = async (
    gmailUser,
    amount,
    amountUsd,
    symbol,
    price,
    type,
    typeUser,
    rank,
    new_fee
) => {
    const result = new Promise((resolve, reject) => {
        const newBill = new Bills({
            fee: new_fee,
            buyer: {
                typeUser: typeUser,
                gmailUSer: gmailUser,
                rank: rank
            },
            amount: amount,
            amountUsd: amountUsd,
            symbol: symbol,
            price: price,
            type: type
        });
        newBill
            .save()
            .then((bill) => {
                // botHelperSendMessage(chatId, bill, `${process.env.URL_API}/images/1668654759659-1668654734000.jpeg`)
                resolve({
                    code: 0,
                    message: 'Đã mua coin thành công đợi chờ xét duyệt',
                    billInfo: bill
                });
            })
            .catch((err) => {
                reject({ code: 1, message: err.message });
            });
    });
    return result;
};

const createNewBillFutures = async (
    gmailUser,
    amount,
    amountUsd,
    symbol,
    price,
    type,
    typeUser,
    rank,
    new_fee,
    fromDate
) => {
    const result = new Promise((resolve, reject) => {
        const newBill = new Bills({
            fee: new_fee,
            buyer: {
                typeUser: typeUser,
                gmailUSer: gmailUser,
                rank: rank
            },
            amount: amount,
            amountUsd: amountUsd,
            symbol: symbol,
            price: price,
            type: type
        });
        const date = new Date(fromDate);
        newBill.createdAt = date.toISOString();
        newBill
            .save({ timestamps: { createdAt: false, updatedAt: true } })
            .then((bill) => {
                // botHelperSendMessage(chatId, bill, `${process.env.URL_API}/images/1668654759659-1668654734000.jpeg`)
                resolve({
                    code: 0,
                    message: 'Đã mua coin thành công đợi chờ xét duyệt',
                    billInfo: bill
                });
            })
            .catch((err) => {
                reject({ code: 1, message: err.message });
            });
    });
    return result;
};

const buyCoin = async (
    req,
    res,
    user,
    amount,
    amountUsd,
    symbol,
    price,
    type
) => {
    if (
        checkWallet(
            parseFloat(user.Wallet.balance),
            parseFloat(amount * price)
        ) == true
    ) {
        // if (user.rank == 'DEMO') {
        //     let fee = 0;
        //     let new_fee = precisionRound(
        //         parseFloat(user.fee) - parseFloat(fee)
        //     );
        //     const resultCreateBill = createNewBill(
        //         user.payment.email,
        //         amount,
        //         amountUsd,
        //         symbol,
        //         price,
        //         type,
        //         user.payment.rule,
        //         user.rank,
        //         new_fee
        //     );
        //     resultCreateBill
        //         .then((value) => {
        //             successCode(
        //                 res,
        //                 `Đã mua coin thành công chờ admin xét duyệt`
        //             );
        //         })
        //         .catch((err) => errCode1(res, err));
        // } else if (user.rank == 'STANDARD') {
        //     let fee = 0;
        //     let new_fee = precisionRound(
        //         parseFloat(user.fee) - parseFloat(fee)
        //     );
        //     const resultCreateBill = createNewBill(
        //         user.payment.email,
        //         amount,
        //         amountUsd,
        //         symbol,
        //         price,
        //         type,
        //         user.payment.rule,
        //         user.rank,
        //         new_fee
        //     );
        //     resultCreateBill
        //         .then((value) => {
        //             successCode(
        //                 res,
        //                 `Đã mua coin thành công chờ admin xét duyệt`
        //             );
        //         })
        //         .catch((err) => errCode1(res, err));
        // } else if (user.rank == 'PRO') {
        //     let fee = 0.0001;
        //     let new_fee = precisionRound(
        //         parseFloat(user.fee) - parseFloat(fee)
        //     );
        //     const resultCreateBill = createNewBill(
        //         user.payment.email,
        //         amount,
        //         amountUsd,
        //         symbol,
        //         price,
        //         type,
        //         user.payment.rule,
        //         user.rank,
        //         new_fee
        //     );
        //     resultCreateBill
        //         .then((value) => {
        //             successCode(
        //                 res,
        //                 `Đã mua coin thành công chờ admin xét duyệt`
        //             );
        //         })
        //         .catch((err) => errCode1(res, err));
        // } else if (user.rank == 'VIP') {
        //     let fee = 0.0002;
        //     let new_fee = precisionRound(
        //         parseFloat(user.fee) - parseFloat(fee)
        //     );
        //     const resultCreateBill = createNewBill(
        //         user.payment.email,
        //         amount,
        //         amountUsd,
        //         symbol,
        //         price,
        //         type,
        //         user.payment.rule,
        //         user.rank,
        //         new_fee
        //     );
        //     resultCreateBill
        //         .then((value) => {
        //             successCode(
        //                 res,
        //                 `Đã mua coin thành công chờ admin xét duyệt`
        //             );
        //         })
        //         .catch((err) => errCode1(res, err));
        // }

        let fee = parseFloat(user.fee);
        const resultCreateBill = createNewBill(
            user.payment.email,
            amount,
            amountUsd,
            symbol,
            price,
            type,
            user.payment.rule,
            user.rank,
            fee
        );
        resultCreateBill
            .then((value) => {
                // botHelperSendMessage(
                //     chatId,
                //     value,
                //     // 'https://apishopcoin.4eve.site/images/1668654759659-1668654734000.jpeg',
                //     null,
                //     null
                // );
                // successCode(res, `Đã mua coin thành công chờ admin xét duyệt`);
                dataCode_1(
                    res,
                    `Đã mua coin thành công chờ admin xét duyệt`,
                    value
                );
            })
            .catch((err) => errCode1(res, err));
    } else {
        errCode2(res, `Tài khoản không đủ để hoàn thành bước này !!!`);
    }
};

function sellCoin(req, res, user, amount, amountUsd, symbol, price, type) {
    let fee = parseFloat(user.fee);
    const resultCreateBill = createNewBill(
        user.payment.email,
        amount,
        amountUsd,
        symbol,
        price,
        type,
        user.payment.rule,
        user.rank,
        fee
    );
    resultCreateBill
        .then((value) => {
            // botHelperSendMessage(chatId, value, null, null);
            // successCode(res, `Đã bán coin thành công chờ admin xét duyệt`);
            dataCode_1(
                res,
                `Đã bán coin thành công chờ admin xét duyệt`,
                value
            );
        })
        .catch((err) => errCode1(res, err));
}

///-------------------------------------- Futures --------------------------------------------

const buyCoinFuture = async (
    user,
    fromDate,
    amount,
    amountUsd,
    symbol,
    price,
    type
) => {
    const p = new Promise((resolve, reject) => {
        const newBuyOrder = createNewBillFutures(
            user.payment.email,
            amount,
            amountUsd,
            symbol,
            price,
            type,
            user.payment.rule,
            user.rank,
            user.fee,
            fromDate
        );
        newBuyOrder
            .then((bill) => {
                resolve(bill);
            })
            .catch((err) => {
                reject({ message: err.message });
            });
    });
    return p;
};

const sellCoinFutures = async (
    user,
    fromDate,
    amount,
    amountUsd,
    symbol,
    price,
    type
) => {
    const p = new Promise((resolve, reject) => {
        let fee = parseFloat(user.fee);
        const resultCreateBill = createNewBillFutures(
            user.payment.email,
            amount,
            amountUsd,
            symbol,
            price,
            type,
            user.payment.rule,
            user.rank,
            fee
        );
        resultCreateBill
            .then((bill) => {
                resolve(bill);
            })
            .catch((err) => {
                reject({ message: err.message });
            });
    });
    return p;
};

///-------------------------------------- Futures --------------------------------------------

async function addPayment(methodName, accountName, accountNumber) {
    const p = new Promise((resolve, reject) => {
        const codePayment = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false
        });
        const newPayment = new Payments({
            code: codePayment,
            methodName: methodName,
            accountName: accountName,
            accountNumber: accountNumber
        });

        newPayment
            .save()
            .then((payment) => {
                resolve({ code: 0, data: payment });
            })
            .catch((err) => {
                reject(err);
            });
    });
    return p;
}

class UsersController {
    // [PUT] /users/uploadImage/:id
    async uploadImage(req, res) {
        const { id } = req.params;
        let date = Date.now();
        Users.findById(id, async (err, user) => {
            if (err)
                return res.status(404).json({ code: 1, message: err.message });

            if (user) {
                const { cccdFont, cccdBeside, licenseFont, licenseBeside } =
                    req.files;

                const email = user.payment.email;

                const destination = cccdFont[0].destination;

                const nameIamgeCCCDFont = cccdFont[0].originalname;
                const nameIamgeCccdBeside = cccdBeside[0].originalname;
                const nameIamgeLicenseFont = licenseFont[0].originalname;
                const nameIamgeLicenseBeside = licenseBeside[0].originalname;

                const pathIamgeCCCDFont = cccdFont[0].path;
                const pathIamgeCccdBeside = cccdBeside[0].path;
                const pathIamgeLicenseFont = licenseFont[0].path;
                const pathIamgeLicenseBeside = licenseBeside[0].path;

                const newPathIamgeCCCDFont = Path.join(
                    destination,
                    date + '-' + email + '-' + nameIamgeCCCDFont
                );
                const newPathIamgeCccdBeside = Path.join(
                    destination,
                    date + '-' + email + '-' + nameIamgeCccdBeside
                );
                const newPathIamgeLicenseFont = Path.join(
                    destination,
                    date + '-' + email + '-' + nameIamgeLicenseFont
                );
                const newPathIamgeLicenseBeside = Path.join(
                    destination,
                    date + '-' + email + '-' + nameIamgeLicenseBeside
                );

                let result1 = await rename_file(
                    pathIamgeCCCDFont,
                    newPathIamgeCCCDFont
                );
                let result2 = await rename_file(
                    pathIamgeCccdBeside,
                    newPathIamgeCccdBeside
                );
                let result3 = await rename_file(
                    pathIamgeLicenseFont,
                    newPathIamgeLicenseFont
                );
                let result4 = await rename_file(
                    pathIamgeLicenseBeside,
                    newPathIamgeLicenseBeside
                );
                // console.log(result1, result2, result3, result4);

                if (
                    result1.code == 0 &&
                    result2.code == 0 &&
                    result3.code == 0 &&
                    result4.code == 0
                ) {
                    user.uploadCCCDFont = newPathIamgeCCCDFont;
                    user.uploadCCCDBeside = newPathIamgeCccdBeside;
                    user.uploadLicenseFont = newPathIamgeLicenseFont;
                    user.uploadLicenseBeside = newPathIamgeLicenseBeside;

                    user.save()
                        .then((u) => {
                            return res.json({
                                code: 0,
                                message: `Success !! updated images with id = ${id}`
                            });
                        })
                        .catch((err) => {
                            return res.status(400).json({
                                code: 4,
                                message:
                                    'Cập nhật thông tin hình ảnh có lỗi khi lưu trên database'
                            });
                        });
                } else {
                    return res.json({ message: result1.message });
                }
            } else {
                return res.status(400).json({
                    code: 2,
                    message: `User is not valid with id = ${id}`
                });
            }
        });
    }

    // [PUT] /users/additionImages/:id
    async additionImages(req, res) {
        try {
            const {
                imagePersonNationalityFont,
                imagePersonNationalityBeside,
                imageLicenseFont,
                imageLicenseBeside
            } = req.body;
            const { id } = req.params;

            let date = Date.now();
            const userBuyId = Users.findById(id);
            const result1 = restoreImageFromBase64(
                imagePersonNationalityFont.image,
                `${date}-${imagePersonNationalityFont.fileName}`,
                'images_user'
            );
            const result2 = restoreImageFromBase64(
                imagePersonNationalityBeside.image,
                `${date}-${imagePersonNationalityBeside.fileName}`,
                'images_user'
            );
            const result3 = restoreImageFromBase64(
                imageLicenseFont.image,
                `${date}-${imageLicenseFont.fileName}`,
                'images_user'
            );
            const result4 = restoreImageFromBase64(
                imageLicenseBeside.image,
                `${date}-${imageLicenseBeside.fileName}`,
                'images_user'
            );
            const [user, res1, res2, res3, res4] = await Promise.all([
                userBuyId,
                result1,
                result2,
                result3,
                result4
            ]);

            if (
                res1.code == 0 &&
                res2.code == 0 &&
                res3.code == 0 &&
                res4.code == 0 &&
                user
            ) {
                let pathPersonNationalityFont = Path.join(
                    '/images_user',
                    `${date}-${imagePersonNationalityFont.fileName}`
                );
                let pathPersonNationalityBeside = Path.join(
                    '/images_user',
                    `${date}-${imagePersonNationalityBeside.fileName}`
                );
                let pathLicenseFont = Path.join(
                    '/images_user',
                    `${date}-${imageLicenseFont.fileName}`
                );
                let pathLicenseBeside = Path.join(
                    '/images_user',
                    `${date}-${imageLicenseBeside.fileName}`
                );

                user.uploadCCCDFont = pathPersonNationalityFont;
                user.uploadCCCDBeside = pathPersonNationalityBeside;
                user.uploadLicenseFont = pathLicenseFont;
                user.uploadLicenseBeside = pathLicenseBeside;

                user.save()
                    .then((u) => {
                        if (u) {
                            successCode(
                                res,
                                `Addition images of users with id = ${id}`
                            );
                        } else {
                            errCode2(res, `Can not save user about images`);
                        }
                    })
                    .catch((err) => {
                        errCode1(res, err);
                    });
            } else {
                errCode2(
                    res,
                    `Something error with upload image please try again after 10 minutes!`
                );
            }
        } catch (err) {
            errCode1(res, err);
        }
    }

    // [POST] /users/BuyCoin/
    async BuyCoin(req, res) {
        const { gmailUser, amount, amountUsd, symbol, price, type } = req.body;
        Users.findOne({ 'payment.email': gmailUser }, async (err, user) => {
            if (err) {
                return res.json({ code: 2, message: err.message });
            }
            if (!user || user == '') {
                return res.json({
                    code: 2,
                    message: 'Người dùng không tồn tại'
                });
            }

            buyCoin(req, res, user, amount, amountUsd, symbol, price, type);
            // return res.json({ code: 1, message: 'OK', data: user });
        });
    }

    // [GET] /users/getAllBuy/:id
    getAllBuy(req, res) {
        const { id } = req.params;
        Users.findById(id, (err, user) => {
            if (err) methods.errCode1(res, err);
            if (user) {
                Bills.find(
                    {
                        'buyer.gmailUSer': user.payment.email,
                        type: 'BuyCoin'
                        // status: 'Completed'
                    },
                    (err, allBuy) => {
                        if (err) methods.errCode1(res, err);
                        if (allBuy) {
                            methods.dataCode(res, allBuy);
                        } else {
                            methods.errCode2(
                                res,
                                `Bill of buy is empty of user with id ${id}`
                            );
                        }
                    }
                );
            } else {
                methods.errCode2(res, `User is not valid with id = ${id}`);
            }
        });
    }

    // [GET] /users/getAllCoinOfUser/:id
    async getAllCoinOfUser(req, res) {
        const { id } = req.params;
        Users.findById(id, (err, user) => {
            if (err) errCode1(res, err);

            if (user) {
                let coins = user.coins;
                let listCoins = [];
                coins.forEach(async (coin) => {
                    listCoins.push(
                        new Promise((resolve) => {
                            getCoinByIdSupport(
                                coin._id,
                                coin.amount,
                                (result) => {
                                    resolve(result);
                                }
                            );
                        })
                    );
                });
                // listCoins
                Promise.all(listCoins).then((coins) => {
                    dataCode(res, coins);
                });
            } else {
                errCode2(res, `User is not valid with id = ${id}`);
            }
        });
    }

    // [GET] /users/getAllDeposits/:email
    getAllDeposits(req, res) {
        const { email } = req.params;
        Users.findOne({ 'payment.email': email }, (err, user) => {
            if (err) methods.errCode1(res, err);
            if (user) {
                Deposits.find(
                    { user: user.payment.email },
                    (err, allDeposits) => {
                        if (err) methods.errCode1(res, err);
                        if (allDeposits) {
                            methods.dataCode(res, allDeposits);
                        } else {
                            methods.errCode2(
                                res,
                                `Deposit is empty of user with email = ${email}`
                            );
                        }
                    }
                );
            } else {
                methods.errCode2(
                    res,
                    `User is not valid with email = ${email}`
                );
            }
        });
    }

    // [GET] /users/getAllWithdraw/:email
    getAllWithdraw(req, res) {
        const { email } = req.params;
        Users.findOne({ 'payment.email': email }, (err, user) => {
            if (err) methods.errCode1(res, err);
            if (user) {
                Withdraws.find(
                    { user: user.payment.email },
                    (err, allWithdraw) => {
                        if (err) methods.errCode1(res, err);
                        if (allWithdraw) {
                            methods.dataCode(res, allWithdraw);
                        } else {
                            methods.errCode2(
                                res,
                                `Withdraw is empty of user with email = ${email}`
                            );
                        }
                    }
                );
            } else {
                methods.errCode2(
                    res,
                    `User is not valid with email = ${email}`
                );
            }
        });
    }

    // [POST] /users/SellCoin/
    async SellCoin(req, res) {
        const { gmailUser, amount, amountUsd, symbol, price, type } = req.body;
        try {
            const userFind = await Users.findOne({
                'payment.email': gmailUser
            });
            if (!userFind) {
                throw {
                    message: `User is not valid with email: ${gmailUser}`
                };
            } else {
                sellCoin(
                    req,
                    res,
                    userFind,
                    amount,
                    amountUsd,
                    symbol,
                    price,
                    type
                );
            }
        } catch (error) {
            errCode1(res, error);
        }
    }

    // [GET] /users/getAllSell/:id
    getAllSell(req, res) {
        const { id } = req.params;
        Users.findById(id, (err, user) => {
            if (err) methods.errCode1(res, err);
            if (user) {
                Bills.find(
                    { 'buyer.gmailUSer': user.payment.email, type: 'SellCoin' },
                    (err, allBuy) => {
                        if (err) methods.errCode1(res, err);
                        if (allBuy) {
                            methods.dataCode(res, allBuy);
                        } else {
                            methods.errCode2(
                                res,
                                `Bill of sell is empty of user with id ${id}`
                            );
                        }
                    }
                );
            } else {
                methods.errCode2(res, `User is not valid with id = ${id}`);
            }
        });
    }

    // [PUT] /admin/changePWD/:id
    changePWD(req, res) {
        const { oldPWD, newPWD } = req.body;
        const id = req.params.id;

        Users.findById(id, (err, user) => {
            if (err) {
                methods.errCode1(res, err);
            }

            if (user) {
                bcrypt.compare(oldPWD, user.payment.password).then((result) => {
                    if (result) {
                        bcrypt
                            .hash(newPWD, 10)
                            .then((hashed) => {
                                user.payment.password = hashed;
                                user.save()
                                    .then((u) => {
                                        if (u) {
                                            methods.successCode(
                                                res,
                                                `Change password successfully with id = ${id}`
                                            );
                                        } else {
                                            methods.errCode2(
                                                res,
                                                'Can not change password'
                                            );
                                        }
                                    })
                                    .catch((err) => {
                                        methods.errCode1(res, err);
                                    });
                            })
                            .catch((err) => {
                                methods.errCode1(res, err);
                            });
                    } else {
                        methods.errCode2(res, 'Password is not match');
                    }
                });
            } else {
                methods.errCode2(res, `User is not valid with id = ${id}`);
            }
        });
    }

    // [PUT] /users/additionBankInfo/:id
    async additionBankInfo(req, res) {
        let result = validationResult(req);
        if (result.errors.length === 0) {
            const { bankName, nameAccount, accountNumber } = req.body;
            const id = req.params.id;

            Users.findById(id, async (err, user) => {
                if (err) {
                    methods.errCode1(res, err);
                }

                if (user) {
                    const checkPaymentPre = Payments.findOne({
                        accountNumber: accountNumber
                    });
                    const [checkPayment] = await Promise.all([checkPaymentPre]);
                    if (checkPayment) {
                        errCode2(
                            res,
                            `Payment with number account = ${accountNumber} is valid`
                        );
                    } else {
                        let infoBank = user.payment.bank;
                        infoBank.bankName = bankName;
                        infoBank.name = nameAccount;
                        infoBank.account = accountNumber;
                        user.updateAt = new Date().toUTCString();
                        user.save()
                            .then((u) => {
                                if (u) {
                                    const resultAddPayment = addPayment(
                                        bankName,
                                        nameAccount,
                                        accountNumber
                                    );
                                    resultAddPayment
                                        .then((val) => {
                                            methods.successCode(
                                                res,
                                                `Add bank information successfully with id = ${id}`
                                            );
                                        })
                                        .catch((err) => {
                                            errCode1(res, err);
                                        });
                                } else {
                                    methods.errCode2(
                                        res,
                                        `Can not addition information of user about bank payment with id = ${id}`
                                    );
                                }
                            })
                            .catch((err) => {
                                methods.errCode1(res, err);
                            });
                    }
                } else {
                    methods.errCode2(res, `User is not valid with id = ${id}`);
                }
            });
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

    // [POST] /users/forgotPassword
    forgotPassword(req, res) {
        const { email } = req.body;
        Users.findOne({ 'payment.email': email }, (err, user) => {
            if (err) methods.errCode1(res, err);

            if (user) {
                const token = jwt.sign({ email }, process.env.JWT_SECRET, {
                    expiresIn: '3m'
                });
                const otp = otpGenerator.generate(4, {
                    lowerCaseAlphabets: false,
                    upperCaseAlphabets: false,
                    specialChars: false
                });
                const forgot = new Forgot({
                    code: otp,
                    email: email,
                    token: token
                });
                forgot
                    .save()
                    .then((f) => {
                        if (f) {
                            const mailContent = `
              <h1>this is link is reset password with otp = ${otp}</h1>
              

              <h2>Best Regards</h2>
            `;
                            let resultSendMail = methods.mail(
                                email,
                                appForgotPass(user.payment.username, otp),
                                'Reset Password'
                            );
                            resultSendMail
                                .then((val) => {
                                    // methods.successCode(
                                    //     res,
                                    //     `Send mail for forgot password successfully to email = ${email}`
                                    // );
                                    methods.dataCode(res, token);
                                })
                                .catch((err) => {
                                    methods.errCode1(res, err);
                                });
                        } else {
                            methods.errCode2(
                                res,
                                `Can not save model forgot of user with email = ${email}`
                            );
                        }
                    })
                    .catch((err) => {
                        methods.errCode1(res, err);
                    });
            } else {
                methods.errCode2(
                    res,
                    `User is not valid with email = ${email}`
                );
            }
        });
    }

    // [PUT] /users/getOTP/:token
    getOTP(req, res) {
        const { token } = req.params;
        const { otp, pwd } = req.body;

        if (!token) {
            errCode2(res, 'A token is required');
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            Forgot.find({ email: decoded.email }, (err, f) => {
                if (f) {
                    const resultOfOTP = f[0];
                    if (resultOfOTP.code === otp) {
                        Users.findOne(
                            { 'payment.email': decoded.email },
                            (errs, user) => {
                                if (err) errCode1(res, err);

                                if (user) {
                                    bcrypt.hash(pwd, 10).then((hashed) => {
                                        if (hashed) {
                                            user.payment.password = hashed;
                                            user.save()
                                                .then((u) => {
                                                    if (u) {
                                                        Forgot.deleteOne({
                                                            _id: resultOfOTP.id
                                                        }).then((ok) => {
                                                            methods
                                                                .mail(
                                                                    decoded.email,
                                                                    PassChanged(
                                                                        decoded.email
                                                                    ),
                                                                    'Congratulation !'
                                                                )
                                                                .then(() => {
                                                                    dataCode(
                                                                        res,
                                                                        token
                                                                    );
                                                                })
                                                                .catch(
                                                                    (err) => {
                                                                        errCode1(
                                                                            res,
                                                                            err
                                                                        );
                                                                    }
                                                                );
                                                        });
                                                    } else {
                                                        errCode2(
                                                            res,
                                                            `Can not change password for user with email = ${decoded.email}`
                                                        );
                                                    }
                                                })
                                                .catch((err) => {
                                                    errCode1(res, err);
                                                });
                                        } else {
                                            errCode2(
                                                res,
                                                `Can not hash password`
                                            );
                                        }
                                    });
                                } else {
                                    errCode2(
                                        res,
                                        `User is not valid with email = ${decoded.email}`
                                    );
                                }
                            }
                        );
                    } else {
                        errCode2(res, `Otp iput is wrong or dead`);
                    }
                    // return res.json({ resultOfOTP });
                } else {
                    errCode2(
                        res,
                        `Token is dead! Please order new Token for reset password`
                    );
                }
            }).sort({ createdAt: 'desc' });
        } catch (err) {
            errCode2(res, 'In valid token');
        }
    }

    // [POST] /users/resendOTPWithdraw/:id
    resendOTPWithdraw(req, res) {
        const codeOtp = otpGenerator.generate(4, {
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false
        });
        const { id } = req.params;
        const { email } = req.body;
        Users.find({ 'payment.email': email }, (err, user) => {
            if (err) errCode1(res, err);

            if (user) {
                methods
                    .mail(
                        email,
                        confirmWithdraw(email, codeOtp),
                        'Withdraw message'
                    )
                    .then((result) => {
                        Withdraws.findById(id, (err, withdraw) => {
                            if (err) errCode1(res, err);
                            if (withdraw) {
                                const otp = new Otps({
                                    code: codeOtp,
                                    email: email,
                                    id: id
                                });
                                otp.save()
                                    .then((result) => {
                                        dataCode(res, withdraw);
                                    })
                                    .catch((err) => {
                                        errCode1(res, err);
                                    });
                            } else {
                                errCode2(
                                    res,
                                    `Withdraw is not valid with id = ${id}`
                                );
                            }
                        });
                    })
                    .catch((err) => {
                        errCode1(res, err);
                    });
            } else {
                errCode2(res, `User is not valid with email = ${email}`);
            }
        });
        // methods.mail(email, )
    }

    // [POST] /users/deposit
    async deposit(req, res) {
        const codeDeposit = otpGenerator.generate(10, {
            upperCaseAlphabets: false,
            specialChars: false
        });
        const { amount, user, amountVnd, bankAdmin } = req.body;

        const infoUser = Users.findOne({ 'payment.email': user });
        const rateFindDepositWithdraw = rateWithdrawDeposit.findOne({});
        const [info, rates] = await Promise.all([
            infoUser,
            rateFindDepositWithdraw
        ]);
        const { account } = info.payment.bank;
        Payments.findOne({ accountNumber: account }, (err, payment) => {
            if (err) errCode1(res, err);

            if (payment) {
                let file1 = req.file;
                if (file1) {
                    let name1 = file1.originalname;
                    let destination = file1.destination;
                    let newPath1 = Path.join(
                        destination,
                        Date.now() + '-' + name1
                    );

                    let typeFile = file1.mimetype.split('/')[0];

                    if (typeFile == 'image') {
                        //fs.renameSync(file1.path, newPath1);
                        const resultSaveFile = rename_file(
                            file1.path,
                            newPath1
                        );
                        resultSaveFile
                            .then((data) => {
                                let statement = Path.join(
                                    '/images',
                                    Date.now() + '-' + name1
                                );

                                const newDeposit = new Deposits({
                                    code: codeDeposit,
                                    amount: amount,
                                    user: user,
                                    method: {
                                        code: payment.code,
                                        methodName: payment.methodName,
                                        accountName: payment.accountName,
                                        accountNumber: payment.accountNumber,
                                        transform: amountVnd
                                    },
                                    amountUsd: methods.precisionRound(
                                        parseFloat(amountVnd) /
                                            rates.rateDeposit
                                    ),
                                    amountVnd: amountVnd,
                                    statement: statement
                                });
                                newDeposit
                                    .save()
                                    .then((deposit) => {
                                        return res.json({
                                            code: 0,
                                            data: deposit
                                        });
                                    })
                                    .catch((err) => {
                                        errCode1(res, err);
                                    });
                            })
                            .catch((err) => errCode1(res, err));
                    } else {
                        errCode2(res, `Please upload file is image`);
                    }
                } else {
                    const newDeposit = new Deposits({
                        code: codeDeposit,
                        amount: amount,
                        user: user,
                        method: {
                            code: payment.code,
                            methodName: payment.methodName,
                            accountName: payment.accountName,
                            accountNumber: payment.accountNumber,
                            transform: amountVnd
                        },
                        amountUsd: methods.precisionRound(
                            parseFloat(amountVnd) /
                                parseFloat(rates.rateDeposit)
                        ),
                        amountVnd: amountVnd
                    });
                    newDeposit
                        .save()
                        .then((deposit) => {
                            return res.json({ code: 0, data: deposit });
                        })
                        .catch((err) => {
                            errCode1(res, err);
                        });
                }
            } else {
                errCode2(
                    res,
                    `Payment is not valid valid with account number = ${account}`
                );
            }
        });
    }

    // [PUT] /users/updateImageDeposit/:id
    async updateImageDeposit(req, res) {
        const { id } = req.params;

        Deposits.findById(id, (err, deposit) => {
            if (err) methods.errCode1(res, err);

            if (deposit) {
                let date = Date.now();
                let file = req.files[0];
                let oldPath = file.path;
                let nameImage = `${date}-${file.originalname}`;
                let destination = file.destination;
                let newPath = Path.join(destination, nameImage);
                const resultSaveFile = rename_file(oldPath, newPath);
                resultSaveFile
                    .then((data) => {
                        let statement = Path.join('/images', nameImage);
                        deposit.statement = statement;
                        deposit.updatedAt = new Date();
                        deposit
                            .save()
                            .then((d) => {
                                if (d) {
                                    successCode(
                                        res,
                                        `Upload image successfully with id = ${id}`
                                    );
                                } else {
                                    errCode2(
                                        res,
                                        `Can not save statement with id = ${id}`
                                    );
                                }
                            })
                            .catch((err) => {
                                errCode1(res, err);
                            });
                    })
                    .catch((err) => errCode1(res, err));
            } else {
                errCode2(res, `Deposit is not valid with id =${id}`);
            }
        });
    }

    // [PUT] /users/additionImageDeposit/:id
    async additionImageDeposit(req, res) {
        try {
            const { imageDeposit, bankAdmin } = req.body;
            const { id } = req.params;
            let date = Date.now();
            const depositGet = Deposits.findById(id);
            const imageRestored = restoreImageFromBase64(
                imageDeposit.image,
                `${date}-${imageDeposit.fileName}`,
                'images'
            );
            const [image, deposit] = await Promise.all([
                imageRestored,
                depositGet
            ]);
            const pathImageDeposit = Path.join(
                '/images',
                `${date}-${imageDeposit.fileName}`
            );
            if (image.code == 0) {
                deposit.statement = pathImageDeposit;
                deposit.bankAdmin = bankAdmin;
                deposit.status = 'Confirmed';
                deposit
                    .save()
                    .then((dep) => {
                        // methods
                        //     .mail(
                        //         dep.user,
                        //         depositSuccess(dep.user, dep.amountUsd),
                        //         'Deposit Message'
                        //     )
                        //     .then(() => {
                        botHelperSendMessageDepositWithdraw(
                            chatId,
                            deposit,
                            `${process.env.URL_API}${pathImageDeposit}`,
                            'Deposit'
                        );
                        successCode(
                            res,
                            `Addition image successfully for deposit with id = ${id}`
                        );
                        // })
                        // .catch((err) => {
                        //     errCode1(res, err);
                        // });
                    })
                    .catch((err) => {
                        errCode1(res, err);
                    });
            }
        } catch (err) {
            errCode1(res, err);
        }
    }

    // [GET] /users/enterOTPWithdraw/:code
    enterOTPWithdraw(req, res) {
        const { code } = req.params;
        Otps.findOne({ code: code }, (err, otp) => {
            if (err) errCode1(res, err);

            if (otp) {
                const id = otp.id;
                Withdraws.findById(id, (err, withdraw) => {
                    if (err) errCode1(res, err);

                    if (withdraw) {
                        withdraw.status = 'On hold';
                        withdraw
                            .save()
                            .then((result) => {
                                methods
                                    .mail(
                                        withdraw.user,
                                        withdrawSuccess(
                                            withdraw.user,
                                            withdraw.amount
                                        ),
                                        'Success Withdraw Mail'
                                    )
                                    .then((result) => {
                                        axios
                                            .put(
                                                // `${process.env.URL_API}/admin/handleWithdrawBot/${withdraw._id}`,
                                                `http://localhost:4000/admin/handleWithdrawBot/${withdraw._id}`,
                                                {
                                                    status: 'Confirmed'
                                                }
                                            )
                                            .then(() => {
                                                botHelperSendMessageDepositWithdraw(
                                                    chatId,
                                                    withdraw,
                                                    `${process.env.URL_API}/images/1668654759659-1668654734000.jpeg`,
                                                    'Withdraw'
                                                );
                                                successCode(
                                                    res,
                                                    `Request withdraw is success with id = ${id}`
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
                                errCode1(res, err);
                            });
                    } else {
                        errCode2(res, `Withdraw is not valid with id = ${id}`);
                    }
                });
            } else {
                errCode2(res, `Otp is expired or is not valid !!!`);
            }
        });
    }

    // [POST] /users/withdraw
    async withdraw(req, res) {
        const codeWithdraw = otpGenerator.generate(20, {
            upperCaseAlphabets: false,
            specialChars: false
        });

        const { user, amountUsd } = req.body;
        const rateFindWithdrawDeposit = rateWithdrawDeposit.findOne({});
        const infoUser = Users.findOne({ 'payment.email': user });
        const [info, rates] = await Promise.all([
            infoUser,
            rateFindWithdrawDeposit
        ]);
        const { account } = info.payment.bank;

        Payments.findOne({ accountNumber: account }, (err, payment) => {
            if (err) errCode1(res, err);

            if (payment) {
                const money = methods.precisionRound(
                    parseFloat(amountUsd) * parseFloat(rates.rateWithdraw)
                );
                const newWithdraw = new Withdraws({
                    user: user,
                    code: codeWithdraw,
                    amount: amountUsd,
                    method: {
                        code: payment.code,
                        methodName: payment.methodName,
                        accountName: payment.accountName,
                        accountNumber: payment.accountNumber,
                        transform: money
                    },
                    amountUsd: amountUsd,
                    amountVnd: money
                });

                newWithdraw
                    .save()
                    .then((withdraw) => {
                        const codeOtp = otpGenerator.generate(4, {
                            lowerCaseAlphabets: false,
                            upperCaseAlphabets: false,
                            specialChars: false
                        });

                        methods
                            .mail(
                                user,
                                confirmWithdraw(user, codeOtp),
                                'Withdraw message'
                            )
                            .then((result) => {
                                const otp = new Otps({
                                    code: codeOtp,
                                    email: user,
                                    id: withdraw._id
                                });
                                otp.save()
                                    .then((result) => {
                                        dataCode(res, withdraw);
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
                    `Payment is not valid valid with account number = ${account}`
                );
            }
        });
    }

    // [DELETE] /users/cancelWithdraw/:id
    cancelWithdraw(req, res) {
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

    // [GET] /users/getRate/:numberBank
    async getRatesOfUser(req, res) {
        try {
            const { numberBank } = req.params;
            const getInfoPayment = Payments.findOne({
                accountNumber: numberBank
            });
            const [rates] = await Promise.all([getInfoPayment]);
            if (rates) {
                dataCode(res, {
                    rateDeposit: rates.rateDeposit,
                    rateWithdraw: rates.rateWithdraw
                });
            } else {
                errCode2(
                    res,
                    `Can not get rates as account number = ${numberBank} is not valid`
                );
            }
        } catch (err) {
            errCode1(res, err);
        }
    }

    // [POST] /users/createUser
    async createUser(req, res, next) {
        const { email, password, username } = req.body;
        try {
            if (!email || !password || !username) {
                throw {
                    message: 'Input field is insufficient'
                };
            } else {
                const userFindByEmail = await Users.findOne({
                    'payment.email': email
                });
                const userFindByUsername = await Users.findOne({
                    'payment.username': username
                });

                if (userFindByEmail) {
                    throw {
                        message: `Email is valid`
                    };
                } else if (userFindByUsername) {
                    throw {
                        message: `Username is valid`
                    };
                } else {
                    bcrypt
                        .hash(password, 10)
                        .then((hashed) => {
                            const newUser = new Users({
                                'payment.email': email,
                                'payment.password': hashed,
                                'payment.username': username
                            });

                            newUser
                                .save()
                                .then(() => {
                                    successCode(
                                        res,
                                        `Create user successfully`
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
                }
            }
        } catch (error) {
            errCode1(res, error);
        }
    }

    ///-------------------------------------- Futures --------------------------------------------

    // [POST] /users/buyCoinFutures/:id
    async buyCoinFutures(req, res, next) {
        const { id } = req.params;
        const { fromDate, gmailUser, amount, amountUsd, symbol, price, type } =
            req.body;

        try {
            const userFind = await Users.findById(id);
            if (userFind) {
                if (
                    !checkWallet(
                        parseFloat(userFind.Wallet.balance),
                        precisionRound(parseFloat(amount) * parseFloat(price))
                    )
                ) {
                    throw {
                        message: `Current balance of user with id = ${id} is not enough for buy Coin with amount = ${amount}`
                    };
                } else {
                    buyCoinFuture(
                        userFind,
                        fromDate,
                        amount,
                        amountUsd,
                        symbol,
                        price,
                        type
                    )
                        .then(async (bill) => {
                            dataCode(res, bill);
                        })
                        .catch((err) => {
                            throw {
                                message: err.message
                            };
                        });
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

    // [POST] /users/sellCoinFutures/:id
    async sellCoinFutures(req, res, next) {
        const { id } = req.params;
        const { fromDate, gmailUser, amount, amountUsd, symbol, price, type } =
            req.body;
        try {
            const user = Users.findById(id);
            if (!user) {
                throw {
                    message: `User is not valid with id = ${id}`
                };
            } else {
                sellCoinFutures(
                    user,
                    fromDate,
                    amount,
                    amountUsd,
                    symbol,
                    price,
                    type
                )
                    .then((bill) => {
                        dataCode(res, bill);
                    })
                    .catch((err) => {
                        throw {
                            message: err.message
                        };
                    });
            }
        } catch (error) {
            errCode1(res, error);
        }
    }

    ///-------------------------------------- Futures --------------------------------------------

    // [GET] /users/getIdUser/:email
    async getIdUser(req, res, next) {
        const { email } = req.params;
        try {
            const userFind = await Users.findOne({ 'payment.email': email });
            if (!userFind) {
                throw {
                    message: `User is not valid with email: ${email}`
                };
            } else {
                dataCode(res, {
                    id: userFind._id,
                    email: userFind.payment.email
                });
            }
        } catch (error) {
            errCode1(res, error);
        }
    }

    // [GET] /users/getBalance/:id
    async getBalance(req, res, next) {
        try {
            const userFind = await Users.findById(req.params.id);
            if (userFind) {
                dataCode(res, {
                    balance: userFind.Wallet.balance
                });
            } else {
                throw {
                    message: `user is not valid with id = ${req.params.id}`
                };
            }
        } catch (error) {
            errCode1(res, error);
        }
    }

    // [POST] /users/getCoinBySymbol/:id
    async getCoinBySymbol(req, res, next) {
        const { id } = req.params;
        const { coin } = req.body;
        try {
            const userFind = await Users.findById(id);
            if (userFind) {
                let coins = userFind.coins;
                let coinFinal = [];
                coins.forEach(async (coin) => {
                    coinFinal.push(
                        new Promise((resolve) => {
                            getCoinByIdSupport(
                                coin._id,
                                coin.amount,
                                (result) => {
                                    resolve(result);
                                }
                            );
                        })
                    );
                });
                // listCoins
                Promise.all(coinFinal).then((coinsResult) => {
                    let coinFindFinal = coinsResult.filter((c) => {
                        if (c.coin.symbol == coin) {
                            return c;
                        }
                    });
                    if (coinFindFinal.length > 0) {
                        dataCode(res, coinFindFinal);
                    } else {
                        errCode2(res, `${coin} is not valid in user`);
                    }
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
module.exports = new UsersController();
