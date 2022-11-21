const express = require('express');
const router = express.Router();

const ServicesController = require('../controllers/ServicesController');

// [POST] services/deposit
router.post('/deposit', ServicesController.deposit);

// [PUT] /users/additionImageDeposit/:id
router.put(
    '/additionImageDeposit/:id',
    ServicesController.additionImageDeposit
);

// [GET] /users/enterOTPWithdraw/:code
router.get('/enterOTPWithdraw/:code', ServicesController.enterOTPWithdraw);

// [POST] /users/withdraw
router.post('/withdraw', ServicesController.withdraw);

// [DELETE] /users/cancelWithdraw/:id
router.delete('/cancelWithdraw/:id', ServicesController.cancelWithdraw);

module.exports = router;
