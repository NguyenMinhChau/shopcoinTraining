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

// import auth
const checkAuth = require('../auth/auth')

// [POST] /users/register
router.post('/register', checkRegister, UsersController.register)

// [POST] /users/buyCoin
// router.post('/buyCoin', checkAuth, checkRegister, UsersController.buyCoin)

// [POST] /users/login
router.post('/login', LoginValidator, UsersController.login)

// [POST] /users/payment
router.post('/payment', checkAuth, PaymentValidator, UsersController.payment)

// [POST] /users/withdraw
router.post('/withdraw', checkAuth, WithdrawValidator, UsersController.withdraw)

// [POST] /users/deposit
router.post('/deposit', checkAuth, upload.single('statement'), UsersController.deposit)


module.exports = router