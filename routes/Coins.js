const express = require('express')
const router = express.Router()
const CoinsController = require('../controllers/CoinsController')
const multer = require('multer')

const upload = multer({ dest: 'uploads/images' })

// auth
const checkAuth = require('../auth/auth')

// import validator
const updateCoinValidator = require('./validators/updateCoinValidator')



// [POST] /coins/add
router.post('/add', checkAuth, upload.single('logo'), CoinsController.addCoin)

// [GET] /coins/getAllCoin
router.get('/getAllCoin', CoinsController.getAllCoins)

// [GET] /coins/getCoin/:id
router.get('/getCoin/:id', CoinsController.getCoin)


// [PUT] /coins/updateCoin/:id
router.put('/updateCoin/:id', checkAuth, upload.single('logo'), updateCoinValidator, CoinsController.updateCoin)

// [DELETE] /coins/deleteCoin/:id
router.delete('/deleteCoin/:id', checkAuth, CoinsController.deleteCoin)

module.exports = router