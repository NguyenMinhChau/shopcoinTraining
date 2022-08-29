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
const Bills = require('../models/Bills')

// support function

//function support for add coin to accont
function addCoinSupport(req, res, symbols, amount, email, bill){
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
					return res.json({code: 0, infoBill: bill, coins: ok.coins})
				})
				.catch(err => {
					return res.json({code: 2, message: err.message})
				})
			}else{
				user.coins.push({
					amount: amount,
					_id: coin._id,
					name: coin.fullName,
				})
				user.save()
				.then(ok => {
					return res.json({code: 0, infoBill: bill, coins: ok.coins})
				})
				.catch(err => {
					return res.json({code: 2, message: err.message})
				})
			}


		})
	})

}

// check balance is good for paying
function checkWallet(balance, payment){
	return balance > payment
}

function buyCoin(req, res, fee, gmailUser, amount, amountUsdt, symbol, price, type, typeUser, rank, coins, user){
	const balance = user.Wallet.balance
    if(rank == "Demo"){
        return res.json({fee, gmailUser, amount, amountUsdt, symbol, price, type, typeUser, rank, coins})
    }
    else if(rank == "Standard"){
		if(checkWallet(balance, amount*price)){
			const newBill = new Bills({
			fee: fee,
				buyer: {
					gmailUSer: gmailUser,
				},
				amount: amount,
				amountUsdt: amountUsdt,
				symbol: symbol,
				price: price,
				type: type,
			});

			newBill.save()
			.then(bill => {
				user.Wallet.balance = user.Wallet.balance - amount*price
				user.save()
					.then((user) => {
						if(user){
							addCoinSupport(req, res, symbol, amount, gmailUser, bill)
						}else{
							return res.json({code: 3, message: "Không thể thực hiện việc trừ tiền tài khoản của user"})
						}
					})
					.catch(err => {
						return res.json({code: 2, message: err.message})
					})
			})
			.catch(err => {
				return res.json({code: 1, message: err.message})
			})

		}else{
			return res.json({code: 3, message: "Số tiền trong tài khoản của bạn hiện tại không đủ để thực hiện việc mua coin, vui lonfg nạp thêm vào !!!"})
		}
   }
    else if(rank == "Pro"){
        return res.json({fee, gmailUser, amount, amountUsdt, symbol, price, type, typeUser, rank, coins})
    }
    else{ // for rank VIP
        return res.json({fee, gmailUser, amount, amountUsdt, symbol, price, type, typeUser, rank, coins})
    }
}

function sellCoin(req, res, fee, gmailUser, amount, amountUsdt, symbol, price, type, typeUser, rank, coins, user){
    if(rank == "Demo"){
        return res.json({fee, gmailUser, amount, amountUsdt, symbol, price, type, typeUser, rank, coins})
    }
    else if(rank == "Standard"){
		const balance = user.Wallet.balance
		const newBill = new Bills({
		fee: fee,
			buyer: {
				gmailUSer: gmailUser,
			},
			amount: amount,
			amountUsdt: amountUsdt,
			symbol: symbol,
			price: price,
			type: type,
		});

		newBill.save()
		.then(bill => {
			user.Wallet.balance = user.Wallet.balance + amount*price
			user.save()
				.catch(err => {
					return res.json({code: 2, message: err.message})
				})
			return res.json({code: 0, infoBill: bill})
		})
		.catch(err => {
			return res.json({code: 1, message: err.message})
		})
    }
    else if(rank == "Pro"){
        return res.json({fee, gmailUser, amount, amountUsdt, symbol, price, type, typeUser, rank, coins})
    }
    else{ // for rank VIP
        return res.json({fee, gmailUser, amount, amountUsdt, symbol, price, type, typeUser, rank, coins})
    }
}

