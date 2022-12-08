const express = require('express');
const router = express.Router();

const ServicesController = require('../controllers/ServicesController');

router.post('/changeFeeUsers', ServicesController.changeFeeUsers);

module.exports = router;
