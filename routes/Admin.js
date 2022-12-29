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
const verifyPermission = require('../auth/permission');
const { appLimit } = require('../function');

// [GET] /admin/getAllUser
router.get('/getAllUser', AdminController.getAllUser);

// [DELETE] /admin/deleteUser/:id
router.delete(
    '/deleteUser/:id',
    checkAuth,
    verifyPermission(['admin', 'manager']),
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
    verifyPermission(['admin', 'manager']),
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
    verifyPermission(['admin', 'manager']),
    AdminController.deletePayment
);

// [PUT] /admin/updateWithdraw/:id
router.put(
    '/updateWithdraw/:id',
    checkAuth,
    verifyPermission(['admin', 'manager']),
    AdminController.updateWithdraw
);

// [DELETE] /admin/deleteWithdraw/:id
router.delete(
    '/deleteWithdraw/:id',
    checkAuth,
    verifyPermission(['admin', 'manager']),
    AdminController.delete_withdraw_v1
);

// [DELETE] /admin/delWithdraw/:id
router.delete('/delWithdraw/:id', AdminController.deleteWithdraw);

// [GET] /admin/getDeposit/:id
router.get('/getDeposit/:id', AdminController.getDeposit);

// [PUT] /admin/updateDeposit/:id
router.put(
    '/updateDeposit/:id',
    checkAuth,
    verifyPermission(['admin', 'manager']),
    AdminController.updateDeposit
);

// [DELETE] /admin/deleteDeposit/:id
router.delete(
    '/deleteDeposit/:id',
    checkAuth,
    verifyPermission(['admin', 'manager']),
    AdminController.delete_deposit_v1
);

// [GET] /admin/getUser/:id
router.get('/getUser/:id', AdminController.getUser);

// [GET]/admin/getAllSell
router.get('/getAllSell', AdminController.getAllSell);

// [GET]/admin/getAllBuy/:search
router.get('/getAllBuy', AdminController.getAllBuy);

// [GET] /admin/getSell
router.get('/getSell/:id', AdminController.getSell);

// [GET] /admin/getBuy
router.get('/getBuy/:id', AdminController.getBuy);

// [PUT] /admin/testHandleBuyCoin/:id
router.put(
    '/handleBuyCoin/:id',
    checkAuth,
    verifyPermission(['admin', 'manager']),
    AdminController.handle_buy_coin_v1
);

// [PUT] /admin/testHandleBuyCoinBot/:id
router.put('/handleBuyCoinBot/:id', AdminController.handle_buy_coin_v1);

// [PUT] /admin/handleSellCoin/:id
router.put(
    '/handleSellCoin/:id',
    checkAuth,
    verifyPermission(['admin', 'manager']),
    AdminController.handle_sell_coin_v3
);

// [PUT] /admin/handleSellCoinBot/:id
router.put('/handleSellCoinBot/:id', AdminController.handle_sell_coin_v3);

//[PUT] /admin/updateRankUser/:id
router.put(
    '/updateRankUser/:id',
    checkAuth,
    verifyPermission(['admin', 'manager']),
    AdminController.updateRankUser
);

// [DELETE] /admin/deleteBuy/:id
router.delete(
    '/deleteBuy/:id',
    checkAuth,
    verifyPermission(['admin', 'manager']),
    AdminController.delete_buy_v1
);

// [DELETE] /admin/deleteSell/:id
router.delete(
    '/deleteSell/:id',
    checkAuth,
    verifyPermission(['admin', 'manager']),
    AdminController.delete_sell_v1
);

// [PUT] /admin/changePWDForUser/:id
router.put(
    '/changePWDForUser/:id',
    checkAuth,
    verifyPermission(['admin', 'manager']),
    AdminController.changePWDForUser
);

// [PUT] /admin/refreshPWD/:id
router.put(
    '/refreshPWD/:id',
    checkAuth,
    verifyPermission(['admin', 'manager']),
    AdminController.refreshPWD
);

