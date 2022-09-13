const Users = require('../models/User')
const Bills = require('../models/Bills')
const fs = require('fs')
const Path = require('path')

// support function

function rename_file(oldPath, newPath){
    let p = new Promise((resolve, reject) => {
        fs.rename(oldPath, newPath, (err) => {
            if(err) reject({code: 1, message: "Failed"})
            resolve({
                code: 0,
                message: "Success"
            })
        })
        
    })
    return p
}

function checkWallet(balance, payment) {
    return balance > payment
}

function buyCoin(req, res, fee, gmailUser, amount, amountUsdt, symbol, price, type, typeUser, rank, coins, user) {
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
        amountUsdt: amountUsdt,
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

function sellCoin(req, res, fee, gmailUser, amount, amountUsdt, symbol, price, type, typeUser, rank, coins, user) {

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
        amountUsdt: amountUsdt,
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

class UsersController{

    // [PUT] /users/uploadImage/:id
    async uploadImage(req, res){
        const {id} = req.params
        let date = Date.now()
        Users.findById(id, async (err, user) => {
            if(err) return res.status(404).json({code: 1, message: err.message})

            if(user){
                const {cccdFont,
                    cccdBeside,
                    licenseFont,
                    licenseBeside} 
                    = req.files

                const email = user.payment.email
                
                const destination = cccdFont[0].destination

                const nameIamgeCCCDFont = cccdFont[0].originalname
                const nameIamgeCccdBeside = cccdBeside[0].originalname
                const nameIamgeLicenseFont = licenseFont[0].originalname
                const nameIamgeLicenseBeside = licenseBeside[0].originalname

                const pathIamgeCCCDFont = cccdFont[0].path
                const pathIamgeCccdBeside = cccdBeside[0].path
                const pathIamgeLicenseFont = licenseFont[0].path
                const pathIamgeLicenseBeside = licenseBeside[0].path

                const newPathIamgeCCCDFont = Path.join(destination, date + '-' + email + '-' + nameIamgeCCCDFont)
                const newPathIamgeCccdBeside = Path.join(destination, date + '-' + email + '-' + nameIamgeCccdBeside)
                const newPathIamgeLicenseFont = Path.join(destination, date + '-' + email + '-' + nameIamgeLicenseFont)
                const newPathIamgeLicenseBeside = Path.join(destination, date + '-' + email + '-' + nameIamgeLicenseBeside)
                
                let result1 = await rename_file(pathIamgeCCCDFont, newPathIamgeCCCDFont)
                let result2 = await rename_file(pathIamgeCccdBeside, newPathIamgeCccdBeside)
                let result3 = await rename_file(pathIamgeLicenseFont, newPathIamgeLicenseFont)
                let result4 = await rename_file(pathIamgeLicenseBeside, newPathIamgeLicenseBeside)
                console.log(result1, result2, result3, result4)

                if(result1.code == 0 && result2.code == 0 && result3.code == 0 && result4.code == 0){
                    user.uploadCCCDFont = newPathIamgeCCCDFont
                    user.uploadCCCDBeside = newPathIamgeCccdBeside
                    user.uploadLicenseFont = newPathIamgeLicenseFont
                    user.uploadLicenseFont = newPathIamgeLicenseBeside

                    user.save()
                    .then(u => {
                        return res.json({code: 0, message: `Success !! updated images with id = ${id}`})
                    })
                    .catch(err => {
                        return res.status(400).json({code: 4, message: "Cập nhật thông tin hình ảnh có lỗi khi lưu trên database"})    
                    })
                }else{
                    return res.json({message: result1.message})
                }
            }else{
                return res.status(400).json({code: 2, message: `User is not valid with id = ${id}`})
            }
        })
    }

    // [POST] /users/BuyCoin/
    BuyCoin(req, res){
        const { gmailUser, amount, amountUsdt, symbol, price, type } = req.body
        Users.findOne({ 'payment.email': gmailUser }, (err, user) => {
            if (err) {
            return res.json({ code: 2, message: err.message })
            }
            if (!user || user == "") {
            return res.json({ code: 2, message: "Người dùng không tồn tại" })
            }

            // return res.json({code: 1, message: "OK", data: user})
            const typeUser = user.payment.rule,
            rank = user.rank,
            coins = user.coins,
            fee = user.fee

            buyCoin(req, res, fee, gmailUser, amount, amountUsdt, symbol, price, type, typeUser, rank, coins, user)
        })
    }

    // [POST] /users/SellCoin/
    SellCoin(req, res){
        const { gmailUser, amount, amountUsdt, symbol, price, type } = req.body
        Users.findOne({ 'payment.email': gmailUser }, (err, user) => {
            if (err) {
            return res.json({ code: 2, message: err.message })
            }
            if (!user || user == "") {
            return res.json({ code: 2, message: "Người dùng không tồn tại" })
            }

            // return res.json({code: 1, message: "OK", data: user})
            const typeUser = user.payment.rule,
            rank = user.rank,
            coins = user.coins,
            fee = user.fee

            sellCoin(req, res, fee, gmailUser, amount, amountUsdt, symbol, price, type, typeUser, rank, coins, user)
        })
    }

}

module.exports = new UsersController