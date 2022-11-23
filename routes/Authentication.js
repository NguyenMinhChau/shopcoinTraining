const express = require('express');
const router = express.Router();

// import controllers
const AuthenticationController = require('../controllers/AuthenticationController');

// import check authentication
const { verifyPermission, verifyToken } = require('../auth/checkAuth');

// [POST] /authentication/register
router.post('/register', AuthenticationController.register);

// [POST] /authentication/login
router.post('/login', AuthenticationController.register);

// [POST] /admin/refreshToken
router.post('/refreshToken', AuthenticationController.refreshToken);

// [POST] /authentication/logout
router.post('/logout', AuthenticationController.logout);

module.exports = router;
