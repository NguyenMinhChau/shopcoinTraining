//import lib

const bcrypt = require('bcrypt')
const { validationResult } = require('express-validator')
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator')
const path = require('path')
const fs = require('fs')
const jwt_decoded = require('jwt-decode')

const methods = require('../function')

// import model

const User = require('../models/User')
const Coins = require('../models/Coins')
const Payments = require('../models/Payments')
const Withdraws = require('../models/Withdraws')
const Deposits = require('../models/Deposits')
const Bills = require('../models/Bills');
const Rank = require('../models/Ranks');
const { mail } = require('../function');
// support function
// error
function errCode1(res, err) {
  return res.status(404).json({ code: 1, message: err.message })
}

function errCode2(res, err) {
  return res.status(400).json({ code: 2, message: err })
}

function successCode(res, mess) {
  return res.json({ code: 0, message: mess })
}


// check balance is good for paying
function checkWallet(balance, payment) {
  return balance > payment
}

function buyCoin(req, res, fee, gmailUser, amount, amountUsd, symbol, price, type, typeUser, rank, coins, user) {
  const balance = user.Wallet.balance

  if (checkWallet(balance, amount * price)) {
    let new_fee = 0
    let fee_rank = 0

    if (rank == "Demo") {
      fee_rank = 0
      new_fee = parseFloat(fee) - parseFloat(fee_rank)
    }
    else if (rank == "Standard") {
      fee_rank = 0
      new_fee = parseFloat(fee) - parseFloat(fee_rank)
    }
    else if (rank == "Pro") {
      fee_rank = 0.01
      new_fee = parseFloat(fee) - parseFloat(fee_rank)
    }
    else if (rank == "VIP") { // for rank VIP
      fee_rank = 0.02
      new_fee = parseFloat(fee) - parseFloat(fee_rank)
    }
    const newBill = new Bills({
      fee: new_fee,
      buyer: {
        typeUser: typeUser,
        gmailUSer: gmailUser,
        rank: rank,
      },
      amount: amount,
      amountUsd: amountUsd,
      symbol: symbol,
      price: price,
      type: type,
    });
    newBill.save()
      .then(bill => {
        return res.json({ code: 0, message: "Đã mua coin thành công đợi chờ xét duyệt", billInfo: bill })
      })
      .catch(err => {
        return res.json({ code: 1, message: err.message })
      })
  } else {
    return res.json({ code: 3, message: "Số tiền trong tài khoản của bạn hiện tại không đủ để thực hiện việc mua coin, vui lòng nạp thêm vào !!!" })
  }

}

function sellCoin(req, res, fee, gmailUser, amount, amountUsd, symbol, price, type, typeUser, rank, coins, user) {

  const balance = user.Wallet.balance

  let new_fee = 0
  let fee_rank = 0

  if (rank == "Demo") {
    fee_rank = 0
    new_fee = parseFloat(fee) - parseFloat(fee_rank)
  }
  else if (rank == "Standard") {
    fee_rank = 0
    new_fee = parseFloat(fee) - parseFloat(fee_rank)
  }
  else if (rank == "Pro") {
    fee_rank = 0.01
    new_fee = parseFloat(fee) - parseFloat(fee_rank)
  }
  else if (rank == "VIP") { // for rank VIP
    fee_rank = 0.02
    new_fee = parseFloat(fee) - parseFloat(fee_rank)
  }

  const newBill = new Bills({
    fee: new_fee,
    buyer: {
      gmailUSer: gmailUser,
    },
    amount: amount,
    amountUsd: amountUsd,
    symbol: symbol,
    price: price,
    type: type,
  });

  newBill.save()
    .then(bill => {
      return res.json({ code: 0, infoBill: bill })
    })
    .catch(err => {
      return res.json({ code: 1, message: err.message })
    })
}

function addCoin(req, res, fee, gmailUser, amount, amountUsd, symbol, price, type, typeUser, rank, coins, user) {
  if (rank == "Demo") {
    return res.json({ fee, gmailUser, amount, amountUsd, symbol, price, type, typeUser, rank, coins })
  }
  else if (rank == "Standard") {
    const newBill = new Bills({
      fee: fee,
      buyer: {
        gmailUSer: gmailUser,
      },
      amount: amount,
      amountUsd: amountUsd,
      symbol: symbol,
      price: price,
      type: type,
    });

    newBill.save()
      .then(bill => {
        return res.json({ code: 0, message: "Đăng ký trừ coin thành công !!! Vui lòng chờ đợi !!!" })
      })
      .catch(err => {
        return res.json({ code: 1, message: err.message })
      })
  }
  else if (rank == "Pro") {
    return res.json({ fee, gmailUser, amount, amountUsd, symbol, price, type, typeUser, rank, coins })
  }
  else { // for rank VIP
    return res.json({ fee, gmailUser, amount, amountUsd, symbol, price, type, typeUser, rank, coins })
  }
}