// [PUT] /admin/changeCoin/:id
router.put(
    '/changeCoin/:id',
    checkAuth,
    verifyPermission(['admin', 'manager']),
    AdminController.change_coin_v2
);

// [PUT] /admin/changeCoinBot/:id
router.put('/changeCoinBot/:id', AdminController.change_coin_v2_bot);

// [PUT] /admin/blockUser/:id
router.put(
    '/blockUser/:id',
    checkAuth,
    verifyPermission(['admin', 'manager']),
    AdminController.lockUser
);

// [PUT] /admin/unBlockUser/:id
router.put(
    '/unBlockUser/:id',
    checkAuth,
    verifyPermission(['admin', 'manager']),
    AdminController.unlockUser
);

// [PUT] /admin/handleDeposit/:id
router.put(
    '/handleDeposit/:id',
    checkAuth,
    verifyPermission(['admin', 'manager']),
    AdminController.handle_deposit_v2
);

// [PUT] /admin/handleDepositBot/:id
router.put('/handleDepositBot/:id', AdminController.handle_deposit_v2);

// [PUT] /admin/supportHandleDeposit/:id
router.put('/supportHandleDeposit/:id', AdminController.handle_deposit_v2);

// [PUT] /admin/handleWithdraw/:id
router.put(
    '/handleWithdraw/:id',
    checkAuth,
    verifyPermission(['admin', 'manager']),
    AdminController.handleWithdraw_v2
);

// [PUT] /admin/handleWithdrawBot/:id
router.put('/handleWithdrawBot/:id', AdminController.handleWithdraw_v2);

// [PUT] /admin/supportHandleWithdraw/:id
router.put('/supportHandleWithdraw/:id', AdminController.handleWithdraw_v2);

// [POST] /admin/totalDeposit
router.post('/totalDeposit', AdminController.totalDeposit);

// [POST] /admin/totalWithdraw
router.post('/totalWithdraw', AdminController.totalWithdraw);

// [POST] /admin/totalBalance
router.post('/totalBalance', AdminController.totalBalance);

// [GET] /admin/getPaymentOfAdmin/:bank
router.get('/getPaymentOfAdmin/:bank', AdminController.getPaymentOfAdmin);

// [GET] /admin/getAllPaymentAdmin
router.get('/getAllPaymentAdmin', AdminController.getAllPaymentAdmin);

// [GET] /admin/getUSerFromWithdraw/:id
router.get('/getUSerFromWithdraw/:id', AdminController.getUSerFromWithdraw);

// [GET] /admin/Commission
router.get('/Commission', AdminController.totalCommission);

// [PUT] /admin/changeRates
router.put(
    '/changeRates',
    checkAuth,
    verifyPermission(['admin', 'manager']),
    AdminController.changeRates
);

// [GET] /admin/getRates
router.get('/getRates', AdminController.getRates);

// // [PUT] /admin/testHandleWithdraw/:id
// router.put('/testHandleWithdraw/:id', AdminController.handleWithdraw_v2);

// // [PUT] /admin/testHandleDeposit/:id
// router.put('/testHandleDeposit/:id', AdminController.handle_deposit_v2);

// [PUT] /admin/testHandleSellCoin/:id
router.put('/testHandleSell/:id', AdminController.handle_sell_coin_v3);

// [PUT] /admin/testHandleBuy/:id
router.put('/testHandleBuy/:id', AdminController.handle_buy_coin_v1);

// [PUT] /admin/changeRoleUser/:id
router.put(
    '/changeRoleUser/:id',
    checkAuth,
    verifyPermission(['admin']),
    AdminController.change_role
);

// [GET] /admin/getTotalCommission
router.get('/getTotalCommission', AdminController.totalCommission);

// [GET] /admin/testDeleteBuy/:id
router.get('/testDeleteBuy/:id', AdminController.delete_buy_v1);

// [GET] /admin/testDeleteSell/:id
router.get('/testDeleteSell/:id', AdminController.delete_sell_v1);

module.exports = router;
