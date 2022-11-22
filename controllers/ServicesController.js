const otpGenerator = require('otp-generator');
const jimp = require('jimp');
const fs = require('fs');
const Path = require('path');
const xml2 = require('xml2js');

// models
const Rates = require('../models/Rates');

// function global
const {
    errCode1,
    errCode2,
    dataCode,
    successCode,
    precisionRound,
    mail
} = require('../function');
const axios = require('axios');

const {
    withdrawMail,
    confirmWithdraw,
    withdrawSuccess
} = require('../mailform/withdrawForm');

class ServicesController {
    // [GET] /services/getRate
    async getRate(req, res) {
        const xml = axios.get(
            'https://portal.vietcombank.com.vn/Usercontrols/TVPortal.TyGia/pXML.aspx?b=10'
        );
        const [resultTyGia] = await Promise.all([xml]);

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

                dataCode(res, finalRes);
            }
        );
    }
}

module.exports = new ServicesController();