function subCoin(req, res, fee, gmailUser, amount, amountUsd, symbol, price, type, typeUser, rank, coins, user) {
  if (rank == "Demo") {
    return res.json({ fee, gmailUser, amount, amountUsd, symbol, price, type, typeUser, rank, coins })
  }
  else if (rank == "Standard") {
    const newBill = new Bills({
      fee: fee,
      buyer: {
        gmailUSer: gmailUser,
      },
      amount: amount,
      amountUsd: amountUsd,
      symbol: symbol,
      price: price,
      type: type,
    });

    newBill.save()
      .then(bill => {
        if (bill) {
          return res.json({ code: 0, message: "Đăng ký trừ coin thành công !!! Vui lòng chờ đợi !!!" })
        } else {
          return res.status(404).json({ code: 3, message: "Bill is not saved !!" })
        }
      })
      .catch(err => {
        return res.json({ code: 1, message: err.message })
      })
  }
  else if (rank == "Pro") {
    return res.json({ fee, gmailUser, amount, amountUsd, symbol, price, type, typeUser, rank, coins })
  }
  else { // for rank VIP
    return res.json({ fee, gmailUser, amount, amountUsd, symbol, price, type, typeUser, rank, coins })
  }
}

// function test

// add coin is exist
function addCoinExist(user, amount, position) {
  let p = new Promise((resolve, reject) => {
    user.coins[position].amount = parseFloat(user.coins[position].amount) + parseFloat(amount)
    user.save()
      .then(u => {
        if (u) {
          resolve({ code: 0, message: `Successfully !!! Saved information of user with id = ${user._id}` })
        } else {
          reject({ code: 2, message: `Can not save the information of user with id = ${user._id}` })
        }
      })
      .catch(err => {
        reject({ code: 1, message: err.message })
      })
  })
  return p
}

// add coin is not exist
function addCoinNotExist(user, coin, amount) {
  let p = new Promise((resolve, reject) => {
    user.coins.push({
      amount: amount,
      _id: coin._id,
      name: coin.fullName,
    })
    user.save()
      .then(u => {
        if (u) {
          resolve({ code: 0, message: `successfully, add new coin for user with id = ${user._id}` })
        } else {
          reject({ code: 2, message: `User balance is not saved with id = ${user._id}` })
        }
      })
      .catch(err => {
        reject({ code: 1, message: err.message })
      })
  })
  return p
}


// subCoinDisappear
function subCoinDisappear(coin, user, afterAmount) {
  let p = new Promise((resolve, reject) => {
    const newCoinList = user.coins.filter(object => {
      return !coin._id.equals(object._id)
    })

    user.coins = newCoinList
    user.save()
      .then(u => {
        if (u) {
          resolve({ code: 0, message: `Saved the information of user with id = ${user._id}` })
        } else {
          reject({ code: 2, message: `Can not save the information of user with id = ${user._id}` })
        }
      })
      .catch(err => {
        reject({ code: 1, message: err.message })
      })
  })
  return p

}


// subCoinNotDisappear
function subCoinNotDisappear(user, afterAmount, position) {
  let p = new Promise((resolve, reject) => {
    user.coins[position].amount = afterAmount
    user.save()
      .then(u => {
        if (u) {
          resolve({ code: 0, message: `Saved information of user with id = ${user._id}` })
        } else {
          reject({ code: 2, message: `Can not save the information of user with id = ${user._id}` })
        }
      })
      .catch(err => {
        reject({ code: 1, message: err.message })
      })
  })
  return p

}

// [PUT] handleBuyCoin

function handleAddCoinAuto(symbol, amount, user) {
  let p = new Promise((resolve, reject) => {
    Coins.findOne({ symbol: symbol }, (err, coin) => {
      if (err) reject({ code: 1, message: err.message })

      if (coin) {
        let tmp = ""
        let positionTEMP = 0
        for (let i = 0; i < user.coins.length; i++) {
          if (coin._id.equals(user.coins[i]._id)) {
            tmp = coin._id
            positionTEMP = i
          }
        }

        if (tmp != "") {
          let resultAddCoinExist = addCoinExist(user, amount, positionTEMP)
          resultAddCoinExist
            .then(a => {
              resolve({ code: 0, message: `Successfully !!! Add coin to user with id = ${user._id}` })
            })
            .catch(err => {
              reject({ code: 1, message: err.message })
            })
        } else {
          let resultAddCoinNotExist = addCoinNotExist(user, coin, amount)
          resultAddCoinNotExist
            .then(res => {
              console.log(res)
              resolve({ code: 0, message: `Successfully !!! Add coin coin to user with id = ${user._id}` })
            })
            .catch(err => {
              reject({ code: 1, message: err.message })
            })
        }
      } else {
        reject({ code: 2, message: `Coin is not exist with symbol = ${symbol}` })
      }
    })
  })
  return p
}

