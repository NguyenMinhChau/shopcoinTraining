// import libs
const { default: mongoose } = require('mongoose');

// import models
const User = require('../models/User');
const Payment = require('../models/Payments');
const Deposit = require('../models/Deposit');
const Withdraw = require('../models/Withdraw');

// import functions
const {
    errCode1,
    errCode2,
    dataCode,
    successCode,
    precisionRound
} = require('../functions');

// functions support
const checkBalance = (balance, money) => {
    return parseFloat(balance) > parseFloat(money);
};

const addUSD = async (user, amountUSD) => {
    const p = new Promise((resolve, reject) => {
        const balanceUer = precisionRound(
            parseFloat(user.Wallet.balance) + parseFloat(amountUSD)
        );
        user.Wallet.balance = balanceUer;
        user.save()
            .then((result) => {
                resolve({ code: 0, message: 'Thêm USD thành công' });
            })
            .catch((err) => {
                reject({ code: 1, message: err.message });
            });
    });

    return p;
};

const subUSD = async (user, amountUSD) => {
    const p = new Promise((resolve, reject) => {
        if ((!checkBalance(user.Wallet.balance), amountUSD)) {
            reject({
                code: 1,
                message: `Tài khoản của khách hàng hiện tại không đủ để trừ đi USD với ví: ${user.Wallet.balance} và trừ đi: $${amountUSD}`
            });
        }

        const balanceUer = precisionRound(
            parseFloat(user.Wallet.balance) - parseFloat(amountUSD)
        );

        user.Wallet.balance = balanceUer;
        user.save()
            .then((result) => {
                resolve({ code: 0, message: 'Trừ USD thành công' });
            })
            .catch((err) => {
                reject({ code: 1, message: err.message });
            });
    });

    return p;
};

class AdminController {
    // [GET] /admin/getAllUser
    async getAllUser(req, res, next) {
        try {
            const getAllUsersResult = User.find();
            const [users] = await Promise.all([getAllUsersResult]);

            if (users.length > 0) {
                dataCode(res, users);
            } else {
                successCode(res, `No users`);
            }
        } catch (error) {
            errCode1(res, error);
        }
    }

    // [GET] /admin/getUser/:id
    getUser(req, res) {
        const { id } = req.params;
        User.findById(id, (err, user) => {
            if (err) errCode1(res, err);

            if (user) {
                dataCode(res, user);
            } else {
                errCode2(res, `User is not valid with id = ${id}`);
            }
        });
    }

    // [GET] /admin/getPaymentAdmin
    async getPaymentAdmin(req, res, next) {
        try {
            const getPaymentAdminResult = Payment.aggregate([
                {
                    $match: {
                        type: 'admin'
                    }
                }
            ]);
            const [payments] = await Promise.all([getPaymentAdminResult]);
            dataCode(res, payments);
        } catch (error) {
            errCode1(res, error);
        }
    }

    // [GET] /admin/getPayment/:id
    async getPayment(req, res, next) {
        try {
            const { id } = req.params;
            const getPaymentByIdResult = Payment.aggregate([
                {
                    $match: {
                        _id: mongoose.Types.ObjectId(id)
                    }
                }
            ]);

            const [payment] = await Promise.all([getPaymentByIdResult]);
            dataCode(res, payment);
        } catch (error) {
            errCode1(res, error);
        }
    }

    // [POST] /handleBuyUSD/:id
    async handleBuyUSD(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const depositFind = Deposit.aggregate([
                {
                    $match: {
                        _id: mongoose.Types.ObjectId(id)
                    }
                }
            ]);
            const [depositFound] = await Promise.all([depositFind]);
            const depositFinal = depositFound[0];
            const user = await User.findById(depositFinal.user);

            if (status == 'Completed') {
                const addUSDResult = addUSD(user, depositFinal.amountUsd);
                addUSDResult
                    .then((value) => {
                        depositFinal.status = status;
                        depositFinal
                            .save()
                            .then(() => {
                                successCode(
                                    res,
                                    `Đã thêm USD cho khách hàng !!`
                                );
                            })
                            .catch((err) => errCode1(res, err));
                    })
                    .catch((err) => errCode1(res, err));
            } else if (status == 'Canceled') {
                const subUSDResult = subUSD(user, depositFinal.amountUsd);
                subUSDResult
                    .then((value) => {
                        depositFinal.status = status;
                        depositFinal
                            .save()
                            .then(() => {
                                successCode(
                                    res,
                                    `Đã trừ USD cho khách hàng trong từ chối giao dịch này !!`
                                );
                            })
                            .catch((err) => errCode1(res, err));
                    })
                    .catch((err) => errCode1(res, err));
            } else {
                depositFinal.status = status;
                depositFinal
                    .save()
                    .then(() => {
                        successCode(
                            res,
                            `Thay đổi trạng thái thành công sang ${status} !!`
                        );
                    })
                    .catch((err) => errCode1(res, err));
            }
        } catch (error) {
            errCode1(res, error);
        }
    }

    // [PUT] /handleSellUSD/:id
    async handleSellUSD(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const withdrawFind = Withdraw.aggregate([
                {
                    $match: {
                        _id: mongoose.Types.ObjectId(id)
                    }
                }
            ]);
            const [withdrawFound] = await Promise.all([withdrawFind]);
            const withdrawFinal = withdrawFound[0];
            const user = await User.findById(withdrawFinal.user);

            if (status == 'Completed') {
                const subUSDResult = subUSD(user, withdrawFinal.amountUsd);
                subUSDResult
                    .then((value) => {
                        withdrawFinal.status = status;
                        withdrawFinal
                            .save()
                            .then(() => {
                                successCode(
                                    res,
                                    `Đã trừ USD cho khách hàng trong từ chối giao dịch này !!`
                                );
                            })
                            .catch((err) => errCode1(res, err));
                    })
                    .catch((err) => errCode1(res, err));
            } else if (status == 'Canceled') {
                const addUSDResult = addUSD(user, withdrawFinal.amountUsd);
                addUSDResult
                    .then((value) => {
                        withdrawFinal.status = status;
                        withdrawFinal
                            .save()
                            .then(() => {
                                successCode(
                                    res,
                                    `Đã thêm USD cho khách hàng !!`
                                );
                            })
                            .catch((err) => errCode1(res, err));
                    })
                    .catch((err) => errCode1(res, err));
            } else {
                withdrawFinal.status = status;
                withdrawFinal
                    .save()
                    .then(() => {
                        successCode(
                            res,
                            `Thay đổi trạng thái thành công sang ${status} !!`
                        );
                    })
                    .catch((err) => errCode1(res, err));
            }
        } catch (error) {
            errCode1(res, error);
        }
    }
}
module.exports = new AdminController();
