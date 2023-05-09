/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import className from 'classnames/bind';
import styles from './SingleDepositUser.module.css';
import { Button, FileUpload, Icons, Image } from '../../components';
import { actions } from '../../app/';
import moment from 'moment';
import {
    fileUploadUtils,
    numberUtils,
    refreshPage,
    requestRefreshToken,
    useAppContext,
} from '../../utils';
import { useParams, useNavigate } from 'react-router-dom';
import { getDepositsWithdrawById, handleUpdateBillDeposit } from '../../services/deposits';

const cx = className.bind(styles);

export default function SingleDepositUser() {
    const { state, dispatch } = useAppContext();
    const { edit } = state.set;
    const { idDeposit } = useParams();
    const {
        currentUser,
        fileRejections,
        form: { logo },
    } = state.set;
    const [isProcess, setIsProcess] = useState(false);
    const refLogo = useRef();
    const history = useNavigate();
    useEffect(() => {
        getDepositsWithdrawById({
            idDeposits: idDeposit,
            state,
            dispatch,
        });
    }, []);
    const x = edit?.itemData && edit?.itemData;
    const handleRejected = useCallback(
        (fileRejections) => {
            return fileUploadUtils.handleRejected(fileRejections, dispatch, state, actions);
        },
        [fileRejections]
    );
    const handleRemove = useCallback(() => {
        return fileUploadUtils.handleRemove(dispatch, state, actions);
    }, []);
    const handleChange = useCallback((files) => {
        return fileUploadUtils.handleChange(files, dispatch, state, actions);
    }, []);
    const handleUploadImageAPI = (data) => {
        handleUpdateBillDeposit({
            token: data.token,
            id: idDeposit,
            logo: logo,
            setIsProcess,
            state,
            dispatch,
            actions,
            history,
        });
    };
    const handleSubmit = useCallback(() => {
        setIsProcess(true);
        requestRefreshToken(currentUser, handleUploadImageAPI, state, dispatch, actions, idDeposit);
    }, [logo]);
    const URL_SERVER =
        process.env.REACT_APP_TYPE === 'development'
            ? process.env.REACT_APP_URL_SERVER
            : process.env.REACT_APP_URL_SERVER_PRODUCTION;
    return (
        <>
            <Button className='confirmbgc mb8' onClick={refreshPage.refreshPage}>
                <div className='flex-center'>
                    <Icons.RefreshIcon className='fz12 mr8' />
                    <span className={`${cx('general-button-text')}`}>Refresh Page</span>
                </div>
            </Button>
            <div className={`${cx('info-container')}`}>
                <div className={`${cx('detail-container')}`}>
                    <div className={`${cx('info-detail')}`}>
                        <div className={`${cx('detail-item')}`}>
                            <div className={`${cx('item-title')}`}>Code</div>
                            <div className={`${cx('item-desc')}`}>{x?.code || '---'}</div>
                        </div>
                        <div className={`${cx('detail-item')}`}>
                            <div className={`${cx('item-title')}`}>Status</div>
                            <div className={`${cx('item-desc')}`}>
                                <span
                                    className={`fwb ${x?.status
                                        ?.toLowerCase()
                                        ?.replace(/ /g, '')}`}>
                                    {x?.status || '---'}
                                </span>
                            </div>
                        </div>
                        <div className={`${cx('detail-item')}`}>
                            <div className={`${cx('item-title')}`}>Created At</div>
                            <div className={`${cx('item-desc')}`}>
                                {moment(x?.createdAt).format('DD/MM/YYYY HH:mm:ss') || '---'}
                            </div>
                        </div>
                        <div className={`${cx('detail-item')}`}>
                            <div className={`${cx('item-title')}`}>Updated At</div>
                            <div className={`${cx('item-desc')}`}>
                                {moment(x?.updatedAt).format('DD/MM/YYYY HH:mm:ss') || '---'}
                            </div>
                        </div>
                        <div className={`${cx('detail-item')}`}>
                            <div className={`${cx('item-title')}`}>Amount USD</div>
                            <div className={`${cx('item-desc')}`}>
                                {numberUtils.coinUSD(x?.amountUsd) || '---'}
                            </div>
                        </div>
                        <div className={`${cx('detail-item')}`}>
                            <div className={`${cx('item-title')}`}>Amount VND</div>
                            <div className={`${cx('item-desc')}`}>
                                {numberUtils.formatVND(x?.amountVnd)}
                            </div>
                        </div>
                        <div className={`${cx('detail-item')}`}>
                            <div className={`${cx('item-title')}`}>Method</div>
                            <div className={`${cx('item-desc')}`}>
                                <div className='text-right'>{x?.bankAdmin?.methodName}</div>
                                <div className='text-right'>{x?.bankAdmin?.accountName}</div>
                                <div className='text-right'>{x?.bankAdmin?.accountNumber}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={`${cx('detail-container')}`}>
                    <div className={`${cx('info-detail')}`}>
                        {!x?.statement ? (
                            <FileUpload
                                ref={refLogo}
                                onChange={handleChange}
                                onRemove={handleRemove}
                                onRejected={handleRejected}
                                fileRejections={fileRejections}
                            />
                        ) : (
                            <div className={`${cx('image-view-container')}`}>
                                <Image
                                    src={`${URL_SERVER}${x?.statement?.replace('uploads/', '')}`}
                                    alt=''
                                    className={`${cx('image-view')}`}
                                />
                            </div>
                        )}
                    </div>
                    {!x?.statement && (
                        <div className={`${cx('info-detail')}`}>
                            <Button
                                className='w100 confirmbgc'
                                onClick={handleSubmit}
                                isProcess={isProcess}
                                disabled={isProcess || !logo}>
                                Submit
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