function handleSubCoinAuto(symbol, amount, user) {
  let p = new Promise((resolve, reject) => {
    Coins.findOne({ symbol: symbol }, (err, coin) => {
      if (err) reject({ code: 1, message: err.message })

      if (coin) {
        let positionTemp = 0
        for (let i = 0; i < user.coins.length; i++) {
          if (coin._id.equals(user.coins[i]._id)) {
            positionTemp = i
          }
        }
        
        if(user.coins[positionTemp]){
          let currAmount = parseFloat(user.coins[positionTemp].amount)
          let subAmount = parseFloat(amount)
  
          let afterAmount = parseFloat(currAmount - subAmount)
  
          if (afterAmount > 0) {
            let resultSubCoinNotDisappear = subCoinNotDisappear(user, afterAmount, positionTemp)
            resultSubCoinNotDisappear
              .then(ress => {
                resolve({ code: 0, message: `Sub coin Successfully when cancel buy coin of user with id = ${user._id}` })
              })
              .catch(err => {
                reject({ code: 1, message: err.message })
              })
          } else if (afterAmount == 0) {
            let resultSubCoinDisappear = subCoinDisappear(coin, user, afterAmount)
            resultSubCoinDisappear
              .then(ress => {
                resolve({ code: 0, message: `Sub coin Successfully when cancel buy coin !!! of user with id = ${user._id}` })
              })
              .catch(err => {
                reject({ code: 1, message: err.message })
              })
          } else {
            reject({ code: 2, message: `The amount of coin want to sell is not true, own is: ${currAmount} and sell is: ${subAmount}` })
          }
        }else{
          reject({code: 1, message: `This coin is not valid in this user`})
        }

      } else {
        reject({ code: 2, message: `Coin is not exist` })
      }
    })
  })

  return p
}


class AdminController {


  // ---------------------------------------------services-------------------------------------------------

  // [GET] /admin/getAllUser
  async getAllUser(req, res) {
    const pages = req.query.page || 1
    const typeShow = req.query.show || 10
    const step = typeShow * pages - typeShow

    // User.find({}, async (err, admin) => {
    //   if (err) {
    //     errCode1(res, err)
    //   }

    //   if (admin) {
    //     // User.find({}, async (err, uss) => {
    //     //   if (err) {
    //     //     return res.status(404).json({ code: 1, message: err.message })
    //     //   }
    //     // })
    //     let total = User.countDocuments()
    //     const [totalAll] = await Promise.all([total])
    //     return res.json({ code: 0, dataUser: admin, page: pages, typeShow: typeShow, total: totalAll })
    //   } else {
    //     errCode2(res, "No user")
    //   }
    // })
    //   .sort({ createAt: 'desc'})
    //   .limit(typeShow)
    //   .skip(step)
    const total = User.countDocuments()
    const allUser = User.find()
      .sort({ createAt: 'desc' })
      .skip(step)
      .limit(typeShow)
    const [totalUser, all] = await Promise.all([total, allUser])
    return res.json({ code: 0, dataUser: all, page: pages, typeShow: typeShow, total: totalUser })

  }

  // [DELETE] /admin/deleteUser/:id
  deleteUser(req, res) {
    const { id } = req.params
    User.findById(id, (err, user) => {
      if (err) errCode1(res, err)

      if (user) {
        User.deleteOne({ _id: id })
          .then(() => {
            successCode(res, `Delete user successfully with id = ${id}`)
          })
          .catch(err => {
            errCode1(res, err)
          })
      } else {
        errCode2(res, `User is not valid with id = ${id}`)
      }
    })
  }

  // [GET] /admin/getUser/:id
  getUser(req, res) {
    const { id } = req.params
    User.findById(id, (err, user) => {
      if (err) errCode1(res, err)

      if (user) {
        methods.dataCode(res, user)
      } else {
        errCode2(res, `User is not valid with id = ${id}`)
      }
    })
  }


  // [GET] /admin/getAllPayments
  getAllPayments(req, res) {
    const pages = req.query.page || 1
    const typeShow = req.query.show || 10
    const step = parseInt(pages - 1) * parseInt(typeShow)

    Payments.find({}, (err, payments) => { // total payment in page
      if (err) {
        errCode1(res, err)
      }
      if (payments) {

        Payments.find({}, (err, ps) => { // for total payment
          if (err) {
            errCode1(res, err)
          }

          return res.json({ code: 0, dataUser: payments, page: pages, typeShow: typeShow, total: ps.length })
        })

      } else {
        errCode2(res, "No payments")
      }
    })
      .sort({ createAt: -1, updateAt: -1 })
      .limit(typeShow)
      .skip(step)
  }

  // [GET] /admin/getPayment/:id
  getPayment(req, res) {
    const { id } = req.params
    Payments.findById(id, (err, p) => {
      if (err) {
        errCode1(res, err)
      }

      if (p) {
        return res.json({ code: 0, message: "Success", data: p })
      } else {
        errCode2(res, `Payment is not valid with id = ${id}`)
      }
    })
  }

  // [GET] /admin/getWithdraw/:id
  getWithdraw(req, res) {
    const { id } = req.params
    Withdraws.findById(id, (err, p) => {
      if (err) {
        errCode1(res, err)
      }

      if (p) {
        return res.json({ code: 0, message: "Success", data: p })
      } else {
        errCode2(res, `Payment is not valid with id = ${id}`)
      }
    })
  }

  // [GET] /admin/getDeposit/:id
  getDeposit(req, res) {
    const { id } = req.params
    Deposits.findById(id, (err, p) => {
      if (err) {
        errCode1(res, err)
      }

      if (p) {
        return res.json({ code: 0, message: "Success", data: p })
      } else {
        errCode2(res, `Deposit is not valid with id = ${id}`)
      }
    })
  }

