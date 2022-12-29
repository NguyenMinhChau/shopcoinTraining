const express = require('express');
const router = express.Router();

const ServicesController = require('../controllers/ServicesController');

router.post('/changeFeeUsers', ServicesController.changeFeeUsers);

// [DELETE] /services/delete_user
router.delete('/delete_user', ServicesController.delete_all_user);

// [GET] /services/autoAddCommission
router.get('/autoAddCommission', ServicesController.autoAddCommission);

// [GET] /services/resetUser/:email
router.get('/resetUser/:email', ServicesController.resetUser);

// [GET] /services/autoUpdateDepositWithdrawCommission
router.get(
    '/autoUpdateDepositWithdrawCommission',
    ServicesController.auto_update_deposit_withdraw_commission_user
);

module.exports = router;
