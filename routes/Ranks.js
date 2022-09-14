const express = require('express')

const router = express.Router()

const RanksController = require('../controllers/RanksController')

// [PUT] /ranks/updateRank/:id
router.put('/updateRank/:id', RanksController.updateRank)

// [GET] /ranks/getAllRanks
router.get('/getAllRanks', RanksController.getAllRanks)

// [POST] /ranks/rank
router.post('/rank', RanksController.rank)

module.exports = router
