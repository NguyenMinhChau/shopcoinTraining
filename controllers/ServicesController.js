const otpGenerator = require('otp-generator');
const jimp = require('jimp');
const fs = require('fs');
const Path = require('path');

// models
const Deposits = require('../models/Deposits');
const Withdraws = require('../models/Withdraws');
const Users = require('../models/User');
const Otps = require('../models/OTP');
const Payments = require('../models/Payments');

// function global
const {
    errCode1,
    errCode2,
    dataCode,
    successCode,
    precisionRound,
    mail
} = require('../function');

const {
    withdrawMail,
    confirmWithdraw,
    withdrawSuccess
} = require('../mailform/withdrawForm');

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

class ServicesController {
    // services/deposit
    async deposit(req, res) {
        try {
            const codeDeposit = otpGenerator.generate(10, {
                upperCaseAlphabets: false,
                specialChars: false
            });
            const { amount, user, amountVnd, bankAdmin } = req.body;
            const userFind = Users.aggregate([
                { $match: { 'payment.email': user } },
                {
                    $project: {
                        'Wallet.deposit': 1,
                        'Wallet.balance': 1,
                        _id: 1,
                        'payment.bank': 1
                    }
                }
            ]);

            const [userFound] = await Promise.all([userFind]);
            if (userFound.length > 0) {
                const usd = precisionRound(
                    parseFloat(amountVnd) / parseFloat(bankAdmin.rateDeposit)
                );
                const newDeposit = new Deposits({
                    code: codeDeposit,
                    amount: amount,
                    user: user,
                    method: {
                        code: codeDeposit,
                        methodName: userFound[0].payment.bank.bankName
                            ? userFound[0].payment.bank.bankName
                            : '',
                        accountName: userFound[0].payment.bank.name
                            ? userFound[0].payment.bank.name
                            : '',
                        accountNumber: userFound[0].payment.bank.account
                            ? userFound[0].payment.bank.account
                            : '',
                        transform: amountVnd
                    },
                    amountUsd: usd,
                    amountVnd: amountVnd
                });
                newDeposit
                    .save()
                    .then((deposit) => {
                        dataCode(res, deposit);
                    })
                    .catch((err) => {
                        errCode1(res, err);
                    });
            } else {
                errCode2(res, `Người dùng không tồn tại với email = ${user}`);
            }
        } catch (err) {
            errCode1(res, err);
        }
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
                deposit.save().then(() => {
                    // botHelperSendMessage(chatId, deposit, `${process.env.URL_API}/images/1668654759659-1668654734000.jpeg`)
                    successCode(
                        res,
                        `Addition image successfully for deposit with id = ${id}`
                    );
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
                                mail(
                                    withdraw.user,
                                    withdrawSuccess(
                                        withdraw.user,
                                        withdraw.amount
                                    ),
                                    'Success Withdraw Mail'
                                )
                                    .then((result) => {
                                        // botHelperSendMessage(chatId, withdraw, `${process.env.URL_API}/images/1668654759659-1668654734000.jpeg`)
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
                const money = precisionRound(
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

                        mail(
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

module.exports = new ServicesController();
