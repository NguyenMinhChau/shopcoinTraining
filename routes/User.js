const expres = require('express')
const router = expres.Router()
const UsersController = require('../controllers/UsersController')

// import validator
const checkRegister = require('./validators/RegisterValidation')

// [POST] /users/register
router.post('/register', checkRegister, UsersController.register)

// [POST] /users/buyCoin
router.post('/buyCoin', checkRegister, UsersController.buyCoin)

module.exports = router