const jwt = require('jsonwebtoken');
const Users = require('../models/User');

const { errCode1, errCode2, dataCode } = require('../functions');

const verifyToken = async (req, res, next) => {
    const token =
        req.body.token || req.headers['token'] || req.body.headers.token;

    if (!token) {
        return res.status(403).send('A token is required for authentication');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const listForAccess = ['admin'];
        if (decoded) {
            let { email } = decoded;

            const user = await Users.findOne({ 'payment.email': email });
            if (user) {
                if (user.payment.rule == 'admin' || user.blockUser == false) {
                    req.user = user;
                    next();
                } else {
                    errCode2(
                        res,
                        `User is locked !! Please contact with admin to unlock account with email = ${email}`
                    );
                }
            } else {
                errCode2(res, `Tài khoản không tồn tại với email: ${email}`);
            }
        }
    } catch (error) {
        errCode1(res, error);
    }
};

const verifyPermission = (permissions) => {
    return (req, res, next) => {
        const user = req.user;
        const rule = user.payment.rule;
        if (!permissions.includes(rule)) {
            errCode2(res, `You don't have permission to access this api !!`);
        } else {
            next();
        }
    };
};

module.exports = {
    verifyToken,
    verifyPermission
};
