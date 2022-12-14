import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import className from 'classnames/bind';
import { Form } from '../../components';
import { axiosUtils, useAppContext } from '../../utils';
import routers from '../../routers/routers';
import { actions } from '../../app/';
import styles from './ForgotPwd.module.css';

const cx = className.bind(styles);

function ForgotPwd() {
    const { state, dispatch } = useAppContext();
    const { email } = state.set.form;
    const [isProcess, setIsProcess] = useState(false);
    const history = useNavigate();
    useEffect(() => {
        document.title = `Forgot Password | ${process.env.REACT_APP_TITLE_WEB}`;
    }, []);
    const handleForgot = async (e) => {
        e.preventDefault();
        try {
            setIsProcess(true);
            const resPost = await axiosUtils.userPost('/forgotPassword', {
                email: email,
            });
            switch (resPost.code) {
                case 0:
                    dispatch(
                        actions.setData({
                            ...state.set,
                            tokenResetPwd: resPost?.data,
                            form: {
                                username: '',
                                email: '',
                                password: '',
                            },
                            message: {
                                error: '',
                            },
                        })
                    );
                    history(routers.resetPwdUser);
                    break;
                case 1:
                case 2:
                    dispatch(
                        actions.setData({
                            ...state.set,
                            message: {
                                ...state.set.message,
                                error: resPost?.message,
                            },
                        })
                    );
                    break;
                default:
                    break;
            }
            setIsProcess(false);
        } catch (error) {
            console.log(error);
        }
    };
    const onEnter = (e) => {
        handleForgot(e);
    };

    return (
        <Form
            titleForm='Forgot Password'
            textBtn='Send email'
            onClick={handleForgot}
            bolEmail
            forgotPwdForm
            isProcess={isProcess}
            className={cx('form-page-login')}
            onEnter={onEnter}
        />
    );
}

export default ForgotPwd;
