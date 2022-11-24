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
router.put(
    '/handleSellUSD/:id',
    verifyToken,
    verifyPermission(['admin', 'manager']),
    AdminController.handleSellUSD
);

// [PUT] /admin/handleBuyUSD/:id
router.put(
    '/handleBuyUSD/:id',
    verifyToken,
    verifyPermission(['admin', 'manager']),
    AdminController.handleBuyUSD
);

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
router.delete(
    '/deleteUser/:id',
    verifyToken,
    verifyPermission(['admin']),
    AdminController.deleteUser
);

// [DELETE] /admin/deleteWithdraw/:id
router.delete(
    '/deleteWithdraw/:id',
    verifyToken,
    verifyPermission(['admin']),
    AdminController.deleteWithdraw
);

// [DELETE] /admin/deleteDeposit/:id
router.delete(
    '/deleteDeposit/:id',
    verifyToken,
    verifyPermission(['admin']),
    AdminController.deleteDeposit
);

// ------------------- delete services ----------------

// -------------------------------------- get total ------------------------------------------------

// [GET] /admin/totalDeposit
router.get('/totalDeposit', AdminController.totalDeposit);

// [POST] /admin/totalWithdraw
router.get('/totalWithdraw', AdminController.totalWithdraw);

// [POST] /admin/totalBalance
router.get('/totalBalance', AdminController.totalBalance);

// -------------------------------------- get total ------------------------------------------------

// [POST] /admin/giveUSD/:id
router.post(
    '/giveUSD/:id',
    verifyToken,
    verifyPermission(['admin']),
    AdminController.giveUSD
);

// [GET] /admin/getDeposit/:id
router.get('/getDeposit/:id', AdminController.getDeposit);

// [GET] /admin/getWithdraw/:id
router.get('/getWithdraw/:id', AdminController.getWithdraw);

// [PUT] /admin/blockAndUnBlock/:id
router.put(
    '/blockAndUnBlock/:id',
    verifyToken,
    verifyPermission(['admin', 'manager']),
    AdminController.blockAndUnBlock
);

// [PUT] /admin/changePWD/:id
router.put(
    '/changePWD/:id',
    verifyToken,
    verifyPermission(['admin', 'manager']),
    AdminController.changePWD
);

// [PUT] /admin/refreshPWD/:id
router.put(
    '/refreshPWD/:id',
    verifyToken,
    verifyPermission(['admin', 'manager']),
    AdminController.refreshPWD
);

// [PUT] /admin/updateRankUser/:id
router.put(
    '/updateRankUser/:id',
    verifyToken,
    verifyPermission(['admin', 'manager']),
    AdminController.updateRankUser
);

module.exports = router;