function addCoin(req, res, fee, gmailUser, amount, amountUsdt, symbol, price, type, typeUser, rank, coins, user){
    if(rank == "Demo"){
        return res.json({fee, gmailUser, amount, amountUsdt, symbol, price, type, typeUser, rank, coins})
    }
    else if(rank == "Standard"){
        return res.json({fee, gmailUser, amount, amountUsdt, symbol, price, type, typeUser, rank, coins})
    }
    else if(rank == "Pro"){
        return res.json({fee, gmailUser, amount, amountUsdt, symbol, price, type, typeUser, rank, coins})
    }
    else{ // for rank VIP
        return res.json({fee, gmailUser, amount, amountUsdt, symbol, price, type, typeUser, rank, coins})
    }
}

function subCoin(req, res, fee, gmailUser, amount, amountUsdt, symbol, price, type, typeUser, rank, coins, user){
    if(rank == "Demo"){
        return res.json({fee, gmailUser, amount, amountUsdt, symbol, price, type, typeUser, rank, coins})
    }
    else if(rank == "Standard"){
        return res.json({fee, gmailUser, amount, amountUsdt, symbol, price, type, typeUser, rank, coins})
    }
    else if(rank == "Pro"){
        return res.json({fee, gmailUser, amount, amountUsdt, symbol, price, type, typeUser, rank, coins})
    }
    else{ // for rank VIP
        return res.json({fee, gmailUser, amount, amountUsdt, symbol, price, type, typeUser, rank, coins})
    }
}

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
                                    return res.json({code: 0, token: token, account: person})
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
                        return res.json({code: 0, userInfo: user, token: req.session.jwt})
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

    // [GET] /users/getAllUser
    getAllUser(req, res){
		const pages = req.query.page || 1
		const typeShow = req.query.show || 10
        const step = parseInt(pages - 1) * parseInt(typeShow)

        User.find({}, (err, users) => {
            if(err){
                return res.json({code: 1, message: err.message})
            }

			if(users){
				return res.json({code: 0, dataUser: users, page: pages, typeShow: typeShow})
			}else{
                return res.json({code: 2, message: "No user"})
            }
        })
        .sort({createAt: -1, updateAt: -1})
        .limit(typeShow)
        .skip(step)
    }

    // [PUT] /users/changePWD/:id
	changePWD(req, res){
        const {pwd} = req.body
        const id = req.params.id
        
        User.findById(id, (err, user) => {
            if(err){
                return res.json({code: 1, message: err.message})
            }

            if(user){
                bcrypt.hash(pwd, 10)
                .then(hashed => {
                    user.payment.password = hashed
                    user.save()
                    .then(u => {
                        if(u){
                            return res.json({code: 0, message: "Change password successfully with id = " + id})
                        }else{
                            return res.json({code: 4, message: "Can not change password"})    
                        }
                    })
                    .catch(err => {
                        return res.json({code: 3, message: err.message})
                    })
                })
                .catch(err => {
                    return res.json({code: 101, message: err.message})
                })
                
            }else{
                return res.json({code: 2, message: "User is not valid !!!"})
            }
        })
	}

    // [PUT] /users/additionBankInfo/:id
    additionBankInfo(req, res){
        const {bankName, nameAccount, accountNumber} = req.body
        const id = req.params.id
        
        User.findById(id, (err, user) => {
            if(err){
                return res.json({code: 1, message: err.message})
            }

            if(user){
                let infoBank = user.payment.bank
                infoBank.bankName = bankName
                infoBank.name = nameAccount
                infoBank.account = accountNumber
                user.updateAt = new Date().toUTCString()
                user.save()
                .then(u => {
                    if(u){
                        return res.json({code: 0, message: "Add bank information successfully with id = " + id})
                    }else{
                        return res.json({code: 4, message: "Can not add information of bank"})    
                    }
                })
                .catch(err => {
                    return res.json({code: 3, message: err.message})
                })
            }else{
                return res.json({code: 2, message: "User is not valid !!!"})
            }
        })
    }

    // [GET] /users/getAllPayments
    getAllPayments(req, res){
		const pages = req.query.page || 1
		const typeShow = req.query.show || 10
		const step = parseInt(pages - 1) * parseInt(typeShow)

        Payments.find({}, (err, payments) => {
            if(err){
                return res.json({code: 1, message: err.message})
            }
            if(payments){
				return res.json({code: 0, dataUser: payments, page: pages, typeShow: typeShow})
            }else{
                return res.json({code: 2, message: "No payments"})
            }
        })
        .sort({createAt: -1, updateAt: -1})
        .limit(typeShow)
        .skip(step)
    }

	// [PUT] /users/updatePayment/:id
	updatePayment(req, res){
		const {method, name, idMethod, rateWithdraw, rateDeposit} = req.body
        const id = req.params.id
		Payments.findById(id, (err, payment) => {
            if(err){
                return res.json({code: 1, message: err.message})
            }

            if(payment){
                payment.methodName = method
                payment.accountName = name
                payment.accountNumber = idMethod
                payment.rateDeposit = rateDeposit
                payment.rateWithdraw = rateWithdraw
                payment.updateAt = new Date().toUTCString()
                payment.save()
                .then(p => {
                    if(p){
                        return res.json({code: 0, message: "Update successfully with id = " + id})
                    }else{
                        return res.json({code: 5, message: "Update failed with id = " + id})
                    }
                })
                .catch(err => {
                    return res.json({code: 4, message: err.message})
                })
            }else{
                return res.json({code: 2, message: "The payment is not valid !!"})
            }
        })
	}

	// [DELETE] /users/deletePayment/:id
	deletePayment(req, res){
		const {id} = req.params
		Payments.findById(id, (err, payment) => {
			if(err){
				return res.json({code: 1, message: err.message})
			}
			if(payment){
				Payments.deleteOne({_id: id}, (err) => {
					if(err) return res.json({code: 3, message: err.message})
					return res.json({code: 0, message: "Delete payment success with id = " + id})

				})
			}else{
				return res.json({code: 2, message: "No payment is valid !!!"})
			}
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
                return res.json({code: 0, data: withdraw})
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
                return res.json({code: 0, data: payment})
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
                return res.json({code: 0, data: deposit})
            })
            .catch(err => {
                return res.json({code: 2, message: err.message})
            })
        }else{
            return res.json({code: 2, message: "Please upload image"})
        }

    }

    // [POST] /users/servicesCoin
    servicesCoin(req, res){
        let result = validationResult(req)
        if(result.errors.length === 0){
            const {fee, gmailUser, amount, amountUsdt, symbol, price, type} = req.body
            User.findOne({'payment.email': gmailUser}, (err, user) => {
                if(err){
                    return res.json({code: 2, message: err.message})
                }
                if(!user || user == ""){
                    return res.json({code: 2, message: "Người dùng không tồn tại"})
                }

                // return res.json({code: 1, message: "OK", data: user})
                const typeUser = user.payment.rule,
                rank = user.rank,
                coins = user.coins


                if(type == "BuyCoin"){
                    buyCoin(req, res, fee, gmailUser, amount, amountUsdt, symbol, price, type, typeUser, rank, coins, user)
                }
                else if(type == "SellCoin"){
                    sellCoin(req, res, fee, gmailUser, amount, amountUsdt, symbol, price, type, typeUser, rank, coins, user)
                }
                else if(type == "AddCoin"){
                    addCoin(req, res, fee, gmailUser, amount, amountUsdt, symbol, price, type, typeUser, rank, coins, user)
                }
                else if(type == "SubCoin"){
                    subCoin(req, res, fee, gmailUser, amount, amountUsdt, symbol, price, type, typeUser, rank, coins, user)
                }
            })
            // const newBill = new Bills({
            //     fee: fee,
            //     buyer: {
            //         gmailUSer: gmailUser,
            //     },
            //     amount: amount,
            //     amountUsdt: amountUsdt,
            //     symbol: symbol,
            //     price: price,
            //     type: type,
            // });
            // return res.json({code: 1, infoBill: newBill})
            // newBill.save()
            // .then(bill => {
            //     return res.json({code: 1, infoBill: bill})
            // })
            // .catch(err => {
            //     return res.json({code: 2, message: err.message})
            // })
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

    // ---------------------------------------------services-------------------------------------------------
}

module.exports = new UsersController
