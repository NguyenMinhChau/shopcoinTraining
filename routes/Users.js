const express = require('express')
const multer = require('multer');
const path = require('path');
const UsersContronller = require('../controllers/UsersContronller');
const router = express.Router()

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/images_user');
    },
  
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
  
var upload = multer({ storage: storage })

const cpUpload = upload.fields([{ name: 'cccdFont', maxCount: 1 }, { name: 'cccdBeside', maxCount: 1 },
 { name: 'licenseFont', maxCount: 1 }, { name: 'licenseBeside', maxCount: 1 }])

// [PUT] /users/uploadImage/:id
router.put('/uploadImage/:id', cpUpload, UsersContronller.uploadImage)

// [POST] /users/BuyCoin/
router.post('/BuyCoin', UsersContronller.BuyCoin)

// [POST] /users/SellCoin/
router.post('/SellCoin', UsersContronller.SellCoin)

module.exports = router