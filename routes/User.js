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

// import auth
const checkAuth = require('../auth/auth')

// [POST] /users/register
router.post('/register', checkRegister, UsersController.register)

// [POST] /users/buyCoin
// router.post('/buyCoin', checkAuth, checkRegister, UsersController.buyCoin)

// [GET] /users/getAllUser
router.get('/getAllUser', UsersController.getAllUser)

// [GET] /users/getAllPayments
router.get('/getAllPayments', UsersController.getAllPayments)

// [POST] /users/login
router.post('/login', LoginValidator, UsersController.login)

// [POST] /users/payment
router.post('/payment', checkAuth, PaymentValidator, UsersController.payment)

// [POST] /users/withdraw
router.post('/withdraw', checkAuth, WithdrawValidator, UsersController.withdraw)

// [POST] /users/deposit
router.post('/deposit', checkAuth, upload.single('statement'), UsersController.deposit)

// [POST] /users/servicesCoin
router.post('/servicesCoin', servicesCoinValidator, UsersController.servicesCoin)

// [PUT] /users/updatePayment
router.put('/updatePayment/:id', UsersController.updatePayment)

// [DELETE] /users/deletePayment/:id
router.delete('/deletePayment/:id', UsersController.deletePayment)

// [PUT] /users/changePWD/:id
router.put('/changePWD/:id', UsersController.changePWD)

// [PUT] /users/additionBankInfo/:id
router.put('/additionBankInfo/:id', UsersController.additionBankInfo)


module.exports = router
