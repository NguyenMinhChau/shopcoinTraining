const {check} = require('express-validator')

module.exports = [
    check('bankName')
    .exists().withMessage('Vui lòng nhập bankName')
    .notEmpty().withMessage('bankName không được để trống'),

    check('nameAccount')
    .exists().withMessage('Vui lòng nhập nameAccount')
    .notEmpty().withMessage('nameAccount không được để trống'),

    check('accountNumber')
    .exists().withMessage('Vui lòng nhập accountNumber')
    .notEmpty().withMessage('accountNumber không được để trống'),
]