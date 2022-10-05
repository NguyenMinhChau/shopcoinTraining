const express = require('express');
const multer = require('multer');
const path = require('path');
const UsersContronller = require('../controllers/UsersContronller');
const router = express.Router();

const checkAuth = require('../auth/auth');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/images_user');
    },

    filename: function (req, file, cb) {
        cb(
            null,
            file.fieldname + '-' + Date.now() + path.extname(file.originalname)
        );
    }
});

const additionBankInfoValidator = require('./validators/addtionBankInfoValidator');

var upload = multer({ storage: storage });

const single = multer({ dest: 'uploads/images' });

const cpUpload = upload.fields([
    { name: 'cccdFont', maxCount: 1 },
    { name: 'cccdBeside', maxCount: 1 },
    { name: 'licenseFont', maxCount: 1 },
    { name: 'licenseBeside', maxCount: 1 }
]);

// [PUT] /users/uploadImage/:id
router.put(
    '/uploadImage/:id',
    checkAuth,
    cpUpload,
    UsersContronller.uploadImage
);

// [POST] /users/BuyCoin/
router.post('/BuyCoin', checkAuth, UsersContronller.BuyCoin);

// [POST] /users/SellCoin/
router.post('/SellCoin', checkAuth, UsersContronller.SellCoin);

// [PUT] /users/changePWD/:id
router.put('/changePWD/:id', checkAuth, UsersContronller.changePWD);

// [PUT] /users/additionBankInfo/:id
router.put(
    '/additionBankInfo/:id',
    checkAuth,
    additionBankInfoValidator,
    UsersContronller.additionBankInfo
);

// [POST] /users/forgotPassword
router.post('/forgotPassword', UsersContronller.forgotPassword);

// [PUT] /users/getOTP/:token
router.put('/getOTP/:token', UsersContronller.getOTP);

// [POST] /users/deposit
router.post(
    '/deposit',
    checkAuth,
    single.single('statement'),
    UsersContronller.deposit
);

// [POST] /users/withdraw
router.post('/withdraw', checkAuth, UsersContronller.withdraw);

// [GET] /users/getAllBuy/:id
router.get('/getAllBuy/:id', UsersContronller.getAllBuy);

// [GET] /users/getAllSell/:id
router.get('/getAllSell/:id', UsersContronller.getAllSell);

module.exports = router;
