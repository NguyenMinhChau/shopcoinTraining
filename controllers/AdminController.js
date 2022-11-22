// import libs

// import models
const User = require('../models/User');

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
}
module.exports = new AdminController();