  // [GET] /admin/getAllWithdraw
  getAllWithdraw(req, res) {
    const pages = req.query.page || 1
    const typeShow = req.query.show || 10
    const step = parseInt(pages - 1) * parseInt(typeShow)

    Withdraws.find({}, (err, withdraws) => {
      if (err) {
        errCode1(res, err)
      }
      if (withdraws) {

        Withdraws.find({}, (err, wds) => {
          if (err) {
            errCode1(res, err)
          }

          return res.json({ code: 0, dataWithdraw: withdraws, page: pages, typeShow: typeShow, total: wds.length })

        })

      } else {
        errCode2(res, "No withdraw")
      }
    })
      .sort({ createAt: -1, updateAt: -1 })
      .limit(typeShow)
      .skip(step)
  }

  // [GET] /admin/getAllDeposit
  getAllDeposit(req, res) {
    const pages = req.query.page || 1
    const typeShow = req.query.show || 10
    const step = parseInt(pages - 1) * parseInt(typeShow)

    Deposits.find({}, (err, deposits) => {
      if (err) {
        errCode1(res, err)
      }
      if (deposits) {

        Deposits.find({}, (err, wds) => {
          if (err) {
            errCode1(res, err)
          }

          return res.json({ code: 0, dataDeposit: deposits, page: pages, typeShow: typeShow, total: wds.length })

        })

      } else {
        errCode2(res, "No Deposit")
      }
    })
      .sort({ createAt: -1, updateAt: -1 })
      .limit(typeShow)
      .skip(step)
  }

  // [PUT] /admin/updatePayment/:id
  updatePayment(req, res) {
    let date = new Date().toUTCString()
    const { id } = req.params
    Payments.findById(id, (err, payment) => {
      if (err) {
        errCode1(res, err)
      }
      else {
        if (payment) {
          req.body.updateAt = date
          payment.update({ $set: req.body })
            .then(p => {
              if (p) {
                successCode(res, `Update payment successfully with id = ${id}`)
              } else {
                errCode2(res, `Can not update payment with id = ${id}`)
              }
            })
            .catch(err => {
              errCode1(res, err)
            })
        } else {
          errCode2(res, `Payment is not valid with id = ${id}`)
        }
      }
    })
  }

  // [DELETE] /admin/deletePayment/:id
  deletePayment(req, res) {
    const { id } = req.params
    Payments.findById(id, (err, payment) => {
      if (err) {
        return res.json({ code: 1, message: err.message })
      }
      if (payment) {
        Payments.deleteOne({ _id: id }, (err) => {
          if (err) return res.json({ code: 3, message: err.message })
          return res.json({ code: 0, message: "Delete payment success with id = " + id })

        })
      } else {
        return res.json({ code: 2, message: "No payment is valid !!!" })
      }
    })
  }

  // [PUT] /admin/updateWithdraw/:id
  updateWithdraw(req, res) {
    let date = new Date().toUTCString()
    const id = req.params.id
    Withdraws.findById(id, (err, withdraw) => {
      if (err) {
        errCode1(res, err)
      }
      else {
        req.body.updateAt = date
        withdraw.updateOne({ $set: req.body })
          .then(p => {
            if (p) {
              successCode(res, `Update successfully with id = ${id}`)
            } else {
              errCode2(res, `Update failed with id = ${id}`)
            }
          })
          .catch(err => {
            errCode1(res, err)
          })
      }
    })
  }

  // [DELETE] /admin/deleteWithdraw/:id
  deleteWithdraw(req, res) {
    const { id } = req.params
    Withdraws.findById(id, (err, withdraw) => {
      if (err) {
        errCode1(res, err)
      }
      if (withdraw) {
        Withdraws.deleteOne({ _id: id }, (err) => {
          if (err) errCode1(res, err)
          successCode(res, `Delete withdraw success with id = ${id}`)

        })
      } else {
        errCode2(res, `No withdraw with id = ${id}`)
      }
    })
  }

  // [PUT] /admin/updateDeposit/:id
  updateDeposit(req, res) {
    const id = req.params.id
    let date = new Date().toUTCString()
    Deposits.findById(id, (err, deposit) => {
      if (err) {
        return res.json({ code: 1, message: err.message })
      }
      else {
        req.body.updateAt = date
        deposit.updateOne({ $set: req.body })
          .then(p => {
            if (p) {
              successCode(res, `Update successfully with id = ${id}`)
            } else {
              errCode2(res, `Update failed with id = ${id}`)
            }
          })
          .catch(err => {
            errCode1(res, err)
          })
      }
    })
  }

  // [DELETE] /admin/deleteDeposit/:id
  deleteDeposit(req, res) {
    const { id } = req.params
    Deposits.findById(id, (err, deposit) => {
      if (err) {
        errCode1(res, err)
      }
      if (deposit) {
        Deposits.deleteOne({ _id: id }, (err) => {
          if (err) errCode1(res, err)
          successCode(res, `Delete deposit success with id = ${id}`)

        })
      } else {
        errCode2(res, `Deposit is not valid with id = ${id}`)
      }
    })
  }


