const express = require('express');
const router = express.Router();
const CoinsController = require('../controllers/CoinsController');
const multer = require('multer');

const upload = multer({ dest: 'uploads/images' });

// auth
const checkAuth = require('../auth/auth');
const checkAdmin = require('../auth/checkAmin');

// import validator
const updateCoinValidator = require('./validators/updateCoinValidator');

// [POST] /coins/add
router.post(
    '/add',
    checkAuth,
    checkAdmin,
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
    checkAdmin,
    upload.single('logo'),
    updateCoinValidator,
    CoinsController.updateCoin
);

// [DELETE] /coins/deleteCoin/:id
router.delete(
    '/deleteCoin/:id',
    checkAuth,
    checkAdmin,
    CoinsController.deleteCoin
);

// [GET] /coins/updatePriceAllCoin
router.get('/updatePriceAllCoin', CoinsController.updatePriceAllCoin);

// [GET] /coins/updateHighLowAllCoin
router.get('/updateHighLowAllCoin', CoinsController.updateHighLowAllCoin);

// [GET] /coins/getAmountCoinUserBuy
router.get('/getAmountCoinUserBuy', CoinsController.getAmountCoinUserBuy);


module.exports = router;
