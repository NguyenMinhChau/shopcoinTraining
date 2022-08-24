const {check} = require('express-validator')

module.exports = [
    check('methodName')
    .exists().withMessage('Vui lòng nhập methodName')
    .notEmpty().withMessage('methodName không được để trống'),

    check('accountName')
    .exists().withMessage('Vui lòng nhập accountName')
    .notEmpty().withMessage('accountName không được để trống'),

    check('accountNumber')
    .exists().withMessage('Vui lòng nhập accountNumber')
    .notEmpty().withMessage('accountNumber không được để trống'),

    check('rateDeposit')
    .exists().withMessage('Vui lòng nhập rateDeposit')
    .notEmpty().withMessage('rateDeposit không được để trống'),

    check('rateWithdraw')
    .exists().withMessage('Vui lòng nhập rateWithdraw')
    .notEmpty().withMessage('rateWithdraw không được để trống'),
]