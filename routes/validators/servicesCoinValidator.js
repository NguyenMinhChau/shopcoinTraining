const { check } = require('express-validator');

module.exports = [
    check('gmailUser')
        .exists()
        .withMessage('Vui lòng nhập gmailUser')
        .notEmpty()
        .withMessage('gmailUser không được để trống'),

    check('amount')
        .exists()
        .withMessage('Vui lòng nhập amount')
        .notEmpty()
        .withMessage('amount không được để trống'),

    check('amountUsd')
        .exists()
        .withMessage('Vui lòng nhập amountUsd')
        .notEmpty()
        .withMessage('amountUsd không được để trống'),

    check('symbol')
        .exists()
        .withMessage('Vui lòng nhập symbol')
        .notEmpty()
        .withMessage('symbol không được để trống'),

    check('price')
        .exists()
        .withMessage('Vui lòng nhập price')
        .notEmpty()
        .withMessage('price không được để trống'),

    check('type')
        .exists()
        .withMessage('Vui lòng nhập type')
        .notEmpty()
        .withMessage('type không được để trống')
];
