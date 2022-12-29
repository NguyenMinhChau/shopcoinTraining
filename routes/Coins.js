const express = require('express');
const router = express.Router();
const CoinsController = require('../controllers/CoinsController');
const multer = require('multer');

const upload = multer({ dest: 'uploads/images' });

// auth
const checkAuth = require('../auth/auth');
// const verifyPermission(['admin', 'manager']) = require('../auth/checkAmin');
const verifyPermission = require('../auth/permission');

// import validator
const updateCoinValidator = require('./validators/updateCoinValidator');

// [POST] /coins/add
router.post(
    '/add',
    checkAuth,
    verifyPermission(['admin', 'manager']),
    upload.single('logo'),
    CoinsController.addCoin
);

// [GET] /coins/getAllCoin
router.get('/getAllCoin', CoinsController.getAllCoins);

// [GET] /coins/getCoin/:id
router.get('/getCoin/:id', CoinsController.getCoin);

// [GET] /coins/getCoinSymbol/:symbol
router.get('/getCoinSymbol/:symbol', CoinsController.getCoinSymbol);

// [PUT] /coins/updateCoin/:id
router.put(
    '/updateCoin/:id',
    checkAuth,
    verifyPermission(['admin', 'manager']),
    upload.single('logo'),
    updateCoinValidator,
    CoinsController.updateCoin
);

// [DELETE] /coins/deleteCoin/:id
router.delete(
    '/deleteCoin/:id',
    checkAuth,
    verifyPermission(['admin', 'manager']),
    CoinsController.deleteCoin
);

// [GET] /coins/updatePriceAllCoin
router.get('/updatePriceAllCoin', CoinsController.updatePriceAllCoin);

// [GET] /coins/updateHighLowAllCoin
router.get('/updateHighLowAllCoin', CoinsController.updateHighLowAllCoin);

// [GET] /coins/getAmountCoinUserBuy
router.get('/getAmountCoinUserBuy', CoinsController.getTotalCoin);

module.exports = router;
