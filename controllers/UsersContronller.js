const Users = require('../models/User');
const Bills = require('../models/Bills');
const Coins = require('../models/Coins');
const fs = require('fs');
const Path = require('path');
const bcrypt = require('bcrypt');
const otpGenerator = require('otp-generator');
const Forgot = require('../models/Forgot');
const jwt = require('jsonwebtoken');
const Deposits = require('../models/Deposits');
const Withdraws = require('../models/Withdraws');
const Payments = require('../models/Payments');
const Otps = require('../models/OTP');

const { validationResult } = require('express-validator');
const {
    withdrawMail,
    confirmWithdraw,
    withdrawSuccess
} = require('../mailform/withdrawForm');

const methods = require('../function');
const { resolve } = require('path');
const { errCode2, successCode, errCode1, dataCode } = require('../function');

// support function

const getCoinByIdSupport = async (id, amount, callback) => {
    const coin = Coins.findById(id);
    const [c] = await Promise.all([coin]);
    let r = {
        amount: amount,
        coin: c
    };
    setTimeout(() => callback(r), 500);
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

function buyCoin(
    req,
    res,
    fee,
    gmailUser,
    amount,
    amountUsd,
    symbol,
    price,
    type,
    typeUser,
    rank,
    coins,
    user
) {
    const balance = user.Wallet.balance;

    if (checkWallet(balance, amount * price)) {
        let new_fee = 0;
        let fee_rank = 0;

        if (rank == 'Demo') {
            fee_rank = 0;
            new_fee = methods.precisionRound(
                parseFloat(fee) - parseFloat(fee_rank)
            );
        } else if (rank == 'Standard') {
            fee_rank = 0;
            new_fee = methods.precisionRound(
                parseFloat(fee) - parseFloat(fee_rank)
            );
        } else if (rank == 'Pro') {
            fee_rank = 0.01;
            new_fee = methods.precisionRound(
                parseFloat(fee) - parseFloat(fee_rank)
            );
        } else if (rank == 'VIP') {
            // for rank VIP
            fee_rank = 0.02;
            new_fee = methods.precisionRound(
                parseFloat(fee) - parseFloat(fee_rank)
            );
        }
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
                return res.json({
                    code: 0,
                    message: 'Đã mua coin thành công đợi chờ xét duyệt',
                    billInfo: bill
                });
            })
            .catch((err) => {
                return res.json({ code: 1, message: err.message });
            });
    } else {
        return res.json({
            code: 3,
            message:
                'Số tiền trong tài khoản của bạn hiện tại không đủ để thực hiện việc mua coin, vui lòng nạp thêm vào !!!'
        });
    }
}

function sellCoin(
    req,
    res,
    fee,
    gmailUser,
    amount,
    amountUsd,
    symbol,
    price,
    type,
    typeUser,
    rank,
    coins,
    user
) {
    const balance = user.Wallet.balance;

    let new_fee = 0;
    let fee_rank = 0;

    if (rank == 'Demo') {
        fee_rank = 0;
        new_fee = methods.precisionRound(
            parseFloat(fee) - parseFloat(fee_rank)
        );
    } else if (rank == 'Standard') {
        fee_rank = 0;
        new_fee = methods.precisionRound(
            parseFloat(fee) - parseFloat(fee_rank)
        );
    } else if (rank == 'Pro') {
        fee_rank = 0.01;
        new_fee = methods.precisionRound(
            parseFloat(fee) - parseFloat(fee_rank)
        );
    } else if (rank == 'VIP') {
        // for rank VIP
        fee_rank = 0.02;
        new_fee = methods.precisionRound(
            parseFloat(fee) - parseFloat(fee_rank)
        );
    }

    const newBill = new Bills({
        fee: new_fee,
        buyer: {
            gmailUSer: gmailUser
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
            return res.json({ code: 0, infoBill: bill });
        })
        .catch((err) => {
            return res.json({ code: 1, message: err.message });
        });
}

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

    // [POST] /users/BuyCoin/
    BuyCoin(req, res) {
        const { gmailUser, amount, amountUsd, symbol, price, type } = req.body;
        Users.findOne({ 'payment.email': gmailUser }, (err, user) => {
            if (err) {
                return res.json({ code: 2, message: err.message });
            }
            if (!user || user == '') {
                return res.json({
                    code: 2,
                    message: 'Người dùng không tồn tại'
                });
            }

            // return res.json({code: 1, message: "OK", data: user})
            const typeUser = user.payment.rule,
                rank = user.rank,
                coins = user.coins,
                fee = user.fee;

            buyCoin(
                req,
                res,
                fee,
                gmailUser,
                amount,
                amountUsd,
                symbol,
                price,
                type,
                typeUser,
                rank,
                coins,
                user
            );
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
                        type: 'BuyCoin',
                        status: 'Confirmed'
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
    SellCoin(req, res) {
        const { gmailUser, amount, amountUsd, symbol, price, type } = req.body;
        Users.findOne({ 'payment.email': gmailUser }, (err, user) => {
            if (err) {
                return res.json({ code: 2, message: err.message });
            }
            if (!user || user == '') {
                return res.json({
                    code: 2,
                    message: 'Người dùng không tồn tại'
                });
            }

            // return res.json({code: 1, message: "OK", data: user})
            const typeUser = user.payment.rule,
                rank = user.rank,
                coins = user.coins,
                fee = user.fee;

            sellCoin(
                req,
                res,
                fee,
                gmailUser,
                amount,
                amountUsd,
                symbol,
                price,
                type,
                typeUser,
                rank,
                coins,
                user
            );
        });
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
    additionBankInfo(req, res) {
        let result = validationResult(req);
        if (result.errors.length === 0) {
            const { bankName, nameAccount, accountNumber } = req.body;
            const id = req.params.id;

            Users.findById(id, (err, user) => {
                if (err) {
                    methods.errCode1(res, err);
                }

                if (user) {
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
                                mailContent,
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
                                                            dataCode(
                                                                res,
                                                                token
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
        const { amount, user, amountVnd } = req.body;

        const infoUser = Users.findOne({ 'payment.email': user });
        const [info] = await Promise.all([infoUser]);
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
                                            payment.rateDeposit
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
                            parseFloat(amountVnd) / payment.rateDeposit
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

        const infoUser = Users.findOne({ 'payment.email': user });
        const [info] = await Promise.all([infoUser]);
        const { account } = info.payment.bank;

        Payments.findOne({ accountNumber: account }, (err, payment) => {
            if (err) errCode1(res, err);

            if (payment) {
                const money = methods.precisionRound(
                    parseFloat(amountUsd) * parseFloat(payment.rateWithdraw)
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
}

module.exports = new UsersController();
