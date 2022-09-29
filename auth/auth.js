const jwt = require('jsonwebtoken');
const Users = require('../models/User');

const { errCode1, errCode2 } = require('../function');

const verifyToken = (req, res, next) => {
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
            Users.findOne({ 'payment.email': email }, (err, user) => {
                if (err) errCode1(res, err);

                if (user) {
                    if (user.payment.rule === 'admin' || user.blockUser) {
                        next();
                    } else {
                        errCode2(
                            res,
                            `User is locked !! Please contact with admin to unlock account with email = ${email}`
                        );
                    }
                } else {
                    errCode2(res, `User is not valid with email = ${email}`);
                }
            });
        }
    } catch (err) {
        // return res.status(401).send("Invalid Token");
        errCode2(res, `Invalid token`);
    }
};

module.exports = verifyToken;
