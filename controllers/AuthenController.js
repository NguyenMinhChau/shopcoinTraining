const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const path = require('path');
const fs = require('fs');

// import Models
const User = require('../models/User');

const { errCode1, errCode2, dataCode } = require('../function');

class AuthenController {
    // [POST] /admin/register
    register(req, res) {
        let result = validationResult(req);
        if (result.errors.length === 0) {
            const { email, password, username } = req.body;
            User.findOne({ 'payment.email': email }, (err, user) => {
                if (err) {
                    return res.json({ code: 1, message: err.message });
                } else if (user) {
                    return res.json({ code: 2, message: 'Email is exists' });
                } else {
                    User.findOne({ 'payment.username': username }, (e, u) => {
                        if (e) {
                            return res.json({ code: 1, message: e.message });
                        } else if (u) {
                            return res.json({
                                code: 2,
                                message: 'Username is exists'
                            });
                        } else {
                            bcrypt.hash(password, 10).then((hashed) => {
                                const newUser = new User({
                                    payment: {
                                        email: email,
                                        username: username,
                                        password: hashed
                                    }
                                });

                                const token = jwt.sign(
                                    { user_id: newUser._id, email },
                                    process.env.JWT_SECRET,
                                    {
                                        expiresIn: '1h'
                                    }
                                );
                                // save user token
                                // newUser.token = token;
                                newUser
                                    .save()
                                    .then((person) => {
                                        return res.json({
                                            code: 0,
                                            token: token,
                                            account: person
                                        });
                                    })
                                    .catch((err) => console.log(err.message));
                            });
                        }
                    });
                }
            });
        } else {
            let messages = result.mapped();
            let message = '';
            for (let m in messages) {
                message = messages[m];
                break;
            }
            return res.json({ code: 1, message: message.msg });
        }
    }

    // [POST] /admin/login
    login(req, res) {
        let result = validationResult(req);
        if (result.errors.length === 0) {
            const { email, password } = req.body;
            User.findOne({ 'payment.email': email }, (err, user) => {
                if (err) {
                    return res.json({ code: 2, message: err.message });
                }
                if (!user) {
                    return res.json({ code: 2, message: 'User is not exist' });
                }
                bcrypt
                    .compare(password, user.payment.password)
                    .then((match) => {
                        if (match) {
                            const locked = user.blockUser;

                            if (locked) {
                                errCode2(
                                    res,
                                    `User is locked !! Please contact admin to unlock your account !!!`
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
                                    maxAge: 60 * 1000 * 60
                                });

                                return res.json({
                                    code: 0,
                                    userInfo: user,
                                    token: token
                                });
                            }
                        } else {
                            return res.json({
                                code: 2,
                                message: 'Passowrd is wrong'
                            });
                        }
                    });
            });
        } else {
            let messages = result.mapped();
            let message = '';
            for (let m in messages) {
                message = messages[m];
                break;
            }
            return res.json({ code: 1, message: message.msg });
        }
    }

    // [POST] /admin/refreshToken
    refreshToken(req, res) {
        const refreshToken = req.cookies.jwt;
        if (refreshToken) {
            // const {id, email} = req.body
            jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    return res.json('Error refreshToken');
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
                        maxAge: 60 * 1000 * 60
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

    logout(req, res) {
        // req.session.destroy();
        res.clearCookie('jwt');
        return res.json({ code: 0, message: 'Logout' });
    }
}
module.exports = new AuthenController();
