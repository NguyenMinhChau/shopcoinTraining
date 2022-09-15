const express = require('express')
const router = express.Router()
const AdminController = require('../controllers/AdminController')
const multer = require('multer')

const upload = multer({ dest: 'uploads/images' })

// import validator
const checkRegister = require('./validators/RegisterValidation')
const LoginValidator = require('./validators/LoginValidator')
const PaymentValidator = require('./validators/PaymentValidator')
const WithdrawValidator = require('./validators/WithdrawValidator')
const updatePaymentValidator = require('./validators/updatePaymentValidator')

const updateWithdrawValidator = require('./validators/updateWithdrawValidator')
const updateDepositValidator = require('./validators/updateDepositValidator')

// import auth
const checkAuth = require('../auth/auth')
const checkAdmin = require('../auth/checkAmin')
const { check } = require('express-validator')

// [GET] /admin/getAllUser
router.get('/getAllUser', AdminController.getAllUser)

// [DELETE] /admin/deleteUser/:id
router.delete('/deleteUser/:id', checkAuth, checkAdmin, AdminController.deleteUser)

// [GET] /admin/getAllPayments
router.get('/getAllPayments', AdminController.getAllPayments)

// [GET] /admin/getAllWithdraw
router.get('/getAllWithdraw', AdminController.getAllWithdraw)

// [GET] /admin/getAllDeposit
router.get('/getAllDeposit', AdminController.getAllDeposit)



// [POST] /admin/payment
router.post('/payment', checkAuth, PaymentValidator, AdminController.payment)

// [POST] /admin/withdraw
router.post('/withdraw', checkAuth, WithdrawValidator, AdminController.withdraw)

// [POST] /admin/deposit
router.post('/deposit', checkAuth, upload.single('statement'), AdminController.deposit)


// [PUT] /admin/updatePayment
router.put('/updatePayment/:id', checkAuth, checkAdmin, AdminController.updatePayment)

// [GET] /admin/getPayment/:id
router.get('/getPayment/:id', AdminController.getPayment)

// [GET] /admin/getWithdraw/:id
router.get('/getWithdraw/:id', AdminController.getWithdraw)

// [DELETE] /admin/deletePayment/:id
router.delete('/deletePayment/:id',checkAuth, checkAdmin, AdminController.deletePayment)

// [PUT] /admin/updateWithdraw/:id
router.put('/updateWithdraw/:id', checkAuth, checkAdmin, AdminController.updateWithdraw)

// [DELETE] /admin/deleteWithdraw/:id
router.delete('/deleteWithdraw/:id', checkAuth, checkAdmin, AdminController.deleteWithdraw)

// [GET] /admin/getDeposit/:id
router.get('/getDeposit/:id', AdminController.getDeposit)

// [PUT] /admin/updateDeposit/:id
router.put('/updateDeposit/:id', checkAuth, checkAdmin, AdminController.updateDeposit)

// [DELETE] /admin/deleteDeposit/:id
router.delete('/deleteDeposit/:id', checkAuth, checkAdmin, AdminController.deleteDeposit)





// [GET]/admin/getAllSell
router.get('/getAllSell', AdminController.getAllSell)

// [GET]/admin/getAllBuy
router.get('/getAllBuy', AdminController.getAllBuy)

// [GET] /admin/getSell 
router.get('/getSell/:id', AdminController.getSell)

// [GET] /admin/getBuy  
router.get('/getBuy/:id', AdminController.getBuy)

// [POST] /admin/testHandleBuyCoin/:id
router.put('/handleBuyCoin/:id', checkAuth, checkAdmin, AdminController.handleBuyCoin)

// [POST] /admin/testHandleSellCoin/:id
router.put('/handleSellCoin/:id', checkAuth, checkAdmin, AdminController.handleSellCoin)

//[PUT] /admin/updateRankUser/:id
router.put('/updateRankUser/:id', checkAuth, checkAdmin, AdminController.updateRankUser)

// [DELETE] /admin/deleteBcheckAuth
router.delete('/deleteBuy/:id', checkAuth, checkAdmin, AdminController.deleteBuy)

// [DELETE] /admin/deleteSell/:id
router.delete('/deleteSell/:id', checkAuth, checkAdmin, AdminController.deleteSell)

module.exports = router
