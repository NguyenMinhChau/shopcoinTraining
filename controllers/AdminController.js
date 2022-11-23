// import libs
const { default: mongoose } = require('mongoose');

// import models
const User = require('../models/User');
const Payment = require('../models/Payments');

// import functions
const { errCode1, errCode2, dataCode, successCode } = require('../functions');

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
}
module.exports = new AdminController();
