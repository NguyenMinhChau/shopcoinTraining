const Rates = require('../models/Rates');
const axios = require('axios');
const { errCode1, dataCode, errCode2, successCode } = require('../function');

const getRate = async () => {
    const p = new Promise((resolve, reject) => {
        var requestOptions = {
            method: 'GET',
            redirect: 'follow',
            headers: {
                apikey: process.env.API_KEY_RATE
            }
        };

        const base = 'USD';
        const symbols = 'VND';

        axios
            .get(
                `https://api.apilayer.com/exchangerates_data/latest?symbols=${symbols}&base=${base}`,
                requestOptions
            )
            .then((result) => result.data)
            .then((data) => {
                resolve(data);
            })
            .catch((err) => reject(err));
    });
    return p;
};

class RatesController {
    // [POST] /rates/add/:rates
    add(req, res) {
        const newRate = new Rates(req.body);
        newRate
            .save()
            .then((result) => {
                dataCode(res, result);
            })
            .catch((err) => {
                errCode1(res, err);
            });
    }

    // [GET] /rates/getRateById/:id
    async getRateById(req, res) {
        const { id } = req.params;
        Rates.findById(id, (err, rate) => {
            if (err) errCode1(res, err);

            if (rate) {
                const update = rate.updatedAt;
                const datePre = new Date(update);
                const date = new Date();

                if (datePre < date) {
                    const year = date.getFullYear();
                    const month = date.getMonth() + 1;
                    const day = date.getDate();
                    const yearPre = datePre.getFullYear();
                    const monthPre = datePre.getMonth() + 1;
                    const dayPre = datePre.getDate();

                    if (year == yearPre && month == monthPre) {
                        if (day > dayPre) {
                            getRate()
                                .then((result) => {
                                    rate.rate = result.rates.VND;
                                    rate.updatedAt = date;
                                    rate.save()
                                        .then((result) => {
                                            successCode(
                                                res,
                                                `Update successfully rate with id = ${id}`
                                            );
                                        })
                                        .catch((err) => {
                                            errCode1(res, err);
                                        });
                                })
                                .catch((err) => {
                                    errCode1(res, err);
                                });
                        } else {
                            return res.json('Vẫn nằm trong ngày');
                        }
                    } else if (year == yearPre && month > monthPre) {
                        getRate()
                            .then((result) => {
                                rate.rate = result.rates.VND;
                                rate.updatedAt = date;
                                rate.save()
                                    .then((result) => {
                                        successCode(
                                            res,
                                            `Update successfully rate with id = ${id}`
                                        );
                                    })
                                    .catch((err) => {
                                        errCode1(res, err);
                                    });
                            })
                            .catch((err) => {
                                errCode1(res, err);
                            });
                    } else if (year > yearPre) {
                        getRate()
                            .then((result) => {
                                rate.rate = result.rates.VND;
                                rate.updatedAt = date;
                                rate.save()
                                    .then((result) => {
                                        successCode(
                                            res,
                                            `Update successfully rate with id = ${id}`
                                        );
                                    })
                                    .catch((err) => {
                                        errCode1(res, err);
                                    });
                            })
                            .catch((err) => {
                                errCode1(res, err);
                            });
                    }
                } else {
                    return res.json('date updated at is not in the past');
                }
            } else {
                errCode2(res, `No rate with id = ${id}`);
            }
        });
    }
}

module.exports = new RatesController();
