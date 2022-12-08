const { errCode1, errCode2, dataCode, successCode } = require('../function');
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
}

module.exports = new ServicesController();
