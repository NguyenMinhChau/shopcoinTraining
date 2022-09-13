const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = multer({ dest: 'uploads/images' })

const AuthenController = require('../controllers/AuthenController')

// import validator
const loginValidator = require('./validators/LoginValidator')
const registerValidator = require('./validators/RegisterValidation')

// [POST] /authen/login
router.post('/login', loginValidator, AuthenController.login)

// [POST] /authen/register
router.post('/register', registerValidator, AuthenController.register)

// [POST] /authen/logout
router.post('/logout', AuthenController.logout)

// [POST] /authen/refreshToken
router.post('/refreshToken', AuthenController.refreshToken)

module.exports = router