  // [POST] /admin/withdraw
  withdraw(req, res) {
    let result = validationResult(req)
    if (result.errors.length === 0) {

      const codeWithdraw = otpGenerator.generate(20, { upperCaseAlphabets: false, specialChars: false });

      const { amount, amountUsd, amountVnd, symbol } = req.body

      const newWithdraw = new Withdraws({
        code: codeWithdraw,
        amount: amount,
        amountUsd: amountUsd,
        amountVnd: amountVnd,
        symbol: symbol,
      })

      newWithdraw.save()
        .then(withdraw => {
          return res.json({ code: 0, data: withdraw })
        })
        .catch(err => {
          errCode1(res, err)
        })

    } else {
      let messages = result.mapped()
      let message = ''
      for (let m in messages) {
        message = messages[m]
        break
      }
      return res.json({ code: 1, message: message.msg })
    }

  }

  // [POST] /admin/payment
  payment(req, res) {
    let result = validationResult(req)
    if (result.errors.length === 0) {

      const codePayment = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
      const { methodName, accountName, accountNumber, rateDeposit, rateWithdraw } = req.body
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
          return res.json({ code: 0, data: payment })
        })
        .catch(err => {
          errCode1(res, err)
        })

    } else {
      let messages = result.mapped()
      let message = ''
      for (let m in messages) {
        message = messages[m]
        break
      }
      return res.json({ code: 1, message: message.msg })
    }

  }

  // [POST] /admin/deposit
  deposit(req, res) {

    const codeDeposit = otpGenerator.generate(10, { upperCaseAlphabets: false, specialChars: false });
    const { amount, user, amountUsd, amountVnd, symbol } = req.body

    if (amount == "" || user == "" || amountUsd == "" || amountVnd == "" || symbol == "" ||
      !amount || !user || !amountUsd || !amountVnd || !symbol || !req.file) {
      return res.json({ code: 2, message: "Please enter fields" })
    }

    let file1 = req.file
    let name1 = file1.originalname
    let destination = file1.destination
    let newPath1 = path.join(destination, Date.now() + "-" + name1)

    let typeFile = file1.mimetype.split('/')[0]

    if (typeFile == "image") {

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
          return res.json({ code: 0, data: deposit })
        })
        .catch(err => {
          errCode1(res, err)
        })
    } else {
      return res.json({ code: 2, message: "Please upload image" })
    }

  }

  // [GET] /admin/getAllSell
  getAllSell(req, res) {
    const pages = req.query.page || 1
    const typeShow = req.query.show || 10
    const step = parseInt(pages - 1) * parseInt(typeShow)
    const query = {
      type: "SellCoin"
    }
    Bills.find({}, (err, bill) => {
      if (err) {
        errCode1(res, err)
      }
      if (bill) {

        Bills.find(query, (err, wds) => {
          if (err) {
            return res.status(404).json({ code: 3, message: err.message })
          }
          return res.json({ code: 0, sells: bill, page: pages, typeShow: typeShow, total: wds.length })

        })


      } else {
        errCode2(res, "No bill of type sell")
      }
    })
      .sort({ createAt: -1, updateAt: -1 })
      .limit(typeShow)
      .skip(step)
  }

  // [GET] /admin/getAllBuy
  getAllBuy(req, res) {
    const pages = req.query.page || 1
    const typeShow = req.query.show || 10
    const step = parseInt(pages - 1) * parseInt(typeShow)
    const query = {
      type: "BuyCoin"
    }
    Bills.find({}, (err, bill) => {
      if (err) {
        errCode1(res, err)
      }
      if (bill) {

        Bills.find(query, (err, wds) => {
          if (err) {
            return res.status(404).json({ code: 3, message: err.message })
          }
          return res.json({ code: 0, sells: bill, page: pages, typeShow: typeShow, total: wds.length })

        })


      } else {
        errCode2(res, "No bill of type Buy")
      }
    })
      .sort({ createAt: -1, updateAt: -1 })
      .limit(typeShow)
      .skip(step)
  }

  // [GET] /admin/getSell/:id
  getSell(req, res) {
    const { id } = req.params
    const query = {
      _id: id,
      type: "SellCoin"
    }
    Bills.findOne(query, (err, bill) => {
      if (err) errCode1(res, err)

      if (bill) {
        return res.json({ code: 0, message: "successfully", data: bill })
      } else {
        errCode2(res, `Biên bán coin này không tồn tại với id = ${id}`)
      }
    })
  }

  // [GET] /admin/getBuy/:id
  getBuy(req, res) {
    const { id } = req.params
    const query = {
      _id: id,
      type: "BuyCoin"
    }
    Bills.findOne(query, (err, bill) => {
      if (err) errCode1(res, err)

      if (bill) {
        return res.json({ code: 0, message: "successfully", data: bill })
      } else {
        errCode2(res, `Biên bán coin này không tồn tại với id = ${id}`)
      }
    })
  }

  // [PUT] /admin/handleBuyCoin/:id
  handleBuyCoin(req, res) {
    const { id } = req.params
    const { status } = req.body

    if (status === "Confirmed") {
      const query = {
        _id: id,
        status: "On hold",
        type: "BuyCoin",
      }

      Bills.findOne(query, (err, bill) => {
        if (err) return res.status(404).json({ code: 1, message: err.message })

        if (bill) {
          let emailUser = bill.buyer.gmailUSer
          User.findOne({ 'payment.email': emailUser }, (err, user) => {
            if (err) return res.status(404).json({ code: 1, message: err.message })

            if (user) {
              let prepare = {
                id: bill._id,
                amount: bill.amount,
                symbol: bill.symbol,
                fee: bill.fee,
                price: bill.price,
              }
              let result = handleAddCoinAuto(prepare.symbol, prepare.amount, user)
              result
                .then(val => {
                  user.Wallet.balance = parseFloat(user.Wallet.balance) - parseFloat(prepare.amount) * parseFloat(prepare.price) * (1 + parseFloat(prepare.fee))
                  user.save()
                    .then(u => {
                      if (u) {
                        bill.status = status
                        bill.save()
                          .then(b => {
                            if (b) {
                              successCode(res, `Confirmed the bill with type buyCoin successfully with id = ${prepare.id}`)
                            } else {
                              errCode2(res, `Bill status is not save with id = ${prepare.id}`)
                            }
                          })
                          .catch(err => {
                            errCode1(res, err)
                          })
                      } else {
                        errCode2(res, `Can not save sub the balance of user with id = ${user._id}`)
                      }
                    })
                    .catch(err => {
                      errCode1(res, err)
                    })
                })
                .catch(err => {
                  errCode1(res, err)
                })
            } else {
              errCode2(res, `User is not valid with id = ${user._id}`)
            }
          })
        } else {
          errCode2(res, `Bill of buy coin is not exist with id = ${id}`)
        }
      })
    } else if (status === "Canceled") {
      const query = {
        _id: id,
        status: "Confirmed",
        type: "BuyCoin",
      }

      Bills.findOne(query, (err, bill) => {
        if (err) return res.status(404).json({ code: 1, message: err.message })

        if (bill) {
          let emailUser = bill.buyer.gmailUSer
          User.findOne({ 'payment.email': emailUser }, (err, user) => {
            if (err) return res.status(404).json({ code: 1, message: err.message })

            if (user) {
              let prepare = {
                id: bill._id,
                amount: bill.amount,
                symbol: bill.symbol,
                fee: bill.fee,
                price: bill.price,
              }

              let resultCanCel = handleSubCoinAuto(prepare.symbol, prepare.amount, user)
              resultCanCel
                .then(ress => {
                  user.Wallet.balance = parseFloat(user.Wallet.balance) + parseFloat(prepare.amount) * parseFloat(prepare.price)
                  user.save()
                    .then(u => {
                      if (u) {
                        bill.status = status
                        bill.save()
                          .then(b => {
                            successCode(res, `Successfully cancel buy coin with id = ${id}`)
                          })
                          .catch(err => {
                            errCode1(req, err)
                          })
                      } else {
                        errCode2(res, `Can not save user with email ${emailUser}`)
                      }
                    })
                    .catch(err => {
                      errCode1(res, err)
                    })
                })
                .catch(err => {
                  errCode1(res, err)
                })
            } else {
              errCode2(res, `User is not valid with email = ${emailUser}`)
            }
          })
        } else {
          errCode2(res, `Bill with type buy is not valid with id = ${id}`)
        }
      })
    } else {
      const query = {
        _id: id,
        type: "BuyCoin",
      }
      Bills.findOne(query, (err, bill) => {
        if (err) errCode1(res, err)

        if (bill) {
          bill.status = status
          bill.save()
            .then(b => {
              if (b) {
                successCode(res, `Change status of bill type buyCoin with id = ${id}`)
              } else {
                errCode2(res, `Can not save status bill with id = ${id}`)
              }
            })
            .catch(err => {
              errCode1(res, err)
            })
        } else {
          errCode2(res, `Bill is not valid with id = ${id}`)
        }
      })
    }
  }

  // [PUT] /admin/handleSellCoin/:id
  handleSellCoin(req, res) {
    const { id } = req.params
    const { status } = req.body

    if (status === "Confirmed") {
      const query = {
        _id: id,
        status: "On hold",
        type: "SellCoin",
      }

      Bills.findOne(query, (err, bill) => {
        if (err) return res.status(404).json({ code: 1, message: err.message })

        if (bill) {
          let emailUser = bill.buyer.gmailUSer
          User.findOne({ 'payment.email': emailUser }, (err, user) => {
            if (err) return res.status(404).json({ code: 1, message: err.message })

            if (user) {
              let prepare = {
                id: bill._id,
                amount: bill.amount,
                symbol: bill.symbol,
                fee: bill.fee,
                price: bill.price,
              }
              let result = handleSubCoinAuto(prepare.symbol, prepare.amount, user)
              result
                .then(val => {
                  user.Wallet.balance = parseFloat(user.Wallet.balance) + parseFloat(prepare.amount) * parseFloat(prepare.price)
                  user.save()
                    .then(u => {
                      if (u) {
                        bill.status = status
                        bill.save()
                          .then(b => {
                            if (b) {
                              successCode(res, `Confirmed the bill with type sell coin successfully with id = ${prepare.id}`)
                            } else {
                              errCode2(res, `Bill status is not save with id = ${prepare.id}`)
                            }
                          })
                          .catch(err => {
                            errCode1(res, err)
                          })
                      } else {
                        errCode2(res, `Can not save sub the balance of user with id = ${user._id}`)
                      }
                    })
                    .catch(err => {
                      errCode1(res, err)
                    })
                })
                .catch(err => {
                  errCode1(res, err)
                })
            } else {
              errCode2(res, `User is not valid with id = ${user._id}`)
            }
          })
        } else {
          errCode2(res, `Bill of buy coin is not exist with id = ${id}`)
        }
      })
    } else if (status === "Canceled") {
      const query = {
        _id: id,
        status: "Confirmed",
        type: "SellCoin",
      }

      Bills.findOne(query, (err, bill) => {
        if (err) return res.status(404).json({ code: 1, message: err.message })

        if (bill) {
          let emailUser = bill.buyer.gmailUSer
          User.findOne({ 'payment.email': emailUser }, (err, user) => {
            if (err) return res.status(404).json({ code: 1, message: err.message })

            if (user) {
              let prepare = {
                id: bill._id,
                amount: bill.amount,
                symbol: bill.symbol,
                fee: bill.fee,
                price: bill.price,
              }

              let resultCanCel = handleAddCoinAuto(prepare.symbol, prepare.amount, user)
              resultCanCel
                .then(ress => {
                  user.Wallet.balance = parseFloat(user.Wallet.balance) - parseFloat(prepare.amount) * parseFloat(prepare.price)
                  user.save()
                    .then(u => {
                      if (u) {
                        bill.status = status
                        bill.save()
                          .then(b => {
                            successCode(res, `Successfully cancel sub coin with id = ${id}`)
                          })
                          .catch(err => {
                            errCode1(req, err)
                          })
                      } else {
                        errCode2(res, `Can not save user with email ${emailUser}`)
                      }
                    })
                    .catch(err => {
                      errCode1(res, err)
                    })
                })
                .catch(err => {
                  errCode1(res, err)
                })
            } else {
              errCode2(res, `User is not valid with email = ${emailUser}`)
            }
          })
        } else {
          errCode2(res, `Bill with type sell is not valid with id = ${id}`)
        }
      })
    } else {
      const query = {
        _id: id,
        type: "SellCoin",
      }

      Bills.findOne(query, (err, bill) => {
        if (err) errCode1(res, err)

        if (bill) {
          bill.status = status
          bill.save()
            .then(b => {
              if (b) {
                successCode(res, `Change status of bill type buyCoin with id = ${id}`)
              } else {
                errCode2(res, `Can not save status bill with id = ${id}`)
              }
            })
            .catch(err => {
              errCode1(res, err)
            })
        } else {
          errCode2(res, `Bill is not valid with id = ${id}`)
        }
      })
    }
  }

  // [DELETE] /admin/deleteBuy/:id
  deleteBuy(req, res) {
    const { id } = req.params
    const query = {
      _id: id,
      type: "BuyCoin"
    }

    Bills.findOne(query, (err, bill) => {
      if (err) errCode1(res, err)

      if (bill) {
        Bills.deleteOne()
          .then(() => {
            successCode(res, `Successfully! delete buy bill with id = ${id}`)
          })
          .catch(err => {
            errCode1(res, err)
          })
      } else {
        errCode2(res, `Bill is not valid with id = ${id}`)
      }

    })

  }
  // [DELETE] /admin/deleteSell/:id
  deleteSell(req, res) {
    const { id } = req.params
    const query = {
      _id: id,
      type: "SellCoin"
    }

    Bills.findOne(query, (err, bill) => {
      if (err) errCode1(res, err)

      if (bill) {
        Bills.deleteOne()
          .then(() => {
            successCode(res, `Successfully! delete sell bill with id = ${id}`)
          })
          .catch(err => {
            errCode1(res, err)
          })
      } else {
        errCode2(res, `Bill is not valid with id = ${id}`)
      }

    })

  }


  // ---------------------------------------------services-------------------------------------------------

  // [PUT] /admin/updateRankUser/:id
  updateRankUser(req, res) {
    const { id } = req.params
    let date = new Date().toUTCString()
    User.findById(id, (err, user) => {
      if (err) errCode1(res, err)

      if (user) {

        if (req.body.fee) {
          req.body.updateAt = date
          user.updateOne({ $set: req.body })
            .then(u => {
              if (u) {
                successCode(res, `Successfully! Update rank and fee of user`)
              } else {
                errCode2(res, `Can not save fee and rank of user with id = ${user._id}`)
              }
            })
            .catch(err => {
              errCode1(res, err)
            })
        } else {
          user.updateOne({ $set: req.body })
            .then(u => {
              if (u) {
                Rank.findOne({ ranks: req.body.rank }, (err, r) => {
                  if (err) errCode1(res, err)

                  if (r) {
                    user.updateAt = date
                    user.fee = r.fee
                    user.save()
                      .then(v => {
                        if (v) {
                          successCode(res, `Successfully !! Update fee and rank of user`)
                        } else {
                          errCode2(res, `Can not save fee of user with id = ${u._id}`)
                        }

                      })
                      .catch(err => {
                        errCode1(res, err)
                      })

                  } else {
                    errCode2(res, `Rank is not valid with rank = ${req.body.rank}`)
                  }
                })
              } else {
                errCode2(res, `Can not save information with user_id = ${user._id}`)
              }
            })
            .catch(err => {
              errCode1(res, err)
            })
        }
      } else {
        errCode2(res, `User is not valid with id = ${id}`)
      }
    })

  }

  // [PUT] /admin/changePWDForUser/:id
  changePWDForUser(req, res) {
    const { id } = req.params
    const { pwd } = req.body
    User.findById(id, (err, user) => {
      if (err) errCode1(res, err)

      if (user) {
        bcrypt.hash(pwd, 10)
          .then(hashed => {
            if (hashed) {
              user.payment.password = hashed
              user.save()
                .then(u => {
                  if (u) {
                    successCode(res, `Changed password of user with id = ${id}`)
                  } else {
                    errCode2(res, `Can not change password of user with = ${id}`)
                  }
                })
                .catch(err => {
                  errCode1(res, err)
                })
            } else {
              errCode2(res, `Can not hashed password = ${pwd}`)
            }
          })
          .catch(err => {
            errCode1(res, err)
          })
      } else {
        errCode2(res, `User is not valid with id = ${id}`)
      }
    })
  }

  // [PUT] /admin/refreshPWD/:id
  refreshPWD(req, res) {
    const { id } = req.params
    User.findById(id, (err, user) => {
      if (err) errCode1(res, err)

      if (user) {
        let newPWD = otpGenerator.generate(10)
        bcrypt.hash(newPWD, 10)
          .then(hashed => {
            if (hashed) {
              user.payment.password = hashed
              user.save()
                .then(u => {
                  if (u) {
                    const mailContent = `
                  This is your new password = ${newPWD}

                  Best Regards
                `
                    let resultSendMail = methods.mail(user.payment.email, mailContent, 'Refresh Passowrd')
                    resultSendMail
                      .then(val => {
                        successCode(res, `Send mail for refresh password is successfully`)
                      })
                      .catch(err => {
                        errCode1(res, err)
                      })

                  } else {
                    errCode2(res, `Can not change password of user with id =${id}`)
                  }
                })
                .catch(err => {
                  errCode1(res, err)
                })
            } else {
              errCode2(res, `Can not hash password`)
            }
          })
          .catch(err => {
            errCode1(res, err)
          })
      } else {
        errCode2(res, `User is not valid with id = ${id}`)
      }
    })
  }

  // [PUT] /admin/changeCoin/:id
  changeCoin(req, res) {
    const {id} = req.params
    const { coin, quantity } = req.body

    User.findById(id, (err, user) => {
      if (err) errCode1(res, err)

      if (user) {
        if (coin === "USDT") {
          if (quantity > 0) {
            user.Wallet.balance = parseFloat(user.Wallet.balance) + parseFloat(quantity)
            user.save()
              .then(u => {
                if (u) {
                  successCode(res, `Give USDT successfully`)
                } else {
                  errCode2(res, `Can not give USDT for user`)
                }
              })
              .catch(err => {
                errCode1(err)
              })
          } else {
            let resultSub = parseFloat(user.Wallet.balance) + parseFloat(quantity)
            if (resultSub > 0) {
              user.Wallet.balance = resultSub
              user.save()
                .then(u => {
                  if (u) {
                    successCode(res, `Give USDT successfully`)
                  } else {
                    errCode2(res, `Can not give USDT for user`)
                  }
                })
                .catch(err => {
                  errCode1(err)
                })
            } else {
              errCode2(res, `Balance of user is not enough for sub USDT with quantity = ${quantity}`)
            }

          }
        } else {
          if (quantity > 0) {
              let resultAddCoin = handleAddCoinAuto(coin, quantity, user)
              resultAddCoin
              .then(val => {
                successCode(res, `Add coin ${coin} with quantity = ${quantity} successfully to user with id = ${user._id}`)
              })
              .catch(err => {
                errCode1(res, err)
              })
          } else {
            let new_quantity = Math.abs(quantity)
            let resultSubcoin = handleSubCoinAuto(coin, new_quantity, user)
            resultSubcoin
            .then(val => {
              successCode(res, `Sub coin ${coin} with quantity = ${new_quantity} successfully to user with id = ${user._id}`)
            })
            .catch(err => {
              errCode1(res, err)
            })
          }
        }
      } else {
        errCode2(res, `User is not valid with id = ${id}`)
      }
    })
  }

  // [PUT] /admin/lockUser/:id
  lockUser(req, res){
    const {id} = req.params

    User.findById(id, (err, user) => {
      if(err) errCode1(res, err)
      if(user){ 
        user.updateOne({$set: req.body})
        .then(() => {
           successCode(res, `User is locked with id = ${id}`)
        })
        .catch(err => {
          errCode1(res, err)
        })
      }else{
        errCode2(res, `User is not valid with id = ${id}`)
      }
    })
  }

  // [PUT] /admin/unlockUser/:id
  unlockUser(req, res){
    const {id} = req.params

    User.findById(id, (err, user) => {
      if(err) errCode1(res, err)
      if(user){ 
        user.updateOne({$set: req.body})
        .then(() => {
           successCode(res, `User is unlocked with id = ${id}`)
        })
        .catch(err => {
          errCode1(res, err)
        })
      }else{
        errCode2(res, `User is not valid with id = ${id}`)
      }
    })
  }
}


module.exports = new AdminController
