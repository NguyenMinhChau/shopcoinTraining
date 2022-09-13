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
const servicesCoinValidator = require('./validators/servicesCoinValidator')
const updatePaymentValidator = require('./validators/updatePaymentValidator')
const additionBankInfoValidator = require('./validators/addtionBankInfoValidator')
const updateWithdrawValidator = require('./validators/updateWithdrawValidator')
const updateDepositValidator = require('./validators/updateDepositValidator')

// import auth
const checkAuth = require('../auth/auth')


// [GET] /admin/getAllUser
router.get('/getAllUser', AdminController.getAllUser)

// [DELETE] /admin/deleteUser/:id
router.delete('/deleteUser/:id', AdminController.deleteUser)

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

// [POST] /admin/servicesCoin
router.post('/servicesCoin', checkAuth, servicesCoinValidator, AdminController.servicesCoin)

// [PUT] /admin/updatePayment
router.put('/updatePayment/:id', checkAuth, updatePaymentValidator, AdminController.updatePayment)

// [GET] /admin/getPayment/:id
router.get('/getPayment/:id', AdminController.getPayment)

// [GET] /admin/getWithdraw/:id
router.get('/getWithdraw/:id', AdminController.getWithdraw)

// [DELETE] /admin/deletePayment/:id
router.delete('/deletePayment/:id',checkAuth, AdminController.deletePayment)

// [PUT] /admin/updateWithdraw/:id
router.put('/updateWithdraw/:id', checkAuth, updateWithdrawValidator, AdminController.updateWithdraw)

// [DELETE] /admin/deleteWithdraw/:id
router.delete('/deleteWithdraw/:id', checkAuth, AdminController.deleteWithdraw)

// [GET] /admin/getDeposit/:id
router.get('/getDeposit/:id', AdminController.getDeposit)

// [PUT] /admin/updateDeposit/:id
router.put('/updateDeposit/:id', checkAuth, updateDepositValidator, AdminController.updateDeposit)

// [DELETE] /admin/deleteDeposit/:id
router.delete('/deleteDeposit/:id', checkAuth, AdminController.deleteDeposit)

// [PUT] /admin/changePWD/:id
router.put('/changePWD/:id', checkAuth, AdminController.changePWD)

// [PUT] /admin/additionBankInfo/:id
router.put('/additionBankInfo/:id', checkAuth, additionBankInfoValidator, AdminController.additionBankInfo)

// [POST] /admin/handleBuyCoin/:idBill
router.post('/handleBuyCoin/:id', checkAuth, AdminController.handleBuyCoin)

// [POST] /admin/handleSellCoin/:id
router.post('/handleSellCoin/:id', AdminController.handleSellCoin)

// [GET]/admin/getAllSell
router.get('/getAllSell', AdminController.getAllSell)

// [GET]/admin/getAllBuy
router.get('/getAllBuy', AdminController.getAllBuy)

// [GET] /admin/getSell 
router.get('/getSell/:id', AdminController.getSell)

// [GET] /admin/getBuy  
router.get('/getBuy/:id', AdminController.getBuy)

module.exports = router
