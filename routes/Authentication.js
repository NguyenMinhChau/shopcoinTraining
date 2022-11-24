const express = require('express');
const router = express.Router();

// import controllers
const AuthenticationController = require('../controllers/AuthenticationController');

// import check authentication
const { verifyPermission, verifyToken } = require('../auth/checkAuth');

// validators
const registerValidator = require('./validators/RegisterValidation');
const LoginValidator = require('./validators/LoginValidator');

// [POST] /authentication/register
router.post('/register', registerValidator, AuthenticationController.register);

// [POST] /authentication/login
router.post('/login', LoginValidator, AuthenticationController.login);

// [POST] /admin/refreshToken
router.post('/refreshToken', AuthenticationController.refreshToken);

// [POST] /authentication/logout
router.post('/logout', AuthenticationController.logout);

module.exports = router;
