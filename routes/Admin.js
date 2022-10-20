const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const multer = require('multer');

const upload = multer({ dest: 'uploads/images' });

// import validator
const PaymentValidator = require('./validators/PaymentValidator');
const WithdrawValidator = require('./validators/WithdrawValidator');

// import auth
const checkAuth = require('../auth/auth');
const checkAdmin = require('../auth/checkAmin');
const { appLimit } = require('../function');

// [GET] /admin/getAllUser
router.get('/getAllUser', AdminController.getAllUser);

// [DELETE] /admin/deleteUser/:id
router.delete(
    '/deleteUser/:id',
    checkAuth,
    checkAdmin,
    AdminController.deleteUser
);

// [GET] /admin/getAllPayments
router.get('/getAllPayments', AdminController.getAllPayments);

// [GET] /admin/getAllWithdraw
router.get('/getAllWithdraw', AdminController.getAllWithdraw);

// [GET] /admin/getAllDeposit
router.get('/getAllDeposit', AdminController.getAllDeposit);

// [POST] /admin/payment
router.post('/payment', checkAuth, PaymentValidator, AdminController.payment);

// [POST] /admin/withdraw
router.post(
    '/withdraw',
    checkAuth,
    WithdrawValidator,
    AdminController.withdraw
);

// [POST] /admin/deposit
router.post(
    '/deposit',
    checkAuth,
    upload.single('statement'),
    AdminController.deposit
);

// [PUT] /admin/updatePayment
router.put(
    '/updatePayment/:id',
    checkAuth,
    checkAdmin,
    AdminController.updatePayment
);

// [GET] /admin/getPayment/:id
router.get('/getPayment/:id', AdminController.getPayment);

// [GET] /admin/getWithdraw/:id
router.get('/getWithdraw/:id', AdminController.getWithdraw);

// [DELETE] /admin/deletePayment/:id
router.delete(
    '/deletePayment/:id',
    checkAuth,
    checkAdmin,
    AdminController.deletePayment
);

// [PUT] /admin/updateWithdraw/:id
router.put(
    '/updateWithdraw/:id',
    checkAuth,
    checkAdmin,
    AdminController.updateWithdraw
);

// [DELETE] /admin/deleteWithdraw/:id
router.delete(
    '/deleteWithdraw/:id',
    checkAuth,
    checkAdmin,
    AdminController.deleteWithdraw
);

// [DELETE] /admin/delWithdraw/:id
router.delete('/delWithdraw/:id', AdminController.deleteWithdraw);

// [GET] /admin/getDeposit/:id
router.get('/getDeposit/:id', AdminController.getDeposit);

// [PUT] /admin/updateDeposit/:id
router.put(
    '/updateDeposit/:id',
    checkAuth,
    checkAdmin,
    AdminController.updateDeposit
);

// [DELETE] /admin/deleteDeposit/:id
router.delete(
    '/deleteDeposit/:id',
    checkAuth,
    checkAdmin,
    AdminController.deleteDeposit
);

// [GET] /admin/getUser/:id
router.get('/getUser/:id', AdminController.getUser);

// [GET]/admin/getAllSell
router.get('/getAllSell', AdminController.getAllSell);

// [GET]/admin/getAllBuy
router.get('/getAllBuy', AdminController.getAllBuy);

// [GET] /admin/getSell
router.get('/getSell/:id', AdminController.getSell);

// [GET] /admin/getBuy
router.get('/getBuy/:id', AdminController.getBuy);

// [PUT] /admin/testHandleBuyCoin/:id
router.put(
    '/handleBuyCoin/:id',
    checkAuth,
    checkAdmin,
    AdminController.handleBuyCoin
);

// [PUT] /admin/testHandleBuyCoinBot/:id
router.put('/handleBuyCoinBot/:id', AdminController.handleBuyCoin);

// [PUT] /admin/testHandleSellCoin/:id
router.put(
    '/handleSellCoin/:id',
    checkAuth,
    checkAdmin,
    AdminController.handleSellCoin
);

// [PUT] /admin/testHandleSellCoinBot/:id
router.put('/handleSellCoinBot/:id', AdminController.handleSellCoin);

//[PUT] /admin/updateRankUser/:id
router.put(
    '/updateRankUser/:id',
    checkAuth,
    checkAdmin,
    AdminController.updateRankUser
);

// [DELETE] /admin/deleteBuy/:id
router.delete(
    '/deleteBuy/:id',
    checkAuth,
    checkAdmin,
    AdminController.deleteBuy
);

// [DELETE] /admin/deleteSell/:id
router.delete(
    '/deleteSell/:id',
    checkAuth,
    checkAdmin,
    AdminController.deleteSell
);

// [PUT] /admin/changePWDForUser/:id
router.put(
    '/changePWDForUser/:id',
    checkAuth,
    checkAdmin,
    AdminController.changePWDForUser
);

// [PUT] /admin/refreshPWD/:id
router.put(
    '/refreshPWD/:id',
    checkAuth,
    checkAdmin,
    AdminController.refreshPWD
);

// [PUT] /admin/changeCoin/:id
router.put(
    '/changeCoin/:id',
    checkAuth,
    checkAdmin,
    AdminController.changeCoin
);

// [PUT] /admin/blockUser/:id
router.put('/blockUser/:id', checkAuth, checkAdmin, AdminController.lockUser);

// [PUT] /admin/unBlockUser/:id
router.put(
    '/unBlockUser/:id',
    checkAuth,
    checkAdmin,
    AdminController.unlockUser
);

// [PUT] /admin/handleDeposit/:id
router.put(
    '/handleDeposit/:id',
    checkAuth,
    checkAdmin,
    AdminController.handleDeposit
);

// [PUT] /admin/handleDepositBot/:id
router.put('/handleDepositBot/:id', AdminController.handleDeposit);

// [PUT] /admin/handleWithdraw/:id
router.put(
    '/handleWithdraw/:id',
    checkAuth,
    checkAdmin,
    AdminController.handleWithdraw
);

// [PUT] /admin/handleWithdrawBot/:id
router.put('/handleWithdrawBot/:id', AdminController.handleWithdraw);

module.exports = router;