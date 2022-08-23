const express = require('express')
const router = express.Router()
const CoinsController = require('../controllers/CoinsController')
const multer = require('multer')

const upload = multer({ dest: 'uploads/images' })

// import validator



// [GET] /add
router.post('/add', upload.single('logo'), CoinsController.addCoin)

module.exports = router