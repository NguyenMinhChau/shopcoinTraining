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

// ------------------- handle services ----------------

// [PUT] /admin/handleSellUSD/:id
router.put('/handleSellUSD/:id', AdminController.handleSellUSD);

// [PUT] /admin/handleBuyUSD/:id
router.put('/handleBuyUSD/:id', AdminController.handleBuyUSD);

// ------------------- handle services ----------------

// ------------------- get all ----------------

// [GET] /admin/getAllDeposit
router.get('/getAllDeposit', AdminController.getAllDeposit);

// [GET] /admin/getAllWithdraw
router.get('/getAllWithdraw', AdminController.getAllWithdraw);

// [GET] /admin/getAllUser
router.get('/getAllUser', AdminController.getAllUser);

// ------------------- get all ----------------

// ------------------- delete services ----------------

// [DELETE] /admin/deleteUser/:id
router.delete('/deleteUser/:id', AdminController.deleteUser);

// [DELETE] /admin/deleteWithdraw/:id
router.delete('/deleteWithdraw/:id', AdminController.deleteWithdraw);

// [DELETE] /admin/deleteDeposit/:id
router.delete('/deleteDeposit/:id', AdminController.deleteDeposit);

// ------------------- delete services ----------------

// -------------------------------------- get total ------------------------------------------------

// [GET] /admin/totalDeposit
router.get('/totalDeposit', AdminController.totalDeposit);

// [POST] /admin/totalWithdraw
router.get('/totalWithdraw', AdminController.totalWithdraw);

// [POST] /admin/totalBalance
router.get('/totalBalance', AdminController.totalBalance);

// -------------------------------------- get total ------------------------------------------------

module.exports = router;
