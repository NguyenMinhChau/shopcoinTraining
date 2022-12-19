const express = require('express');
const router = express.Router();

const ServicesController = require('../controllers/ServicesController');

router.post('/changeFeeUsers', ServicesController.changeFeeUsers);

// [DELETE] /services/delete_user
router.delete('/delete_user', ServicesController.delete_all_user);

module.exports = router;
