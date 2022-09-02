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
router.get('/getAllUser', UsersController.getAllUser)

// [GET] /users/getAllPayments
router.get('/getAllPayments', UsersController.getAllPayments)

// [GET] /users/getAllWithdraw
router.get('/getAllWithdraw', UsersController.getAllWithdraw)

// [GET] /users/getAllDeposit
router.get('/getAllDeposit', UsersController.getAllDeposit)

// [POST] /users/login
router.post('/login', LoginValidator, UsersController.login)

//[POST] /users/logout
router.post('/logout', UsersController.logout)

// [POST] /users/payment
router.post('/payment', checkAuth, PaymentValidator, UsersController.payment)

// [POST] /users/withdraw
router.post('/withdraw', checkAuth, WithdrawValidator, UsersController.withdraw)

// [POST] /users/deposit
router.post('/deposit', checkAuth, upload.single('statement'), UsersController.deposit)

// [POST] /users/servicesCoin
router.post('/servicesCoin', servicesCoinValidator, UsersController.servicesCoin)

// [PUT] /users/updatePayment
router.put('/updatePayment/:id', updatePaymentValidator, UsersController.updatePayment)

// [DELETE] /users/deletePayment/:id
router.delete('/deletePayment/:id', UsersController.deletePayment)

// [PUT] /users/updateWithdraw/:id
router.put('/updateWithdraw/:id', updateWithdrawValidator, UsersController.updateWithdraw)

// [DELETE] /users/deleteWithdraw/:id
router.delete('/deleteWithdraw/:id', UsersController.deleteWithdraw)

// [PUT] /users/updateDeposit/:id
router.put('/updateDeposit/:id', updateDepositValidator, UsersController.updateDeposit)

// [DELETE] /users/deleteDeposit/:id
router.delete('/deleteDeposit/:id', UsersController.deleteDeposit)

// [PUT] /users/changePWD/:id
router.put('/changePWD/:id', checkAuth, UsersController.changePWD)

// [PUT] /users/additionBankInfo/:id
router.put('/additionBankInfo/:id', checkAuth, additionBankInfoValidator, UsersController.additionBankInfo)


module.exports = router
