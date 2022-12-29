const {
    errCode1,
    errCode2,
    dataCode,
    successCode,
    precisionRound
} = require('../function');
const Bill = require('../models/Bills');
const Deposit = require('../models/Deposits');
const Ranks = require('../models/Ranks');
const Users = require('../models/User');
const Withdraw = require('../models/Withdraws');

class ServicesController {
    async changeFeeUsers(req, res) {
        try {
            const { rankIn } = req.body;
            const rank = await Ranks.findOne({ ranks: rankIn });
            if (!rank) {
                throw { message: 'No rank' };
            } else {
                const usersFind = await Users.find({ rank: rank.ranks });
                if (usersFind.length == 0) {
                    successCode(res, `No user valid with rank = ${rankIn}`);
                } else {
                    // let fee = rank.fee;
                    // usersFind.forEach((user) => {
                    //     user.fee = fee;
                    //     user.save()
                    //         .then(() => {})
                    //         .catch((err) => errCode1(res, err));
                    // });
                    // successCode(res, `Udpate successfully`);
                    dataCode(res, usersFind);
                }
            }
        } catch (error) {
            errCode1(res, error);
        }
    }

    // [DELETE] /services/delete_user
    async delete_all_user(req, res, next) {
        try {
            // const bills = await Deposit.find();
            // // dataCode(res, bills);
            // if (bills) {
            //     const bill_select = bills.filter((bill) => {
            //         if (bill.user == 'yenphuongcao1190@gmail.com') {
            //             return bill;
            //         }
            //     });
            //     const bill_non_select = bills.filter((bill) => {
            //         if (bill.user != 'yenphuongcao1190@gmail.com') {
            //             return bill;
            //         }
            //     });
            //     bill_non_select.forEach(async (bill) => {
            //         await Deposit.deleteOne({ _id: bill._id });
            //         console.log('OK');
            //     });
            //     dataCode(res, bill_select);
            // }
            // const users = await Users.find();
            // if (users) {
            //     // dataCode(res, users);
            //     let userFindNotAdmin = users.filter((user) => {
            //         if (user.payment.rule != 'admin') {
            //             return user;
            //         }
            //     });
            //     userFindNotAdmin.forEach(async (u) => {
            //         Users.findOneAndDelete({ _id: u._id }, (err, doc) => {
            //             if (err) console.log(err);
            //             console.log(`delete user with id ${u._id}`);
            //         });
            //     });
            //     dataCode(res, 'OKKK');
            // } else {
            //     throw {
            //         message: 'No users'
            //     };
            // }
        } catch (error) {
            errCode1(res, error);
        }
    }

    // [GET] /services/autoAddCommission
    async autoAddCommission(req, res) {
        try {
            const bills = await Bill.find({});
            bills.forEach((bill) => {
                let commission = precisionRound(
                    parseFloat(bill.amount) *
                        parseFloat(bill.price) *
                        parseFloat(bill.fee)
                );
                bill.commission = commission;
                bill.save()
                    .then(() => {})
                    .catch((err) => {
                        throw {
                            code: 1,
                            message: err.message
                        };
                    });
            });
            dataCode(res, bills);
        } catch (error) {
            errCode1(res, error);
        }
    }

    // [GET] /services/resetUser/:email
    async resetUser(req, res) {
        const { email } = req.params;
        try {
            const user = await Users.findOne({
                'payment.email': email
            });
            if (user) {
                const deleteBillsUser = await Bill.deleteMany({
                    'buyer.gmailUSer': email
                });
                const deleteDeposit = await Deposit.deleteMany({ user: email });
                const deleteWithdraw = await Withdraw.deleteMany({
                    user: email
                });

                if (deleteBillsUser && deleteDeposit && deleteWithdraw) {
                    user.Wallet.balance = 0;
                    user.coins = [];
                    user.Wallet.deposit = 0;
                    user.Wallet.withdraw = 0;
                    user.save()
                        .then(() => {
                            successCode(
                                res,
                                `Reset user successfully with email = ${email}`
                            );
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                } else {
                    throw {
                        code: 2,
                        message: 'Something is error reset user'
                    };
                }
            } else {
                throw {
                    code: 1,
                    message: `User is not valid with id = ${id}`
                };
            }
        } catch (error) {
            errCode1(res, error);
        }
    }

    // [GET] /services/autoUpdateDepositWithdrawCommission
    async auto_update_deposit_withdraw_commission_user(req, res) {
        try {
            const users = await Users.find({});
            if (users) {
                if (users.length > 0) {
                    // dataCode(res, users);
                    users.forEach(async (user) => {
                        let sumDeposit = 0;
                        let sumWithdraw = 0;
                        let sumCommission = 0;

                        let deposits = await Deposit.find({
                            user: user.payment.email,
                            status: 'Completed'
                        });
                        let withdraws = await Withdraw.find({
                            user: user.payment.email,
                            status: 'Completed'
                        });

                        let bills = await Bill.find({
                            'buyer.gmailUSer': user.payment.email,
                            status: 'Completed'
                        });
                        if (deposits.length > 0) {
                            deposits.forEach((deposit) => {
                                sumDeposit = precisionRound(
                                    parseFloat(deposit.amountUsd) +
                                        parseFloat(sumDeposit)
                                );
                            });
                        }

                        if (withdraws.length > 0) {
                            withdraws.forEach((withdraw) => {
                                sumWithdraw = precisionRound(
                                    parseFloat(withdraw.amountUsd) +
                                        parseFloat(sumWithdraw)
                                );
                            });
                        }

                        if (bills.length > 0) {
                            bills.forEach((b) => {
                                sumCommission = precisionRound(
                                    parseFloat(sumCommission) +
                                        parseFloat(b.commission)
                                );
                            });
                        }
                        user.Wallet.deposit = sumDeposit;
                        user.Wallet.withdraw = sumWithdraw;
                        user.Wallet.commission = sumCommission;
                        user.save()
                            .then(() => {})
                            .catch((err) => {
                                errCode1(res, err);
                            });
                    });
                    successCode(res, 'Update Deposit Withdraw successfully');
                } else {
                    throw {
                        code: 1,
                        message: 'No users'
                    };
                }
            } else {
                throw {
                    code: 1,
                    message: 'Can not find users. Something is error.'
                };
            }
        } catch (error) {
            errCode1(res, error);
        }
    }
}

module.exports = new ServicesController();
