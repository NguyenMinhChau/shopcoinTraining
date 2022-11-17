const nodemailer = require('nodemailer');
const Binance = require('node-binance-api');
const { APIKEYSOCKET, APISECRETSOCKET } = process.env;
const rateLimit = require('express-rate-limit');

const TelegramBot = require('node-telegram-bot-api');

const { BOT_TELEGRAM_TOKEN, URL_API } = process.env;

const bot = new TelegramBot(BOT_TELEGRAM_TOKEN, { polling: true });


let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN_MAIL
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
        let precision = 5;
        let factor = Math.pow(10, precision);
        return Math.round(number * factor) / factor;
    }, 
    bot

};
