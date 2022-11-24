// import libs
const { default: mongoose } = require('mongoose');
const bcrypt = require('bcrypt');
const otpGenerate = require('otp-generator');

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
    precisionRound,
    mail
} = require('../functions');

const { refreshPWD } = require('../mailform/refreshPWD');

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
        if (!(checkBalance(user.Wallet.balance), amountUSD)) {
            reject({
                code: 1,
                message: `Tài khoản của khách hàng hiện tại không đủ để trừ đi USD với ví: ${user.Wallet.balance} và trừ đi: ${amountUSD}`
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

    // -------------------------------------- get By id ------------------------------------------------

    // [GET] /admin/getDeposit/:id
    async getDeposit(req, res, next) {
        try {
            const { id } = req.params;
            const deposit = await Deposit.findById(id);
            dataCode(res, deposit);
        } catch (error) {
            errCode1(res, error);
        }
    }

    // [GET] /admin/getWithdraw/:id
    async getWithdraw(req, res, next) {
        try {
            const { id } = req.params;
            const withdraw = await Withdraw.findById(id);
            dataCode(res, withdraw);
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

    // -------------------------------------- get By id ------------------------------------------------

    // -------------------------------------- handle function ------------------------------------------

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
            const userFind = User.findOne({
                'payment.email': depositFinal.user
            });
            const [user] = await Promise.all([userFind]);
            if (status == 'Completed') {
                const addUSDResult = addUSD(user, depositFinal.amountUsd);
                addUSDResult
                    .then(async (value) => {
                        const deposit = await Deposit.findById(id);
                        deposit.status = status;
                        deposit
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
                    .then(async (value) => {
                        const deposit = await Deposit.findById(id);
                        deposit.status = status;
                        deposit
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
                const deposit = await Deposit.findById(id);
                deposit.status = status;
                deposit
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
                    .then(async (value) => {
                        const withdraw = await Withdraw.findById(id);
                        withdraw.status = status;
                        withdraw
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
                    .then(async (value) => {
                        const withdraw = await Withdraw.findById(id);
                        withdraw.status = status;
                        withdraw
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
                const withdraw = await Withdraw.findById(id);
                withdraw.status = status;
                withdraw
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

    // -------------------------------------- handle function -------------------------------------------

    // -------------------------------------- get All ---------------------------------------------------

    // [GET] /admin/getAllDeposit
    async getAllDeposit(req, res, next) {
        try {
            const getAllDepositResult = Deposit.find();
            const totalDeposit = Deposit.countDocuments();
            const [total, deposits] = await Promise.all([
                totalDeposit,
                getAllDepositResult
            ]);

            dataCode(res, {
                deposits: deposits,
                total: total
            });
        } catch (error) {
            errCode1(res, error);
        }
    }

    // [GET] /admin/getAllWithdraw
    async getAllWithdraw(req, res, next) {
        try {
            const getAllWithdrawResult = Withdraw.find();
            const totalWithdraws = Withdraw.countDocuments();

            const [total, withdraws] = await Promise.all([
                totalWithdraws,
                getAllWithdrawResult
            ]);

            dataCode(res, {
                withdraws: withdraws,
                total: total
            });
        } catch (error) {
            errCode1(res, error);
        }
    }

    // [GET] /admin/getAllUser
    async getAllUser(req, res, next) {
        try {
            const getAllUserResult = User.find();
            const totalUsers = User.countDocuments();

            const [total, users] = await Promise.all([
                totalUsers,
                getAllUserResult
            ]);

            dataCode(res, {
                users: users,
                total: total
            });
        } catch (error) {
            errCode1(res, error);
        }
    }

    // -------------------------------------- get All ---------------------------------------------------

    // -------------------------------------- delete All ------------------------------------------------

    // [DELETE] /admin/deleteDeposit/:id
    async deleteDeposit(req, res, next) {
        try {
            const { id } = req.params;

            Deposit.findByIdAndRemove(id, (err, doc) => {
                if (err) errCode1(res, err);
                successCode(res, `Delete deposit successfully !!!`);
            });
        } catch (error) {
            errCode1(res, error);
        }
    }

    // [DELETE] /admin/deleteWithdraw/:id
    async deleteWithdraw(req, res, next) {
        try {
            const { id } = req.params;

            Withdraw.findByIdAndRemove(id, (err, doc) => {
                if (err) errCode1(res, err);
                successCode(res, `Delete withdraw successfully !!!`);
            });
        } catch (error) {
            errCode1(res, error);
        }
    }

    // [DELETE] /admin/deleteUser/:id
    async deleteUser(req, res, next) {
        try {
            const { id } = req.params;

            User.findByIdAndRemove(id, (err, doc) => {
                if (err) errCode1(res, err);
                successCode(res, `Delete user successfully !!!`);
            });
        } catch (error) {
            errCode1(res, error);
        }
    }

    // -------------------------------------- delete All ------------------------------------------------

    // -------------------------------------- get total ------------------------------------------------

    // [GET] /admin/totalDeposit
    async totalDeposit(req, res) {
        const { from, to } = req.body;
        if (!from || !to) {
            const totalDep = Deposit.find();
            const [deposits] = await Promise.all([totalDep]);
            if (deposits.length == 0) {
                errCode2(res, `No deposit !!`);
            } else {
                let total = 0;
                for (let i = 0; i < deposits.length; i++) {
                    total = precisionRound(
                        parseFloat(total) + parseFloat(deposits[i].amountUsd)
                    );
                }
                dataCode(res, total);
            }
        } else {
            let fromDate = new Date(from);
            let toDate = new Date(to);
            const totalDep = Deposit.find({
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
                    total = precisionRound(
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
                const totalWithdraw = Withdraw.find();
                const [withdraws] = await Promise.all([totalWithdraw]);
                if (withdraws.length == 0) {
                    errCode2(res, `No Withdraw !!`);
                } else {
                    let total = 0;
                    for (let i = 0; i < withdraws.length; i++) {
                        total = precisionRound(
                            parseFloat(total) +
                                parseFloat(withdraws[i].amountUsd)
                        );
                    }
                    dataCode(res, total);
                }
            } else {
                let fromDate = new Date(from);
                let toDate = new Date(to);
                const totalWithdraw = Withdraw.find({
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
                        total = precisionRound(
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
        const { from, to } = req.body;
        if (!from || !to) {
            const totalUser = User.find();
            const [users] = await Promise.all([totalUser]);
            if (users.length == 0) {
                errCode2(res, `No Balance of user !!`);
            } else {
                let total = 0;
                for (let i = 0; i < users.length; i++) {
                    total = precisionRound(
                        parseFloat(total) + parseFloat(users[i].Wallet.balance)
                    );
                }
                dataCode(res, {
                    users: users,
                    total: total
                });
            }
        } else {
            let fromDate = new Date(from);
            let toDate = new Date(to);
            const totalUser = User.find({
                createdAt: {
                    $gte: fromDate,
                    $lt: toDate
                }
            });
            const [users] = await Promise.all([totalUser]);
            if (users.length == 0) {
                errCode2(res, `No Balance of user !!`);
            } else {
                let total = 0;
                for (let i = 0; i < users.length; i++) {
                    total = precisionRound(
                        parseFloat(total) + parseFloat(users[i].Wallet.balance)
                    );
                }
                dataCode(res, {
                    users: users,
                    total: total
                });
            }
        }
    }

    // -------------------------------------- get total ------------------------------------------------

    // [POST] /admin/giveUSD/:id
    async giveUSD(req, res, next) {
        try {
            const { id } = req.params;
            const { usd } = req.body;
            const user = await User.findById(id);

            if (usd > 0) {
                addUSD(user, usd)
                    .then((result) => {
                        successCode(
                            res,
                            `Đã tặng usd cho user với email: ${user.payment.email}`
                        );
                    })
                    .catch((err) => {
                        errCode1(res, err);
                    });
            } else {
                subUSD(user, Math.abs(usd))
                    .then((result) => {
                        successCode(
                            res,
                            `Đã trừ usd cho user với email: ${user.payment.email}`
                        );
                    })
                    .catch((err) => {
                        errCode1(res, err);
                    });
            }
        } catch (error) {
            errCode1(res, error);
        }
    }

    // [PUT] /admin/blockAndUnBlock/:id
    async blockAndUnBlock(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const user = await User.findById(id);
            user.blockUser = status;
            user.save()
                .then((result) => {
                    if (status == 'true') {
                        successCode(res, `Blocked user successfully`);
                    } else {
                        successCode(res, `UnBlocked user successfully`);
                    }
                })
                .catch((err) => {
                    errCode1(res, err);
                });
        } catch (error) {
            errCode1(res, error);
        }
    }

    // [PUT] /admin/changePWD/:id
    async changePWD(req, res, next) {
        try {
            const { newPWD } = req.body;
            const { id } = req.params;
            const user = await User.findById(id);

            bcrypt
                .hash(newPWD, 10)
                .then((hash) => {
                    user.payment.password = hash;
                    user.save()
                        .then((result) => {
                            successCode(
                                res,
                                `Change password of user successfully with email: ${user.payment.email}`
                            );
                        })
                        .catch((err) => {
                            errCode1(res, err);
                        });
                })
                .catch((err) => {
                    errCode1(res, err);
                });
        } catch (error) {
            errCode1(res, error);
        }
    }

    // [PUT] /admin/refreshPWD/:id
    async refreshPWD(req, res, next) {
        try {
            const { id } = req.params;
            const newPWD = otpGenerate.generate(8);
            const user = await User.findById(id);
            bcrypt
                .hash(newPWD, 10)
                .then((hash) => {
                    user.payment.password = hash;
                    user.save()
                        .then((result) => {
                            mail(
                                user.payment.email,
                                refreshPWD(user.payment.email, newPWD),
                                'Refresh Password'
                            )
                                .then(() => {
                                    successCode(
                                        res,
                                        `Refresh Password of user with email: ${user.payment.email} successfully`
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
        } catch (error) {
            errCode1(res, error);
        }
    }

    // [PUT] /admin/updateRankUser/:id
    async updateRankUser(req, res, next) {
        try {
            const { id } = req.params;
            const { rank } = req.body;
            const user = await User.findById(id);

            user.rank = rank;
            user.save()
                .then((result) => {
                    successCode(
                        res,
                        `Update rank user with email: ${user.payment.email} successfully`
                    );
                })
                .catch((err) => {
                    errCode1(res, err);
                });
        } catch (error) {
            errCode1(res, error);
        }
    }
}
module.exports = new AdminController();
