const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const {validationResult} = require('express-validator')
const User = require('../models/User')
const Coins = require('../models/Coins')

class UsersController{
    // [POST] /users/register
    register(req, res){
        let result = validationResult(req)
        if(result.errors.length === 0){
            const {email, password, username} = req.body
            User.findOne({email: email}, (err, user) => {
                if(err){
                    return res.json({code: 1, message: err.message})
                }
                else if(user){
                    return res.json({code: 2, message: "Email is exists"})
                }else{
                    User.findOne({username: username}, (e, u) => {
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

                                // const token = jwt.sign(
                                //     { user_id: newUser._id, email },
                                //     process.env.JWT_SECRET,
                                //     {
                                //     expiresIn: "1h",
                                //     }
                                // )
                                // // save user token
                                // newUser.token = token;
                                newUser.save()
                                .then(person => {
                                    return res.json({code: 1, token: person})
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
                bcrypt.compare(password, user.password)
                .then(match => {
                    if(match){
                        return res.json({code: 1, userInfo: user})
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

    }
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
}

module.exports = new UsersController