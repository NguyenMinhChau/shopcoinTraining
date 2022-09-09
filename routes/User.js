const express = require('express')
const router = express.Router()
const UsersController = require('../controllers/UsersController')
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

//[POST] /users/refreshToken
router.post('/refreshToken', UsersController.refreshToken)

// [POST] /users/register
router.post('/register', checkRegister, UsersController.register)


// [POST] /users/buyCoin
// router.post('/buyCoin', checkAuth, checkRegister, UsersController.buyCoin)

// [GET] /users/getAllUser
router.get('/getAllUser', checkAuth,UsersController.getAllUser)

// [GET] /users/getAllPayments
router.get('/getAllPayments', checkAuth,UsersController.getAllPayments)

// [GET] /users/getAllWithdraw
router.get('/getAllWithdraw', checkAuth, UsersController.getAllWithdraw)

// [GET] /users/getAllDeposit
router.get('/getAllDeposit', checkAuth, UsersController.getAllDeposit)

// [POST] /users/login
router.post('/login', LoginValidator, UsersController.login)

//[POST] /users/logout
router.post('/logout', checkAuth, UsersController.logout)

// [POST] /users/payment
router.post('/payment', checkAuth, PaymentValidator, UsersController.payment)

// [POST] /users/withdraw
router.post('/withdraw', checkAuth, WithdrawValidator, UsersController.withdraw)

// [POST] /users/deposit
router.post('/deposit', checkAuth, upload.single('statement'), UsersController.deposit)

// [POST] /users/servicesCoin
router.post('/servicesCoin', checkAuth, servicesCoinValidator, UsersController.servicesCoin)

// [PUT] /users/updatePayment
router.put('/updatePayment/:id', checkAuth, updatePaymentValidator, UsersController.updatePayment)

// [GET] /users/getPayment/:id
router.get('/getPayment/:id', checkAuth, UsersController.getPayment)

// [GET] /users/getWithdraw/:id
router.get('/getWithdraw/:id', checkAuth, UsersController.getWithdraw)

// [DELETE] /users/deletePayment/:id
router.delete('/deletePayment/:id',checkAuth, UsersController.deletePayment)

// [PUT] /users/updateWithdraw/:id
router.put('/updateWithdraw/:id', checkAuth, updateWithdrawValidator, UsersController.updateWithdraw)

// [DELETE] /users/deleteWithdraw/:id
router.delete('/deleteWithdraw/:id', checkAuth, UsersController.deleteWithdraw)

// [GET] /users/getDeposit/:id
router.get('/getDeposit/:id', checkAuth, UsersController.getDeposit)

// [PUT] /users/updateDeposit/:id
router.put('/updateDeposit/:id', checkAuth, updateDepositValidator, UsersController.updateDeposit)

// [DELETE] /users/deleteDeposit/:id
router.delete('/deleteDeposit/:id', checkAuth, UsersController.deleteDeposit)

// [PUT] /users/changePWD/:id
router.put('/changePWD/:id', checkAuth, UsersController.changePWD)

// [PUT] /users/additionBankInfo/:id
router.put('/additionBankInfo/:id', checkAuth, additionBankInfoValidator, UsersController.additionBankInfo)

// [POST] /users/handleBuyCoin/:idBill
router.post('/handleBuyCoin/:id', checkAuth, UsersController.handleBuyCoin)

// [POST] /users/handleSellCoin/:id
router.post('/handleSellCoin/:id', UsersController.handleSellCoin)


module.exports = router
