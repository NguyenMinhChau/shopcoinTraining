const express = require('express');
const router = express.Router();

const controller = require('../controllers/RatesController');

// [POST] /rates/add/:rates
router.post('/add', controller.add);

// [GET] /rates/getRateById/:id
router.get('/getRateById/:id', controller.getRateById);

module.exports = router;
