const express = require('express');
const router = express.Router();

const controller = require('../controllers/RatesController');

// [POST] /rates/add/:rates
router.post('/add', controller.add);

// [GET] /rates/updateRateById/:id
router.get('/updateRateById/:id', controller.updateRateById);

// [GET] /rates/getRate/:id
router.get('/getRate/:id', controller.getRate);

module.exports = router;
