/* eslint-disable no-lone-blocks */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import className from 'classnames/bind';
import moment from 'moment';
import {
    useAppContext,
    DataChangeCoins,
    deleteUtils,
    handleUtils,
    requestRefreshToken,
    useDebounce,
    searchUtils,
} from '../../utils';
import { Icons, ActionsTable, Modal, SelectValue } from '../../components';
import { actions } from '../../app/';
import { General } from '../';
import { TrObjectNoIcon, TrStatus } from '../../components/TableData/TableData';
import styles from './ChangeCoin.module.css';
import Skeleton from 'react-loading-skeleton';
import {
    changeCoinGiftsSUB,
    checkErrorChangeCoin,
    deleteChangeCoin,
    getChangeCoin,
} from '../../services/changeCoin';
import { changeCoinGifts, searchCoinGift } from '../../services/users';

const cx = className.bind(styles);

function ChangeCoin() {
    const { state, dispatch } = useAppContext();
    const {
        currentUser,
        changeCoin,
        quantityCoin,
        searchValues: { changeCoinSearch, coin },
        pagination: { page, show },
        data: { dataChangeCoins, dataUser, dataSettingCoin },
    } = state.set;
    const { modalDelete, selectStatus } = state.toggle;
    const [isProcess, setIsProcess] = useState(false);
    const [modalDelete1, setModalDelete1] = useState(false);
    const [id, setId] = useState('');
    const [email, setEmail] = useState('');
    useEffect(() => {
        document.title = `Change Coin | ${process.env.REACT_APP_TITLE_WEB}`;
    }, []);
    const useDebounceCoin = useDebounce(changeCoinSearch, 500);
    useEffect(() => {
        if (useDebounceCoin) {
            setTimeout(() => {
                dispatch(
                    actions.setData({
                        pagination: { page: 1, show: 10 },
                    })
                );
            }, 500);
        }
    }, [useDebounceCoin]);
    useEffect(() => {
        getChangeCoin({
            page,
            show,
            dispatch,
            state,
            actions,
            search: useDebounceCoin || '',
            dataSettingCoin,
        });
    }, [page, show, useDebounceCoin]);
    let dataCoinFlag =
        dataChangeCoins?.data?.bills ||
        dataChangeCoins?.data?.billSearch ||
        dataChangeCoins?.data;
    // Modal
    const modalDeleteTrue = (e, id) => {
        deleteUtils.deleteTrue(e, id, dispatch, state, actions);
    };
    const modalDeleteFalse = async (e) => {
        deleteUtils.deleteFalse(e, dispatch, state, actions);
        setIsProcess(false);
        dispatch(
            actions.setData({
                quantityCoin: '',
                changeCoin: '',
            })
        );
    };
    const modalDeleteTrue1 = (e, id) => {
        dispatch(
            actions.setData({
                // ...state.set,
                edit: { ...state.set.edit, id },
            })
        );
        setModalDelete1(true);
    };
    const modalDeleteFalse1 = async (e) => {
        setIsProcess(false);
        setModalDelete1(false);
    };
    const toggleListCoin = (e) => {
        e.stopPropagation();
        dispatch(
            actions.toggleModal({
                selectStatus: !selectStatus,
            })
        );
        dispatch(
            actions.setData({
                pagination: {
                    page: 1,
                    show: dataSettingCoin?.total,
                },
            })
        );
    };
    const searchSelect = (e) => {
        return searchUtils.logicSearch(e, dispatch, state, actions);
    };
    const handleChangeCoinModal = (e, coin) => {
        e.stopPropagation();
        changeCoinGifts({ coin, selectStatus, dispatch, state, actions });
    };
    const changeQuantity = (e) => {
        dispatch(
            actions.setData({
                quantityCoin: e.target.value,
            })
        );
    };
    // Edit + Delete Deposits
    const changeCoinAPI = async (data) => {
        changeCoinGiftsSUB({
            data,
            email: email,
            coin: changeCoin,
            quantityCoin: parseFloat(quantityCoin),
            createBy: `web_${currentUser?.email}`,
            time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            dispatch,
            state,
            actions,
            page,
            show,
            search: changeCoinSearch || '',
            setIsProcess,
        });
    };
    const handleChangeCoin = async (email) => {
        try {
            await 1;
            setIsProcess(true);
            requestRefreshToken(
                currentUser,
                changeCoinAPI,
                state,
                dispatch,
                actions,
                email
            );
        } catch (err) {
            checkErrorChangeCoin({ err, dispatch, state, actions });
        }
    };
    const deleteAPI = (data) => {
        deleteChangeCoin({
            data,
            state,
            dispatch,
            actions,
            id,
            page,
            show,
            search: changeCoinSearch || '',
            setIsProcess,
        });
    };
    const handleDel = async (id) => {
        try {
            await 1;
            setIsProcess(true);
            requestRefreshToken(
                currentUser,
                deleteAPI,
                state,
                dispatch,
                actions,
                id
            );
        } catch (err) {
            checkErrorChangeCoin({ err, dispatch, state, actions });
        }
    };
    function RenderBodyTable({ data }) {
        return (
            <>
                {data.map((item, index) => {
                    {
                        /* const sendReceived = {
                        send: {
                            icon: <Icons.SendIcon />,
                            title: 'Send',
                            number: numberUtils.formatVND(item?.amount),
                        },
                        received: {
                            icon: <Icons.ReceivedIcon />,
                            title: 'Received',
                            number: numberUtils.formatUSD(item?.amount),
                        },
                    }; */
                    }
                    const username = dataUser.dataUser.find(
                        (x) => x?.payment.email === item.user
                    )?.payment.username;
                    const infoUser = {
                        name: username,
                        email: item.user,
                        path: `@${username?.replace(' ', '-')}`,
                    };
                    return (
                        <tr key={index}>
                            <td>{handleUtils.indexTable(page, show, index)}</td>
                            <td className='item-w50'>{item?.symbol}</td>
                            <td>
                                {/* <TrObjectIcon item={sendReceived} /> */}
                                {(item?.amount < 0
                                    ? item?.amount * -1
                                    : item?.amount) || '---'}
                            </td>
                            <td className='item-w150'>
                                <TrObjectNoIcon item={infoUser} />
                            </td>
                            <td className='item-w100'>
                                {moment(item.createdAt).format(
                                    'DD/MM/YYYY HH:mm:ss'
                                )}
                            </td>
                            <td className='item-w100'>
                                {item?.createBy ? (
                                    item?.createBy
                                ) : (
                                    <Skeleton width={50} />
                                )}
                            </td>
                            <td className='item-w100'>{item?.type}</td>
                            <td>
                                <TrStatus item={item.status} />
                            </td>

                            <td>
                                <ActionsTable
                                    edit
                                    onClickEdit={(e) => {
                                        modalDeleteTrue(e, item?._id);
                                        setEmail(item.user);
                                    }}
                                    onClickDel={(e) => {
                                        modalDeleteTrue1(e, item?._id);
                                        setId(item._id);
                                    }}
                                ></ActionsTable>
                            </td>
                        </tr>
                    );
                })}
            </>
        );
    }
    const DATA_COINS =
        (dataSettingCoin?.data?.coins || dataSettingCoin?.data)?.map((coin) => {
            return {
                name: coin?.symbol,
            };
        }) || [];
    DATA_COINS.unshift({ name: 'USDT' });
    const uniqueDataCoins = DATA_COINS.filter(
        (v, i, a) => a.findIndex((t) => t.name === v.name) === i
    );
    let DataCoinModalFlag = searchCoinGift({
        coin,
        dataCoins: uniqueDataCoins,
    });
    return (
        <>
            <General
                className={cx('changeCoin')}
                valueSearch={changeCoinSearch}
                nameSearch='changeCoinSearch'
                dataFlag={dataCoinFlag}
                dataHeaders={DataChangeCoins(Icons).headers}
                totalData={
                    dataChangeCoins?.total ||
                    dataChangeCoins?.data?.totalSearch ||
                    dataChangeCoins?.data?.total
                }
            >
                <RenderBodyTable data={dataCoinFlag} />
            </General>
            {modalDelete && (
                <Modal
                    titleHeader='Change Coin'
                    actionButtonText='Submit'
                    openModal={modalDeleteTrue}
                    closeModal={modalDeleteFalse}
                    classNameButton='vipbgc'
                    onClick={() => handleChangeCoin(email)}
                    isProcess={isProcess}
                >
                    <div className='w100'>
                        <SelectValue
                            isFormInput
                            label='Change Coin'
                            nameSearch='coin'
                            toggleModal={toggleListCoin}
                            stateModal={selectStatus}
                            valueSelect={changeCoin}
                            onChangeSearch={searchSelect}
                            dataFlag={DataCoinModalFlag}
                            onClick={handleChangeCoinModal}
                            valueFormInput={quantityCoin}
                            onChangeFormInput={changeQuantity}
                        />
                    </div>
                </Modal>
            )}
            {modalDelete1 && (
                <Modal
                    titleHeader='Delete Change Coin'
                    actionButtonText='Delete'
                    openModal={modalDeleteTrue1}
                    closeModal={modalDeleteFalse1}
                    classNameButton='cancelbgc'
                    onClick={() => handleDel(id)}
                    isProcess={isProcess}
                >
                    <p className='modal-delete-desc'>
                        Are you sure to delete this change coin?
                    </p>
                </Modal>
            )}
        </>
    );
}

export default ChangeCoin;
