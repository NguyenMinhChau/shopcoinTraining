// import libs
const xml2 = require('xml2js');
const axios = require('axios');

// import models
const Rate = require('../models/Rate');

// import functions global
const { errCode1, errCode2, successCode, dataCode } = require('../functions');

// support functions
const convertNumber = (number) => {
    const firstStep = number.split(',');
    const secondStep = `${firstStep[0]}${firstStep[1]}`;
    return parseFloat(secondStep);
};

class RateController {
    // [GET] /admin/getRate
    async getRate(req, res, next) {
        try {
            const getRateResult = Rate.find();
            const [rates] = await Promise.all([getRateResult]);
            const rate = rates[0];
            if (rate) {
                dataCode(res, rate);
            } else {
                errCode2(res, `No rate`);
            }
        } catch (error) {
            errCode1(res, err);
        }
    }

    // [GET] /admin/updateRate
    async updateRate(req, res, next) {
        try {
            const xml = axios.get(
                'https://portal.vietcombank.com.vn/Usercontrols/TVPortal.TyGia/pXML.aspx?b=10'
            );
            const rateGot = Rate.find();
            const [resultTyGia, rate] = await Promise.all([xml, rateGot]);

            xml2.parseString(
                resultTyGia.data,
                { mergeAttrs: true },
                (err, result) => {
                    if (err) {
                        throw err;
                    }

                    const data = result.ExrateList.Exrate;
                    const finalRes = data.filter((exchangeRate) => {
                        if (exchangeRate.CurrencyCode == 'USD') {
                            return exchangeRate;
                        }
                    });
                    const dataRate = finalRes[0];
                    const rateBefore = rate[0];

                    let transfer = convertNumber(dataRate.Transfer[0]);
                    let sell = convertNumber(dataRate.Sell[0]);
                    rateBefore.transfer = transfer;
                    rateBefore.sell = sell;
                    rateBefore.save();
                    successCode(res, `Cập nhật giá tiền thành công`);
                }
            );
        } catch (error) {
            errCode1(res, error);
        }
    }
}

module.exports = new RateController();
