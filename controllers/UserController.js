// import libs
const otpGenerate = require('otp-generator');
const jimp = require('jimp');
const fs = require('fs');
const Path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// import models
const Deposit = require('../models/Deposit');
const Withdraw = require('../models/Withdraw');
const Users = require('../models/User');
const OTP = require('../models/Otp');
const Rate = require('../models/Rate');
const Forgot = require('../models/Forgot');
const Payments = require('../models/Payments');

// import functions global
const {
    errCode1,
    errCode2,
    successCode,
    dataCode,
    mail,
    precisionRound
} = require('../functions');
const {
    withdrawMail,
    withdrawSuccess,
    confirmWithdraw
} = require('../mailform/withdrawForm');
const Commission = require('../models/Commission');

// support function
const checkBalance = (balanceNow, balanceAdd) => {
    return balanceNow > balanceAdd;
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

const buyUSDSupport = async (amountUSD, amountVnd, email, commission) => {
    const p = new Promise(async (resolve, reject) => {
        const code = otpGenerate.generate(4, {
            specialChars: false,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false
        });
        const user = await Users.findOne({ 'payment.email': email });
        const deposit = new Deposit({
            code: code,
            user: email,
            amountUsd: amountUSD,
            amountVnd: amountVnd,
            method: {
                accountName: user.payment.bank.name,
                accountNumber: user.payment.bank.account,
                methodName: user.payment.bank.bankName
            },
            commission: commission
        });

        deposit
            .save()
            .then((deposit) => {
                resolve({
                    code: 0,
                    message: `Mua USD thành công chờ quản lý xét duyệt`,
                    data: deposit
                });
            })
            .catch((err) => {
                reject({ code: 1, message: err.message });
            });
    });

    return p;
};

const sellUSDSupport = async (
    amountUSD,
    amountVnd,
    email,
    user,
    commission
) => {
    const p = new Promise((resolve, reject) => {
        const code = otpGenerate.generate(4, {
            specialChars: false,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false
        });

        if (
            !checkBalance(
                parseFloat(user.Wallet.balance),
                parseFloat(amountUSD)
            )
        ) {
            reject({
                code: 1,
                message: `Số tiền USD trong tài khoản không đủ để thực hiện !!!`
            });
        }

        const withdraw = new Withdraw({
            code: code,
            user: email,
            amountUsd: amountUSD,
            amountVnd: amountVnd,
            method: {
                accountName: user.payment.bank.name,
                accountNumber: user.payment.bank.account,
                methodName: user.payment.bank.bankName
            },
            commission: commission
        });

        withdraw
            .save()
            .then((result) => {
                resolve(result);
            })
            .catch((err) => {
                reject({ code: 1, message: err.msg });
            });
    });

    return p;
};

const addPayment = async (methodName, accountName, accountNumber) => {
    const p = new Promise((resolve, reject) => {
        const codePayment = otpGenerate.generate(6, {
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
};

class UserController {
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

    // [PUT] /admin/changePWD/:id
    changePWD(req, res) {
        const { oldPWD, newPWD } = req.body;
        const id = req.params.id;

        Users.findById(id, (err, user) => {
            if (err) {
                errCode1(res, err);
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
                                            successCode(
                                                res,
                                                `Change password successfully with id = ${id}`
                                            );
                                        } else {
                                            errCode2(
                                                res,
                                                'Can not change password'
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
                        errCode2(res, 'Password is not match');
                    }
                });
            } else {
                errCode2(res, `User is not valid with id = ${id}`);
            }
        });
    }

    // [POST] /users/forgotPassword
    forgotPassword(req, res) {
        const { email } = req.body;
        Users.findOne({ 'payment.email': email }, (err, user) => {
            if (err) errCode1(res, err);

            if (user) {
                const token = jwt.sign({ email }, process.env.JWT_SECRET, {
                    expiresIn: '3m'
                });
                const otp = otpGenerate.generate(4, {
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
                            let resultSendMail = mail(
                                email,
                                mailContent,
                                'Reset Password'
                            );
                            resultSendMail
                                .then((val) => {
                                    // successCode(
                                    //     res,
                                    //     `Send mail for forgot password successfully to email = ${email}`
                                    // );
                                    dataCode(res, token);
                                })
                                .catch((err) => {
                                    errCode1(res, err);
                                });
                        } else {
                            errCode2(
                                res,
                                `Can not save model forgot of user with email = ${email}`
                            );
                        }
                    })
                    .catch((err) => {
                        errCode1(res, err);
                    });
            } else {
                errCode2(res, `User is not valid with email = ${email}`);
            }
        });
    }

    // [PUT] /users/additionBankInfo/:id
    async additionBankInfo(req, res) {
        try {
            const { bankName, nameAccount, accountNumber } = req.body;
            const id = req.params.id;

            Users.findById(id, async (err, user) => {
                if (err) {
                    errCode1(res, err);
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
                                            successCode(
                                                res,
                                                `Add bank information successfully with id = ${id}`
                                            );
                                        })
                                        .catch((err) => {
                                            errCode1(res, err);
                                        });
                                } else {
                                    errCode2(
                                        res,
                                        `Can not addition information of user about bank payment with id = ${id}`
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
        } catch (err) {
            errCode1(res, err);
        }
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

    // [POST] /users/BuyUSD/:id
    async BuyUSD(req, res, next) {
        try {
            const { id } = req.params;
            const { amountUSD, amountVnd } = req.body;
            const userFind = Users.findById(id);
            const rateFind = Rate.findOne({});
            const [user, rate] = await Promise.all([userFind, rateFind]);

            if (user) {
                const finalVND = precisionRound(
                    parseFloat(amountUSD) *
                        parseFloat(rate.transfer) *
                        parseFloat(1 - parseFloat(rate.rate))
                );

                const commission = precisionRound(
                    parseFloat(amountUSD) *
                        parseFloat(rate.transfer) *
                        parseFloat(rate.rate)
                );

                const resultBuyUSD = buyUSDSupport(
                    amountUSD,
                    finalVND,
                    user.payment.email,
                    commission
                );
                resultBuyUSD
                    .then((value) => {
                        dataCode(res, value.data);
                    })
                    .catch((err) => errCode1(res, err));
            } else {
                errCode2(res, `User is not valid`);
            }
        } catch (error) {
            errCode1(res, error);
        }
    }

    // [POST] /users/additionImageDeposit/:id
    async additionImageDeposit(req, res, next) {
        try {
            const { imageDeposit, bankAdmin } = req.body;
            const { id } = req.params;
            let date = Date.now();
            const depositGet = Deposit.findById(id);
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

    // [POST] /users/SellUSD/:id
    async sellUSD(req, res, next) {
        try {
            const { id } = req.params;
            const { amountUSD, amountVnd } = req.body;
            const userFind = Users.findById(id);
            const rateFind = Rate.findOne({});
            const [user, rate] = await Promise.all([userFind, rateFind]);

            if (user) {
                const finalVND = precisionRound(
                    parseFloat(amountUSD) *
                        parseFloat(rate.transfer) *
                        parseFloat(1 - parseFloat(rate.rate))
                );

                const commission = precisionRound(
                    parseFloat(amountUSD) *
                        parseFloat(rate.transfer) *
                        parseFloat(rate.rate)
                );
                const resultSellUSD = sellUSDSupport(
                    amountUSD,
                    finalVND,
                    user.payment.email,
                    user,
                    commission
                );
                resultSellUSD
                    .then((withdraw) => {
                        const code = otpGenerate.generate(4, {
                            specialChars: false,
                            lowerCaseAlphabets: false,
                            upperCaseAlphabets: false
                        });

                        mail(
                            user.payment.email,
                            confirmWithdraw(user.payment.email, code)
                        )
                            .then(() => {
                                const otp = new OTP({
                                    code: code,
                                    email: user.payment.email,
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
                    .catch((err) => errCode1(res, err));
            } else {
                errCode2(res, `User is not valid`);
            }
        } catch (error) {
            errCode1(res, error);
        }
    }

    // [GET] /users/enterOTPWithdraw/:code
    enterOTPWithdraw(req, res) {
        const { code } = req.params;
        OTP.findOne({ code: code }, (err, otp) => {
            if (err) errCode1(res, err);

            if (otp) {
                const id = otp.id;
                Withdraw.findById(id, (err, withdraw) => {
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
                                        withdraw.amountUsd
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

    // [POST] /users/resendOTPWithdraw/:id
    resendOTPWithdraw(req, res) {
        const codeOtp = otpGenerate.generate(4, {
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
                        Withdraw.findById(id, (err, withdraw) => {
                            if (err) errCode1(res, err);
                            if (withdraw) {
                                const otp = new OTP({
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
        // mail(email, )
    }

    // [GET] /users/getPaymentByEmail/:email
    async getPaymentByEmail(req, res, next) {
        try {
            const { email } = req.params;
            const getPaymentsByEmailResult = Deposit.aggregate([
                {
                    $match: {
                        user: email
                    }
                }
            ]);

            const [payments] = await Promise.all([getPaymentsByEmailResult]);
            dataCode(res, payments);
        } catch (error) {
            errCode1(res, error);
        }
    }

    // [GET] /users/getWithdrawByEmail/:email
    async getWithdrawByEmail(req, res, next) {
        try {
            const { email } = req.params;
            const getWithdrawByEmailResult = Withdraw.aggregate([
                {
                    $match: {
                        user: email
                    }
                }
            ]);

            const [withdraws] = await Promise.all([getWithdrawByEmailResult]);
            dataCode(res, withdraws);
        } catch (error) {
            errCode1(res, error);
        }
    }
}

module.exports = new UserController();
