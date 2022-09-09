const {check} = require('express-validator')

module.exports = [
    check('name')
    .exists().withMessage('Vui lòng nhập name')
    .notEmpty().withMessage('name không được để trống'),

    check('symbols')
    .exists().withMessage('Vui lòng nhập symbol')
    .notEmpty().withMessage('symbol không được để trống'),

    check('fullName')
    .exists().withMessage('Vui lòng nhập fullName')
    .notEmpty().withMessage('fullName không được để trống'),
]
