const expres = require('express')
const router = expres.Router()
const CoinsController = require('../controllers/CoinsController')

// import validator


// [GET] /add
router.post('/add', CoinsController.addCoin)

module.exports = router