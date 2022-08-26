const {check} = require('express-validator')

module.exports = [
    check('fee')
    .exists().withMessage('Vui lòng nhập fee')
    .notEmpty().withMessage('fee không được để trống'),

    check('gmailUser')
    .exists().withMessage('Vui lòng nhập gmailUser')
    .notEmpty().withMessage('gmailUser không được để trống'),

    check('amount')
    .exists().withMessage('Vui lòng nhập amount')
    .notEmpty().withMessage('amount không được để trống'),

    check('amountUsdt')
    .exists().withMessage('Vui lòng nhập amountUsdt')
    .notEmpty().withMessage('amountUsdt không được để trống'),

    check('symbol')
    .exists().withMessage('Vui lòng nhập symbol')
    .notEmpty().withMessage('symbol không được để trống'),

    check('price')
    .exists().withMessage('Vui lòng nhập price')
    .notEmpty().withMessage('price không được để trống'),

    check('type')
    .exists().withMessage('Vui lòng nhập type')
    .notEmpty().withMessage('type không được để trống'),
]