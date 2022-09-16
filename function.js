const nodemailer = require('nodemailer')

let transporter = nodemailer.createTransport({
  host: process.env.HOST,
  port: process.env.PORT_MAIL,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});



module.exports = {
  errCode1: function (res, err){
    return res.status(404).json({code: 1, message: err.message})
  },

  errCode2: function (res, err){
    return res.status(400).json({code: 2, message: err})
  },

  successCode: function (res, message){
    return res.json({code: 0, message: message})
  },

  dataCode: function(res, data){
    return res.json({code: 0, message: "Successfully !!!", data: data})
  },

  mail: function (email, message, subject){
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: subject,
      text: message
    }
    let p = new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (err, info) => {
        if(err){
          reject(err)
        }
        resolve({code: 0, message: "Send Mail successfully"})
      })
    })
  
    return p
  },
}
