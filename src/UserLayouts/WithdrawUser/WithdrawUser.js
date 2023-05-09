/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react';
import className from 'classnames/bind';
import styles from './WithdrawUser.module.css';
import { General } from '../../Layouts';
import {
    axiosUtils,
    DataWithdrawUser,
    handleUtils,
    numberUtils,
    requestRefreshToken,
    useAppContext,
    useDebounce,
} from '../../utils';
import { actions } from '../../app/';
import { handleCreate } from '../../services/withdraws';
import { ActionsTable, FormInput, Icons, Modal } from '../../components';
import { TrObjectIcon } from '../../components/TableData/TableData';
import moment from 'moment';
import { Link } from 'react-router-dom';
import routers from '../../routers/routers';

const cx = className.bind(styles);

function RenderBodyTable({ data }) {
    const [rate, setRate] = useState(null);
    const getRate = async () => {
        const resGet = await axiosUtils.adminGet('/getRates');
        setRate(resGet.data);
    };
    useEffect(() => {
        getRate();
    }, []);
    const { state } = useAppContext();
    const {
        pagination: { page, show },
    } = state.set;
    return (
        <>
            {data.map((item, index) => {
                const sendReceived = {
                    send: {
                        icon: <Icons.SendIcon />,
                        title: 'Send',
                        number: numberUtils.formatUSD(item?.amountUsd),
                    },
                    received: {
                        icon: <Icons.ReceivedIcon />,
                        title: 'Received',
                        number: numberUtils.formatVND(item?.amountVnd),
                    },
                };
                return (
                    <tr key={item?._id}>
                        <td>{handleUtils.indexTable(page, show, index)}</td>
                        <td className='item-w150'>{item?.symbol}</td>
                        <td>
                            <TrObjectIcon item={sendReceived} />
                        </td>
                        <td className='item-w150'>
                            {numberUtils.formatVND(rate?.rateWithdraw) || '---'}
                        </td>
                        <td className='item-w100'>
                            {moment(item?.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                        </td>
                        <td className='item-w150'>
                            <div>{item?.method?.methodName}</div>
                            <div>{item?.method?.accountName}</div>
                            <div>{item?.method?.accountNumber}</div>
                        </td>
                        <td style={{ alignItems: 'center' }}>
                            <span
                                className={`status ${
                                    item?.status?.toLowerCase().replace(/\s/g, '') + 'bgc'
                                }`}>
                                {item?.status}
                            </span>
                        </td>
                        {item?.status?.toLowerCase().replace(/\s/g, '') !== 'completed' &&
                            item?.status?.toLowerCase().replace(/\s/g, '') !== 'confirmed' && (
                                <td>
                                    <ActionsTable
                                        view
                                        noDel
                                        verifyCode
                                        linkView={`${routers.withdrawUser}/${item?._id}`}
                                    />
                                </td>
                            )}
                    </tr>
                );
            })}
        </>
    );
}

export default function WithdrawUser() {
    const { state, dispatch } = useAppContext();
    const {
        currentUser,
        searchValues: { withdrawUser },
        pagination: { page, show },
    } = state.set;
    const { selectBank } = state.toggle;
    const [data, setData] = useState([]);
    const [rate, setRate] = useState(null);
    const [user, setUser] = useState([]);
    const [amountUSD, setAmountUSD] = useState();
    const [error, setError] = useState('');
    const [isProcess, setIsProcess] = useState(false);
    const useDebounceWithdraw = useDebounce(withdrawUser, 500);
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
    useEffect(() => {
        if (useDebounceWithdraw) {
            setTimeout(() => {
                dispatch(
                    actions.setData({
                        pagination: { page: 1, show: 10 },
                    })
                );
            }, 500);
        }
    }, [useDebounceWithdraw]);
    const getDepositByEmail = async () => {
        const resGet = await axiosUtils.userGet(
            `/getAllWithdraw/${currentUser?.email}?page=${page}&show=${show}&search=${useDebounceWithdraw}`
        );
        setData(resGet.data);
    };
    const getRate = async () => {
        const resGet = await axiosUtils.adminGet('/getRates');
        setRate(resGet.data);
    };
    const getUser = async () => {
        const process = await axiosUtils.adminGet(`/getUser/${currentUser?.id}`);
        setUser(process.data);
    };
    useEffect(() => {
        getDepositByEmail();
        getRate();
        getUser();
    }, [page, show, useDebounceWithdraw]);
    const openModal = useCallback((e) => {
        e.stopPropagation();
        dispatch(
            actions.toggleModal({
                selectBank: true,
            })
        );
    }, []);
    const closeModal = useCallback((e) => {
        e.stopPropagation();
        setAmountUSD('');
        dispatch(
            actions.toggleModal({
                selectBank: false,
            })
        );
    }, []);
    const handleChangeAmountUSD = useCallback((e) => {
        if (e.target.value) {
            if (e.target.value < 10) {
                setError('Amount USD must be greater than 10');
            } else if (isNaN(e.target.value)) {
                setError('Amount USD must be number');
            } else {
                setError('');
            }
            setAmountUSD(e.target.value);
        } else {
            setError('');
            setAmountUSD('');
        }
    }, []);
    const createWithdrawAPI = (data) => {
        handleCreate({
            amount: amountUSD,
            email: currentUser?.email,
            rateWithdraw: rate?.rateWithdraw,
            dispatch,
            state,
            token: data?.token,
            setIsProcess,
            setData,
            setSnackbar,
        });
    };
    const handleSubmit = useCallback(
        (e) => {
            setIsProcess(true);
            requestRefreshToken(currentUser, createWithdrawAPI, state, dispatch, actions);
        },
        [amountUSD]
    );
    const dataSettingFlag = data?.withdraws || [];
    const isShowBodyModalWithdarw =
        (user?.Wallet?.balance || user?.Wallet?.balance === 0) &&
        user?.payment?.bank?.bankName &&
        user?.payment?.bank?.name &&
        user?.payment?.bank?.account &&
        user?.uploadCCCDBeside &&
        user?.uploadCCCDFont &&
        user?.uploadLicenseBeside &&
        user?.uploadLicenseFont;
    return (
        <>
            <General
                className={cx('setting-coin')}
                valueSearch={withdrawUser}
                nameSearch='withdrawUser'
                dataFlag={dataSettingFlag}
                dataHeaders={DataWithdrawUser().headers}
                totalData={data?.total || data?.totalSearch}
                classNameButton='completebgc'
                textBtnNew='Create Withdraw'
                noActions
                onCreate={openModal}
                handleCloseSnackbar={handleCloseSnackbar}
                openSnackbar={snackbar.open}
                typeSnackbar={snackbar.type}
                messageSnackbar={snackbar.message}>
                <RenderBodyTable data={dataSettingFlag} />
            </General>
            {selectBank && (
                <Modal
                    titleHeader='Create Withdraw'
                    actionButtonText='Submit'
                    classNameButton='vipbgc'
                    openModal={openModal}
                    closeModal={closeModal}
                    isProcess={isProcess}
                    disabled={error || !amountUSD}
                    onClick={handleSubmit}
                    hideButton={!isShowBodyModalWithdarw}>
                    {isShowBodyModalWithdarw ? (
                        <>
                            <div className={`${cx('info-user')}`}>
                                <div className={`${cx('info-user-item')}`}>
                                    <div className={`${cx('info-user-title')}`}>Your Wallet</div>
                                    <div className={`${cx('info-user-desc')} vip`}>
                                        {numberUtils.coinUSD(user?.Wallet?.balance)}
                                    </div>
                                </div>
                                <div className={`${cx('info-user-item')}`}>
                                    <div className={`${cx('info-user-title')}`}>
                                        Your bank account
                                    </div>
                                    <div className={`${cx('info-user-desc')} complete`}>
                                        <div className='text-right'>
                                            {user?.payment?.bank?.bankName}
                                        </div>
                                        <div className='text-right'>
                                            {user?.payment?.bank?.name}
                                        </div>
                                        <div className='text-right'>
                                            {user?.payment?.bank?.account}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <FormInput
                                label='Amount USD'
                                placeholder='Enter amount USD'
                                type='text'
                                name='amountUSD'
                                onChange={handleChangeAmountUSD}
                            />
                            {error && <div className='cancel fz14'>{error}</div>}
                            {amountUSD && (
                                <div className='fz16 complete fwb'>
                                    Receive (VND):{' '}
                                    {numberUtils.formatVND(amountUSD * rate?.rateWithdraw || 0)}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className={`${cx('text-desc')}`}>
                            You don't have a payment account yet or you haven't uploaded the
                            document yet, please create one before doing so. Click{' '}
                            <Link to={`${routers.profileUser}`} onClick={closeModal}>
                                here
                            </Link>{' '}
                            create payment and upload documents. Thank you!
                        </div>
                    )}
                </Modal>
            )}
        </>
    );
}
