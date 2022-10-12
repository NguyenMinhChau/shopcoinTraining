const nodemailer = require('nodemailer');
const Binance = require('node-binance-api');
const { APIKEYSOCKET, APISECRETSOCKET } = process.env;
const rateLimit = require('express-rate-limit');

let transporter = nodemailer.createTransport({
    host: process.env.HOST,
    port: process.env.PORT_MAIL,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

const appLimit = rateLimit({
    windowMs: 10 * 1000, // 1 minutes
    max: 2,
    handler: function (req, res) {
        res.status(429).send({
            status: 500,
            message: 'Too many requests!'
        });
    }
});

module.exports = {
    errCode1: function (res, err) {
        return res.json({ code: 1, message: err.message });
    },

    errCode2: function (res, err) {
        return res.json({ code: 2, message: err });
    },

    successCode: function (res, message) {
        return res.json({ code: 0, message: message });
    },

    dataCode: function (res, data) {
        return res.json({ code: 0, message: 'Successfully !!!', data: data });
    },

    mail: function (email, message, subject) {
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: subject,
            text: message
        };
        let p = new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    reject(err);
                }
                resolve({ code: 0, message: 'Send Mail successfully' });
            });
        });

        return p;
    },

    getBinance: function (req, res) {
        const binance = new Binance().options({
            APIKEY: APIKEYSOCKET,
            APISECRET: APISECRETSOCKET
        });
        return binance;
    },

    getSocket: function (req, res) {
        const io = req.app.get('conn');
        return io;
    },

    appLimit
};
