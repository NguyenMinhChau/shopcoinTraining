const jwt = require('jsonwebtoken');
const Users = require('../models/User');

const { errCode1, errCode2 } = require('../functions');

const verifyToken = async (req, res, next) => {
    const token =
        req.body.token || req.headers['token'] || req.body.headers.token;

    if (!token) {
        return res.status(403).send('A token is required for authentication');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded) {
            req.user = decoded;
            let { email } = decoded;

            const user = await Users.find({ 'payment.email': email });
            if (user) {
                if (user.payment.rule === 'admin' || user.blockUser === false) {
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
        if (!user) {
            errCode2(res, `User not found!`);
        }

        const rule = user.payment.rule;
        if (!permissions.includes(rule)) {
            errCode2(res, `You don't have permission to access this api !!`);
        }

        next();
    };
};

module.exports = {
    verifyToken,
    verifyPermission
};
