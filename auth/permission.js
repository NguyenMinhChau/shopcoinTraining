const { errCode1, errCode2 } = require('../function');

const verifyPermission = (permissions) => {
    return (req, res, next) => {
        const user = req.user;
        // console.log(user);
        const rule = user.payment.rule;
        // console.log(rule);
        if (!permissions.includes(rule)) {
            errCode2(res, `You don't have permission to access this api !!`);
        } else {
            next();
        }
    };
};

module.exports = verifyPermission;
