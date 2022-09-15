const express = require('express')

const router = express.Router()

const testController = require('../controllers/testController')

// [POST] /test/addTran
router.post('/addTran', testController.addTrans)

module.exports = router
