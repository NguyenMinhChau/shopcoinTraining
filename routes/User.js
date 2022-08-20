const expres = require('express')
const router = expres.Router()
const UsersController = require('../controllers/UsersController')

// import validator
const checkRegister = require('./validators/RegisterValidation')
const LoginValidator = require('./validators/LoginValidator')

// import auth
const checkAuth = require('../auth/auth')

// [POST] /users/register
router.post('/register', checkRegister, UsersController.register)

// [POST] /users/buyCoin
router.post('/buyCoin', checkAuth, checkRegister, UsersController.buyCoin)

// [POST] /users/login
router.post('/login', LoginValidator, UsersController.login)

module.exports = router