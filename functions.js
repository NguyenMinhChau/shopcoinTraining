const nodemailer = require('nodemailer');

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

    precisionRound: function (number) {
        let precision = 10;
        let factor = Math.pow(10, precision);
        return Math.round(number * factor) / factor;
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
    }
};
