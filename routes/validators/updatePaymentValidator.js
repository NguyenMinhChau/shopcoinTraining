const {check} = require('express-validator')

module.exports = [
    check('method')
    .exists().withMessage('Vui lòng nhập method')
    .notEmpty().withMessage('method không được để trống'),

    check('name')
    .exists().withMessage('Vui lòng nhập name')
    .notEmpty().withMessage('name không được để trống'),

    check('idMethod')
    .exists().withMessage('Vui lòng nhập idMethod')
    .notEmpty().withMessage('idMethod không được để trống'),

    check('rateWithdraw')
    .exists().withMessage('Vui lòng nhập rateWithdraw')
    .notEmpty().withMessage('rateWithdraw không được để trống'),

    check('rateDeposit')
    .exists().withMessage('Vui lòng nhập rateDeposit')
    .notEmpty().withMessage('rateDeposit không được để trống'),
]