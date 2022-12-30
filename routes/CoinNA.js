const express = require('express');
const router = express.Router();
const CoinNAController = require('../controllers/CoinsNotActiveController');
const multer = require('multer');

const upload = multer({ dest: 'uploads/images' });

// auth
const checkAuth = require('../auth/auth');
// const verifyPermission(['admin', 'manager']) = require('../auth/checkAmin');
const verifyPermission = require('../auth/permission');

// [POST] /CoinNA/add
router.post(
    '/add',
    checkAuth,
    verifyPermission(['admin', 'manager']),
    upload.single('logo'),
    CoinNAController.addCoin
);

// [GET] /CoinNA/getList
router.get('/getList', CoinNAController.getList);

// [PUT] /CoinNA/updateCoin/:id
router.put(
    '/updateCoin/:id',
    checkAuth,
    verifyPermission(['admin', 'manager']),
    upload.single('logo'),
    CoinNAController.updateCoin
);

// [DELETE] /CoinNA/deleteCoin/:id
router.delete(
    '/deleteCoin/:id',
    checkAuth,
    verifyPermission(['admin', 'manager']),
    CoinNAController.deleteCoin
);

module.exports = router;
