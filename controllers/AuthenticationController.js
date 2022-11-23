// import libs
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const otpGenerator = require('otp-generator');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// import models
const User = require('../models/User');

// import functions
const { errCode1, errCode2, successCode, dataCode } = require('../functions');

class AuthenticationController {
    // [POST] /authentication/register
    register(req, res) {
        const { email, password, username } = req.body;
        User.findOne({ 'payment.email': email }, (err, user) => {
            if (err) {
                errCode1(res, err);
            } else if (user) {
                errCode2(res, `Email đã tồn tại vui lòng nhập email khác`);
            } else {
                User.findOne({ 'payment.username': username }, (e, u) => {
                    if (e) {
                        return res.json({ code: 1, message: e.message });
                    } else if (u) {
                        errCode2(
                            res,
                            `Username đã tồn tại vui lòng nhập tên khác`
                        );
                    } else {
                        bcrypt.hash(password, 10).then((hashed) => {
                            const newUser = new User({
                                payment: {
                                    email: email,
                                    username: username,
                                    password: hashed
                                }
                            });

                            // const token = jwt.sign(
                            //     { user_id: newUser._id, email },
                            //     process.env.JWT_SECRET,
                            //     {
                            //         expiresIn: '1h'
                            //     }
                            // );
                            // save user token
                            // newUser.token = token;
                            newUser
                                .save()
                                .then((person) => {
                                    dataCode(res, person);
                                })
                                .catch((err) => console.log(err.message));
                        });
                    }
                });
            }
        });
    }

    // [POST] /authentication/login
    login(req, res) {
        const { email, password } = req.body;
        User.findOne({ 'payment.email': email }, (err, user) => {
            if (err) {
                errCode1(res, err);
            }
            if (!user) {
                errCode2(res, `Tài khoản không tồn tại với email: ${email}`);
            }
            bcrypt.compare(password, user.payment.password).then((match) => {
                if (match) {
                    const locked = user.blockUser;

                    if (locked) {
                        errCode2(
                            res,
                            `Tài khoản đã bị khoá vui lòng liên hệ admin để mở khoá !!!`
                        );
                    } else {
                        const token = jwt.sign(
                            { id: user._id, email },
                            process.env.JWT_SECRET,
                            {
                                expiresIn: '30s'
                            }
                        );
                        const refreshToken = jwt.sign(
                            { id: user._id, email },
                            process.env.JWT_SECRET,
                            {
                                expiresIn: '1d'
                            }
                        );

                        res.cookie('jwt', refreshToken, {
                            httpOnly: true,
                            sameSite: 'strict',
                            secure: false,
                            maxAge: 24 * 60 * 1000 * 60 // 1d
                        });

                        dataCode(res, {
                            token: token,
                            user: user
                        });
                    }
                } else {
                    errCode2(res, `Mật khẩu hoặc là email sai`);
                }
            });
        });
    }

    // [POST] /admin/refreshToken
    refreshToken(req, res) {
        const refreshToken = req.cookies.jwt;
        if (refreshToken) {
            // const {id, email} = req.body
            jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    errCode1(res, err);
                } else {
                    const token = jwt.sign(
                        { id: decoded.id, email: decoded.email },
                        process.env.JWT_SECRET,
                        {
                            expiresIn: '30m'
                        }
                    );
                    const refreshToken = jwt.sign(
                        { id: decoded.id, email: decoded.email },
                        process.env.JWT_SECRET,
                        {
                            expiresIn: '1d'
                        }
                    );

                    res.cookie('jwt', refreshToken, {
                        httpOnly: true,
                        sameSite: 'strict',
                        secure: false,
                        maxAge: 24 * 60 * 1000 * 60
                    });

                    return res.json({ code: 0, newtoken: token });
                    // console.log(decoded)
                    // return res.json("OK")
                }
            });
        } else {
            return res.json('No jwt');
        }
    }

    // [POST] /authentication/logout
    logout(req, res, next) {
        // req.session.destroy();
        res.clearCookie('jwt');
        errCode2(res, `Logout`);
    }
}
module.exports = new AuthenticationController();
