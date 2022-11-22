const express = require('express');
const router = express.Router();

// import controllers
const AdminController = require('../controllers/AdminController');
const RateController = require('../controllers/RateController');

// import check authentication
const { verifyPermission, verifyToken } = require('../auth/checkAuth');

// [GET] /admin/getAllUsers
router.get('/getAllUsers', AdminController.getAllUser);

// [GET] /admin/getRate
router.get('/getRate', RateController.getRate);

// [GET] /admin/updateRate
router.get('/updateRate', RateController.updateRate);

module.exports = router;
