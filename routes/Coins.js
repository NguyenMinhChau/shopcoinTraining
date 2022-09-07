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
router.get('/getAllCoin', checkAuth, CoinsController.getAllCoins)

// [GET] /coins/getCoin/:id
router.get('/getCoin/:id', checkAuth, CoinsController.getCoin)

// [POST] /coins/updateImage/:id
router.post('/updateImage/:id', checkAuth, upload.single('logo'), CoinsController.updateImage)

// [POST] /coins/updateCoin/:id
router.post('/updateCoin/:id', checkAuth, updateCoinValidator, CoinsController.updateCoin)

// [DELETE] /coins/deleteCoin/:id
router.delete('/deleteCoin/:id', checkAuth, CoinsController.deleteCoin)

module.exports = router