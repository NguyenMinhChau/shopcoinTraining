const nodemailer = require('nodemailer');
const Binance = require('node-binance-api');
const { APIKEYSOCKET, APISECRETSOCKET } = process.env;
const rateLimit = require('express-rate-limit');

const TelegramBot = require('node-telegram-bot-api');

const { BOT_TELEGRAM_TOKEN } = process.env;

const bot = new TelegramBot(BOT_TELEGRAM_TOKEN);

let transporter = nodemailer.createTransport({
    service: process.env.SERVICE_MAIL,
    host: process.env.HOST,
    port: process.env.PORT_MAIL,
    secure: false,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.MAIL_PASS
    }
});

const appLimit = rateLimit({
    windowMs: 10 * 1000, // 1 minutes
    max: 100,
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
            html: message
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

    appLimit,

    precisionRound: function (number) {
        let precision = 10;
        let factor = Math.pow(10, precision);
        return Math.round(number * factor) / factor;
    },
    bot
};
