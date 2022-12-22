const { errCode1, errCode2, dataCode, successCode } = require('../function');
const Bill = require('../models/Bills');
const Deposit = require('../models/Deposits');
const Ranks = require('../models/Ranks');
const Users = require('../models/User');

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
}

module.exports = new ServicesController();
