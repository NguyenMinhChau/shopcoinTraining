const express = require('express');
const router = express.Router();

const ServicesController = require('../controllers/ServicesController');

router.get('/getRate', ServicesController.getRate);

module.exports = router;
