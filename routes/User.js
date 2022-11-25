const express = require('express');
const router = express.Router();

// import controllers
const UserController = require('../controllers/UserController');

// import check authentication
const { verifyPermission, verifyToken } = require('../auth/checkAuth');

// [POST] /users/BuyUSD/:id
router.post('/BuyUSD/:id', UserController.BuyUSD);

// [PUT] /users/additionImageDeposit/:id
router.put('/additionImageDeposit/:id', UserController.additionImageDeposit);

// [POST] /users/SellUSD/:id
router.post('/SellUSD/:id', UserController.sellUSD);

// [GET] /users/enterOTPWithdraw/:code
router.get('/enterOTPWithdraw/:code', UserController.enterOTPWithdraw);

// [POST] /users/resendOTPWithdraw/:id
router.get('/resendOTPWithdraw/:id', UserController.resendOTPWithdraw);

// [PUT] /users/additionImages/:id
router.put('/additionImages/:id', UserController.additionImages);

// [PUT] /admin/changePWD/:id
router.put('/changePWD/:id', UserController.changePWD);

// [POST] /users/forgotPassword
router.post('/forgotPassword', UserController.forgotPassword);

// [PUT] /users/additionBankInfo/:id
router.put('/additionBankInfo/:id', UserController.additionBankInfo);

// [PUT] /users/getOTP/:token
router.put('/getOTP/:token', UserController.getOTP);

// [GET] /users/getPaymentByEmail/:email
router.get('/getPaymentByEmail/:email', UserController.getPaymentByEmail);

// [GET] /users/getWithdrawByEmail/:email
router.get('/getWithdrawByEmail/:email', UserController.getWithdrawByEmail);

// [GET] /users/getAllDepositsByEmail/:email
router.get(
    '/getAllDepositsByEmail/:email',
    UserController.getAllDepositsByEmail
);

// [GET] /users/getAllWithdrawByEmail/:email
router.get(
    '/getAllWithdrawByEmail/:email',
    UserController.getAllWithdrawByEmail
);

module.exports = router;
