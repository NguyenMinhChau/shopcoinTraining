/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import className from 'classnames/bind';
import { Button, FormInput, Icons, SnackbarCp } from '../../components';
import { actions } from '../../app/';
import {
    axiosUtils,
    numberUtils,
    refreshPage,
    requestRefreshToken,
    useAppContext,
} from '../../utils';
import styles from './SingleWithdrawUser.module.css';
import moment from 'moment';
import {
    handleCancelWithdraw,
    handleCheckCodeWithdraw,
    handleResendCode,
} from '../../services/withdraws';

const cx = className.bind(styles);

export default function SingleWithdrawUser() {
    const { state, dispatch } = useAppContext();
    const { currentUser } = state.set;
    const { idWithdraw } = useParams();
    const [data, setData] = useState(null);
    const [code, setCode] = useState(null);
    const [isProcess, setIsProcess] = useState(false);
    const [isProcessCancel, setIsProcessCancel] = useState(false);
    const [timer, setTimer] = useState(300);
    const [snackbar, setSnackbar] = useState({
        open: false,
        type: '',
        message: '',
    });
    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar({
            ...snackbar,
            open: false,
        });
    };
    const history = useNavigate();
    const getWithdrawById = async () => {
        const res = await axiosUtils.adminGet(`/getWithdraw/${idWithdraw}`);
        setData(res.data);
    };
    useEffect(() => {
        getWithdrawById();
    }, []);
    useEffect(() => {
        if (timer > 0) {
            setTimeout(() => setTimer(timer - 1), 1000);
        } else {
            setTimer(0);
        }
    }, [timer]);
    const handleChangeCode = useCallback((e) => {
        setCode(e.target.value);
    }, []);
    const resendCodeAPI = (data) => {
        handleResendCode({
            id: idWithdraw,
            email: currentUser?.email,
            state,
            dispatch,
            token: data?.token,
            setSnackbar,
        });
    };
    const resendCode = useCallback(() => {
        requestRefreshToken(currentUser, resendCodeAPI, state, dispatch, actions, idWithdraw);
    }, [idWithdraw, currentUser]);
    const checkCodeAPI = (data) => {
        handleCheckCodeWithdraw({
            code: code,
            token: data?.token,
            state,
            dispatch,
            setIsProcess,
            setIsProcessCancel,
            history,
        });
    };
    const handleSumbit = useCallback(() => {
        if (code) {
            setIsProcess(true);
        } else {
            setIsProcessCancel(true);
        }
        requestRefreshToken(currentUser, checkCodeAPI, state, dispatch, actions);
    }, [code]);
    const cancelAPI = (data) => {
        handleCancelWithdraw({
            token: data.token,
            id: idWithdraw,
            state,
            dispatch,
            setIsProcessCancel,
            history,
        });
    };
    const submitCancelWithdraw = useCallback(() => {
        setIsProcessCancel(true);
        requestRefreshToken(currentUser, cancelAPI, state, dispatch, actions, idWithdraw);
    }, [idWithdraw, currentUser]);
    return (
        <>
            <Button className='confirmbgc mb8' onClick={refreshPage.refreshPage}>
                <div className='flex-center'>
                    <Icons.RefreshIcon className='fz12 mr8' />
                    <span className={`${cx('general-button-text')}`}>Refresh Page</span>
                </div>
            </Button>
            <SnackbarCp
                openSnackbar={snackbar.open}
                messageSnackbar={snackbar.message}
                handleCloseSnackbar={handleCloseSnackbar}
                typeSnackbar={snackbar.type}
            />
            <div className={`${cx('info-container')}`}>
                <div className={`${cx('detail-container')}`}>
                    <div className={`${cx('info-detail')}`}>
                        <div className={`${cx('detail-item')}`}>
                            <div className={`${cx('item-title')}`}>Status</div>
                            <div className={`${cx('item-desc')}`}>
                                <span
                                    className={`fwb ${data?.status
                                        ?.toLowerCase()
                                        .replace(/ /g, '')}`}>
                                    {data?.status || '---'}
                                </span>
                            </div>
                        </div>
                        <div className={`${cx('detail-item')}`}>
                            <div className={`${cx('item-title')}`}>Created At</div>
                            <div className={`${cx('item-desc')}`}>
                                {moment(data?.createdAt).format('DD/MM/YYYY HH:mm:ss') || '---'}
                            </div>
                        </div>
                        <div className={`${cx('detail-item')}`}>
                            <div className={`${cx('item-title')}`}>Amount USD</div>
                            <div className={`${cx('item-desc')}`}>
                                {numberUtils.coinUSD(data?.amountUsd) || '---'}
                            </div>
                        </div>
                        <div className={`${cx('detail-item')}`}>
                            <div className={`${cx('item-title')}`}>Amount VND</div>
                            <div className={`${cx('item-desc')}`}>
                                {numberUtils.formatVND(data?.amountVnd) || '---'}
                            </div>
                        </div>
                        <div className={`${cx('detail-item')}`}>
                            <div className={`${cx('item-title')}`}>Method</div>
                            <div className={`${cx('item-desc')}`}>
                                <div className='text-right'>
                                    {data?.method?.methodName || '---'}
                                </div>
                                <div className='text-right'>
                                    {data?.method?.accountName || '---'}
                                </div>
                                <div className='text-right'>
                                    {data?.method?.accountNumber || '---'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={`${cx('detail-container')}`}>
                    <div className={`${cx('info-detail')}`}>
                        <div className={`${cx('detail-items')}`}>
                            <FormInput
                                label='Enter the following code'
                                placeholder='Enter verify code'
                                type='text'
                                name='code'
                                onChange={handleChangeCode}
                            />
                            <div className='fz14'>
                                This code is valid in 5 minutes. Timer:{' '}
                                <span className={`${timer <= 10 && 'cancel'}`}>
                                    {timer > 0
                                        ? `${'0' + Math.floor(timer / 60)}:${
                                              timer % 60 >= 10 ? timer % 60 : '0' + (timer % 60)
                                          }`
                                        : '00:00'}
                                </span>
                            </div>
                            <span className='complete fz14 fwb cr-pointer' onClick={resendCode}>
                                Resend Code
                            </span>
                        </div>
                        <div className={`${cx('detail-item')} mt24`}>
                            <Button
                                className='confirmbgc w100'
                                onClick={handleSumbit}
                                isProcess={isProcess}
                                disabled={isProcess || !code}>
                                Submit
                            </Button>
                            <Button
                                className='cancelbgc w100'
                                onClick={submitCancelWithdraw}
                                isProcess={isProcessCancel}
                                disabled={isProcessCancel}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
