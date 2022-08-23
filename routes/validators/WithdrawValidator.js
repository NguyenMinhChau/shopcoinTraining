const {check} = require('express-validator')

module.exports = [
    check('amount')
    .exists().withMessage('Vui lòng nhập amount')
    .notEmpty().withMessage('amount không được để trống'),

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