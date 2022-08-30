const {check} = require('express-validator')

module.exports = [
    check('status')
    .exists().withMessage('Vui lòng nhập status')
    .notEmpty().withMessage('status không được để trống'),

    check('amount')
    .exists().withMessage('Vui lòng nhập amount')
    .notEmpty().withMessage('amount không được để trống'),

    check('methodName')
    .exists().withMessage('Vui lòng nhập methodName')
    .notEmpty().withMessage('methodName không được để trống'),

    check('accountName')
    .exists().withMessage('Vui lòng nhập accountName')
    .notEmpty().withMessage('accountName không được để trống'),

    check('accountNumber')
    .exists().withMessage('Vui lòng nhập accountNumber')
    .notEmpty().withMessage('accountNumber không được để trống'),

    check('transform')
    .exists().withMessage('Vui lòng nhập transform')
    .notEmpty().withMessage('transform không được để trống'),

    check('amountUsd')
    .exists().withMessage('Vui lòng nhập amountUsd')
    .notEmpty().withMessage('amountUsd không được để trống'),

    check('amountVnd')
    .exists().withMessage('Vui lòng nhập amountVnd')
    .notEmpty().withMessage('amountVnd không được để trống'),

    check('symbol')
    .exists().withMessage('Vui lòng nhập symbol')
    .notEmpty().withMessage('symbol không được để trống'),
]