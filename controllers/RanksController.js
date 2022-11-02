const Ranks = require('../models/Ranks');
const methods = require('../function');

class RanksController {
    // [PUT] /ranks/updateRank/:id
    updateRank(req, res) {
        const { id } = req.params;

        Ranks.findById(id, (err, rank) => {
            if (err) methods.errCode1(res, err);

            if (rank) {
                methods.dataCode(res, rank);
            } else {
                methods.errCode2(res, `Rank is not valid with id = ${id}`);
            }
        });
    }

    // [POST] /ranks/rank
    rank(req, res) {
        const { fee, ranks } = req.body;

        Ranks.findOne({ ranks: ranks }, (err, rank) => {
            if (err) methods.errCode1(res, err);

            if (rank) {
                // console.log(rank);
                methods.errCode2(
                    res,
                    `Rank is valid with name rank is ${ranks}`
                );
            } else {
                const newRank = Ranks(req.body);
                newRank
                    .save()
                    .then((r) => {
                        methods.dataCode(res, r);
                    })
                    .catch((err) => {
                        methods.errCode1(res, err);
                    });
            }
        });
    }

    // [GET] /ranks/getAllRanks
    getAllRanks(req, res) {
        Ranks.find({}, (err, ranks) => {
            if (err) methods.errCode1(res, err);

            if (ranks) {
                methods.dataCode(res, ranks);
            } else {
                methods.errCode2(res, `No ranks exist`);
            }
        });
    }
}

module.exports = new RanksController();
