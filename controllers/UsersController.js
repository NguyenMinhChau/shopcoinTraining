//import lib

const bcrypt = require('bcrypt')
const {validationResult} = require('express-validator')
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator')
const path = require('path')
const fs = require('fs')

// import model

const User = require('../models/User')
const Coins = require('../models/Coins')
const Payments = require('../models/Payments')
const Withdraws = require('../models/Withdraws')
const Deposits = require('../models/Deposits')

class UsersController{
    // [POST] /users/register
    register(req, res){
        let result = validationResult(req)
        if(result.errors.length === 0){
            const {email, password, username} = req.body
            User.findOne({'payment.email': email}, (err, user) => {
                if(err){
                    return res.json({code: 1, message: err.message})
                }
                else if(user){
                    return res.json({code: 2, message: "Email is exists"})
                }else{
                    User.findOne({'payment.username': username}, (e, u) => {
                        if(e){
                            return res.json({code: 1, message: e.message})
                        }
                        else if(u){
                            return res.json({code: 2, message: "Username is exists"})
                        }
                        else{
                            bcrypt.hash(password, 10)
                            .then(hashed => {
                                const newUser = new User({
                                    payment: {
                                        email: email,
                                        username: username,
                                        password: hashed,
                                    }
                                })

                                const token = jwt.sign(
                                    { user_id: newUser._id, email },
                                    process.env.JWT_SECRET,
                                    {
                                    expiresIn: "1h",
                                    }
                                )
                                // save user token
                                // newUser.token = token;
                                newUser.save()
                                .then(person => {
                                    return res.json({code: 1, token: token, account: person})
                                })
                                .catch(err => console.log(err.message))
                            })
                        }
                    })
                }
        
            })
        }else{
            let messages = result.mapped()
            let message = ''
            for(let m in messages){
                message = messages[m]
                break
            }
            return res.json({code: 1, message: message.msg})
        }
    }

    login(req, res){
        let result = validationResult(req)
        if(result.errors.length === 0){
            const {email, password} = req.body
            User.findOne({'payment.email': email}, (err, user) => {
                if(err){
                    return res.json({code: 2, message: err.message})
                }
                if(!user){
                    return res.json({code: 2, message: "User is not exist"})
                }
                bcrypt.compare(password, user.payment.password)
                .then(match => {
                    if(match){
                        const token = jwt.sign(
                            { user_id: user._id, email },
                            process.env.JWT_SECRET,
                            {
                            expiresIn: "1h",
                            }
                        )
                        req.session.jwt = token
                        return res.json({code: 1, userInfo: user, token: req.session.jwt})
                    }else{
                        return res.json({code: 2, message: "Passowrd is wrong"})
                    }
                })
            })
        }else{
            let messages = result.mapped()
            let message = ''
            for(let m in messages){
                message = messages[m]
                break
            }
            return res.json({code: 1, message: message.msg})
        }
    }

    logout(req, res){
        req.session.destroy();
    }

    // ---------------------------------------------services-------------------------------------------------

    // [POST] /users/buyCoin
    buyCoin(req, res){
        const {symbols, amount, email} = req.body
        User.findOne({'payment.email': email}, (err, user) => {
            if(err){
                return res.json({code: 1, message: err.message})
            }
            if(!user){
                return res.json({})
            }
            Coins.findOne({symbols: symbols}, (error, coin) => {
                if(error){
                    return res.json({code: 1, message: err.message})
                }
                let tmp = ""
                let positionTEMP = 0
                for(let i = 0; i < user.coins.length; i++){
                    if(coin._id.equals(user.coins[i]._id)){
                        tmp = coin._id
                        positionTEMP = i
                    }
                }
                if(tmp != ""){
                    user.coins[positionTEMP].amount = parseInt(user.coins[positionTEMP].amount) + parseInt(amount)
                    user.save()
                    .then(ok => {
                        return res.json({code: 1, coins: ok.coins})
                    })
                    .catch(err => {
                        return res.json({code: 2, message: err.message})
                    })
                }else{
                    user.coins.push({
                        amount: amount,
                        _id: coin._id,
                        name: coin.coinName,
                    })
                    user.save()
                    .then(ok => {
                        return res.json({code: 1, coins: ok.coins})
                    })
                    .catch(err => {
                        return res.json({code: 2, message: err.message})
                    })
                }
            })
        })
    }

    // [POST] /users/withdraw
    withdraw(req, res){
        let result = validationResult(req)
        if(result.errors.length === 0){

            const codeWithdraw = otpGenerator.generate(20, { upperCaseAlphabets: false, specialChars: false });

            const {amount, amountUsd, amountVnd, symbol} = req.body

            const newWithdraw = new Withdraws({
                code: codeWithdraw,
                amount: amount,
                amountUsd: amountUsd,
                amountVnd: amountVnd,
                symbol: symbol,
            })

            newWithdraw.save()
            .then(withdraw => {
                return res.json({code: 1, data: withdraw})
            })
            .catch(err => {
                return res.json({code: 2, message: err.message})
            })

        }else{
            let messages = result.mapped()
            let message = ''
            for(let m in messages){
                message = messages[m]
                break
            }
            return res.json({code: 1, message: message.msg})
        }
        
    }

    // [POST] /users/payment
    payment(req, res){
        let result = validationResult(req)
        if(result.errors.length === 0){

            const codePayment = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
            const {methodName, accountName, accountNumber, rateDeposit, rateWithdraw} = req.body
            const newPayment = new Payments({
                code: codePayment,
                methodName: methodName,
                accountName: accountName,
                accountNumber: accountNumber,
                rateDeposit: rateDeposit,
                rateWithdraw: rateWithdraw,
            })

            newPayment.save()
            .then(payment => {
                return res.json({code: 1, data: payment})
            })
            .catch(err => {
                return res.json({code: 2, message: err.message})
            })

        }else{
            let messages = result.mapped()
            let message = ''
            for(let m in messages){
                message = messages[m]
                break
            }
            return res.json({code: 1, message: message.msg})
        }
        
    }

    // [POST] /users/deposit
    deposit(req, res){

        const codeDeposit = otpGenerator.generate(10, { upperCaseAlphabets: false, specialChars: false });
        const {amount, user, amountUsd, amountVnd, symbol} = req.body

        if(amount == "" || user == "" || amountUsd == "" || amountVnd == "" || symbol == "" || 
        !amount || !user || !amountUsd || !amountVnd || !symbol || !req.file){
            return res.json({code: 2, message: "Please enter fields"})
        }

        let file1 = req.file
        let name1 = file1.originalname
        let destination = file1.destination
        let newPath1 = path.join(destination, Date.now() + "-" + name1)

        let typeFile = file1.mimetype.split('/')[0]

        if(typeFile == "image"){

            fs.renameSync(file1.path, newPath1)
            let statement = path.join('./uploads/images', Date.now() + "-" + name1)
            
            const newDeposit = new Deposits({
                code: codeDeposit,
                amount: amount,
                user: user,
                amountUsd: amountUsd,
                amountVnd: amountVnd,
                symbol: symbol,
                statement: statement,
            })

            newDeposit.save()
            .then(deposit => {
                return res.json({code: 1, data: deposit})
            })
            .catch(err => {
                return res.json({code: 2, message: err.message})
            })
        }else{
            return res.json({code: 2, message: "Please upload image"})
        }   
        
    }

    // ---------------------------------------------services-------------------------------------------------
}

module.exports = new UsersController