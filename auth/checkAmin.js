const User = require('../models/User')
const methods = require('../function')
const jwt = require('jsonwebtoken')
const verifyAdmin = (req, res, next) => {

  try{
    const token = req.user
    
    User.findOne({"payment.email": token.email}, (err, user) => {
      if(err) methods.errCode1(res, err)

      if(user){
        if(user.payment.rule === "admin"){
          next()
        }else{
          methods.errCode2(res, `User is not support with this service. Please use other service`)
        }
      }else{
        methods.errCode2(res, `User is not valid with gmail = ${token.email}`)
      }
    })
  }
  catch(err){
    return res.status(401).send("Can not get token for check verifyAdminin")
  } 
}

module.exports = verifyAdmin
