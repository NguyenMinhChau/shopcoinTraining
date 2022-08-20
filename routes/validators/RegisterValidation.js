const {check} = require('express-validator')

module.exports = [
    check('username')
    .exists().withMessage('Vui lòng nhập username')
    .notEmpty().withMessage('Username không được để trống'),

    check('email')
    .exists().withMessage('Vui lòng nhập email')
    .notEmpty().withMessage('Email không được để trống')
    .isEmail().withMessage('Email không hợp lệ'),

    check('password')
    .exists().withMessage('Vui lòng nhập password')
    .notEmpty().withMessage('Password không được để trống')
    .isLength({min: 6}).withMessage('Mật khẩu phải từ 6 kí tự trở lên'),
]