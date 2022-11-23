const express = require('express');
const router = express.Router();

// import controllers
const AdminController = require('../controllers/AdminController');
const RateController = require('../controllers/RateController');

// import check authentication
const { verifyPermission, verifyToken } = require('../auth/checkAuth');

// [GET] /admin/getAllUsers
router.get('/getAllUsers', AdminController.getAllUser);

// [GET] /admin/getRate
router.get('/getRate', RateController.getRate);

// [GET] /admin/updateRate
router.get('/updateRate', RateController.updateRate);

// [GET] /admin/getUser/:id
router.get('/getUser/:id', AdminController.getUser);

// [GET] /admin/getPaymentAdmin
router.get('/getPaymentAdmin', AdminController.getPaymentAdmin);

// [GET] /admin/getPayment/:id
router.get('/getPayment/:id', AdminController.getPayment);

// [PUT] /admin/handleSellUSD/:id
router.put('/handleSellUSD/:id', AdminController.handleSellUSD);

// [PUT] /admin/handleBuyUSD/:id
router.put('/handleBuyUSD/:id', AdminController.handleBuyUSD);

// [GET] /admin/getAllDeposit
router.get('/getAllDeposit', AdminController.getAllDeposit);

// [GET] /admin/getAllWithdraw
router.get('/getAllWithdraw', AdminController.getAllWithdraw);

// [GET] /admin/getAllUser
router.get('/getAllUser', AdminController.getAllUser);

module.exports = router;
