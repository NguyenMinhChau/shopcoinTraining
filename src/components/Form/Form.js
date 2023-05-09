import React from 'react';
import PropTypes from 'prop-types';
import className from 'classnames/bind';
import { Image, FormInput, Button, SnackbarCp } from '../../components';
import { useAppContext, formUtils } from '../../utils';
import { actions } from '../../app/';
import styles from './Form.module.css';
import { Link } from 'react-router-dom';
import routers from '../../routers/routers';

const cx = className.bind(styles);

function Form({
    titleForm,
    textBtn,
    onClick,
    onEnter,
    disabled,
    bolUsername,
    bolEmail,
    bolPassword,
    bolOtpCode,
    loginForm,
    registerForm,
    forgotPwdForm,
    resetPwdForm,
    isProcess,
    className,
    children,
    openSnackbar,
    handleCloseSnackbar,
    messageSnackbar,
    typeSnackbar,
}) {
    const { state, dispatch } = useAppContext();
    const { email, password, username, otpCode } = state.set.form;
    const classed = cx('form-container', className);
    const handleChange = (e) => {
        return formUtils.changeForm(e, dispatch, state, actions);
    };
    return (
        <div
            className={classed}
            style={{
                backgroundImage: 'url(/images/bg-login.png)',
            }}>
            <div className={`${cx('form-container-main')}`}>
                <div className={`${cx('form-login')}`}>
                    <Image
                        src='/images/header-logo.png'
                        alt='login-logo'
                        className={`${cx('form-logo')}`}
                    />
                    <p className={`${cx('form-title')}`}>{titleForm}</p>
                    <SnackbarCp
                        openSnackbar={openSnackbar}
                        handleCloseSnackbar={handleCloseSnackbar}
                        messageSnackbar={messageSnackbar}
                        typeSnackbar={typeSnackbar}
                    />
                    {bolUsername && (
                        <FormInput
                            label='Username'
                            type='text'
                            placeholder='Enter your username'
                            classNameField={`${cx('custom-field')}`}
                            value={username}
                            name='username'
                            onChange={handleChange}
                            onEnter={onEnter}
                        />
                    )}
                    {bolEmail && (
                        <FormInput
                            label='Email'
                            type='email'
                            placeholder='Enter your email'
                            classNameField={`${cx('custom-field')}`}
                            value={email}
                            name='email'
                            onChange={handleChange}
                            onEnter={onEnter}
                        />
                    )}
                    {bolOtpCode && (
                        <FormInput
                            label='OTP Code'
                            type='text'
                            placeholder='Enter your OTP'
                            classNameField={`${cx('custom-field')}`}
                            value={otpCode}
                            name='otpCode'
                            onChange={handleChange}
                            onEnter={onEnter}
                        />
                    )}
                    {bolPassword && (
                        <FormInput
                            label='Password'
                            type='password'
                            placeholder='Enter your password'
                            classNameField={`${cx('custom-field')}`}
                            value={password}
                            name='password'
                            onChange={handleChange}
                            showPwd
                            onEnter={onEnter}
                        />
                    )}
                    {children}
                    <Button
                        isProcess={isProcess}
                        disabled={isProcess || disabled}
                        className={`${cx('form-btn')}`}
                        onClick={onClick}>
                        {textBtn}
                    </Button>
                    {(loginForm || registerForm) && (
                        <div className={`${cx('form-help')}`}>
                            <span>
                                {loginForm ? "Don't have an account?" : 'Have an account?'}{' '}
                            </span>
                            <Link
                                className={`${cx('form-link')}`}
                                to={loginForm ? `${routers.register}` : `${routers.login}`}>
                                {loginForm ? 'Register' : 'Login'}
                            </Link>
                        </div>
                    )}
                    {(forgotPwdForm || resetPwdForm) && (
                        <>
                            <div className={`${cx('form-help')}`}>
                                <span>Have an account? </span>
                                <Link className={`${cx('form-link')}`} to={`${routers.login}`}>
                                    Login
                                </Link>
                            </div>
                            <div className={`${cx('form-help')}`}>
                                <span>Don't have an account? </span>
                                <Link className={`${cx('form-link')}`} to={`${routers.register}`}>
                                    Register
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

Form.propTypes = {
    titleForm: PropTypes.string,
    textBtn: PropTypes.string,
    onClick: PropTypes.func,
    bolUsername: PropTypes.bool,
    bolEmail: PropTypes.bool,
    bolPassword: PropTypes.bool,
    loginForm: PropTypes.bool,
    registerForm: PropTypes.bool,
    forgotPwdForm: PropTypes.bool,
    className: PropTypes.string,
    children: PropTypes.node,
};

export default Form;
