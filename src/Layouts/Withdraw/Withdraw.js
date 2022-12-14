/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import className from 'classnames/bind';
import moment from 'moment';
import {
    getWithdraws,
    handleEdit,
    checkErrorWithdraw,
    handleDelete,
} from '../../services/withdraws';
import {
    useAppContext,
    DataWithdraws,
    deleteUtils,
    handleUtils,
    requestRefreshToken,
    localStoreUtils,
    numberUtils,
    useDebounce,
} from '../../utils';
import routers from '../../routers/routers';
import { Icons, ActionsTable, Modal, SelectStatus } from '../../components';
import { actions } from '../../app/';
import { General } from '../';
import {
    TrObjectIcon,
    TrObjectNoIcon,
    TrStatus,
} from '../../components/TableData/TableData';
import styles from './Withdraw.module.css';
import Skeleton from 'react-loading-skeleton';

const cx = className.bind(styles);

function Withdraw() {
    const { state, dispatch } = useAppContext();
    const {
        edit,
        currentUser,
        statusCurrent,
        statusUpdate,
        data: { dataWithdraw, dataUser },
        searchValues: { withdraw },
        pagination: { page, show },
    } = state.set;
    const { modalStatus, modalDelete } = state.toggle;
    const [isProcess, setIsProcess] = useState(false);
    useEffect(() => {
        document.title = `Withdraw | ${process.env.REACT_APP_TITLE_WEB}`;
    }, []);
    const useBebounceWithdraw = useDebounce(withdraw, 500);
    useEffect(() => {
        if (useBebounceWithdraw) {
            setTimeout(() => {
                dispatch(
                    actions.setData({
                        pagination: { page: 1, show: 10 },
                    })
                );
            }, 500);
        }
    }, [useBebounceWithdraw]);
    useEffect(() => {
        getWithdraws({
            page,
            show,
            dispatch,
            state,
            actions,
            search: useBebounceWithdraw,
        });
    }, [page, show, useBebounceWithdraw]);
    let dataWithdrawFlag = dataWithdraw?.data?.withdraws || dataWithdraw?.data;
    // Modal
    const toggleEditTrue = async (e, status, id) => {
        await localStoreUtils.setStore({
            ...currentUser,
            idUpdate: id,
        });
        deleteUtils.statusTrue(e, status, id, dispatch, state, actions);
    };
    const toggleEditFalse = (e) => {
        return deleteUtils.statusFalse(e, dispatch, state, actions);
    };
    const modalDeleteTrue = (e, id) => {
        return deleteUtils.deleteTrue(e, id, dispatch, state, actions);
    };
    const modalDeleteFalse = (e) => {
        return deleteUtils.deleteFalse(e, dispatch, state, actions);
    };
    // Edit + Delete Withdraw
    const handleEditStatus = async (data, id) => {
        handleEdit({
            data,
            note: `web_${currentUser?.email}`,
            id,
            dispatch,
            actions,
            state,
            statusCurrent,
            statusUpdate,
            page,
            show,
            search: withdraw,
        });
    };
    const handleDeleteWithdraw = async (data, id) => {
        handleDelete({
            data,
            id,
            dispatch,
            state,
            actions,
            page,
            show,
            search: withdraw,
        });
    };
    const deleteWithdraw = async (id) => {
        try {
            requestRefreshToken(
                currentUser,
                handleDeleteWithdraw,
                state,
                dispatch,
                actions,
                id
            );
        } catch (err) {
            checkErrorWithdraw({ err, dispatch, state, actions });
        }
    };
    const editStatus = async (id) => {
        try {
            await 1;
            setIsProcess(true);
            setTimeout(() => {
                requestRefreshToken(
                    currentUser,
                    handleEditStatus,
                    state,
                    dispatch,
                    actions,
                    id
                );
                setIsProcess(false);
            }, 1000);
        } catch (err) {
            checkErrorWithdraw({});
        }
    };
    const handleViewWithdraw = (item) => {
        dispatch(
            actions.setData({
                ...state.set,
                edit: { ...state.set.edit, id: item.id, itemData: item },
            })
        );
    };
    function RenderBodyTable({ data }) {
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
                            <td className='item-w100'>{item.code}</td>
                            <td>
                                <TrObjectIcon item={sendReceived} />
                            </td>
                            <td className='item-w150'>
                                <TrObjectNoIcon item={infoUser} />
                            </td>
                            <td className='item-w100'>
                                {moment(item.createdAt).format(
                                    'DD/MM/YYYY HH:mm:ss'
                                )}
                            </td>
                            <td className='item-w150'>
                                {item?.createBy ? (
                                    item?.createBy
                                ) : (
                                    <Skeleton width={50} />
                                )}
                            </td>
                            <td>
                                <TrStatus
                                    item={item.status}
                                    onClick={(e) =>
                                        toggleEditTrue(e, item.status, item._id)
                                    }
                                />
                            </td>

                            <td>
                                <ActionsTable
                                    view
                                    linkView={`${routers.withdraw}/${item._id}`}
                                    onClickDel={(e) =>
                                        modalDeleteTrue(e, item._id)
                                    }
                                    onClickView={() => handleViewWithdraw(item)}
                                ></ActionsTable>
                            </td>
                        </tr>
                    );
                })}
            </>
        );
    }
    return (
        <>
            <General
                className={cx('withdraw')}
                valueSearch={withdraw}
                nameSearch='withdraw'
                dataFlag={dataWithdrawFlag}
                dataHeaders={DataWithdraws(Icons).headers}
                totalData={
                    dataWithdraw?.total || dataWithdraw?.data?.totalSearch
                }
            >
                <RenderBodyTable data={dataWithdrawFlag} />
            </General>
            {modalStatus && (
                <Modal
                    titleHeader='Change Status'
                    actionButtonText='Submit'
                    openModal={toggleEditTrue}
                    closeModal={toggleEditFalse}
                    classNameButton='vipbgc'
                    onClick={() => editStatus(currentUser?.idUpdate || edit.id)}
                    isProcess={isProcess}
                >
                    <p className='modal-delete-desc'>
                        Are you sure change status this{' '}
                        {window.location.pathname.includes(
                            `${routers.deposits}`
                        )
                            ? 'deposits'
                            : 'withdraw'}
                        ?
                    </p>
                    <SelectStatus />
                </Modal>
            )}
            {modalDelete && (
                <Modal
                    titleHeader='Delete Withdraw'
                    actionButtonText='Delete'
                    openModal={modalDeleteTrue}
                    closeModal={modalDeleteFalse}
                    classNameButton='cancelbgc'
                    onClick={() => deleteWithdraw(edit.id)}
                    isProcess={isProcess}
                >
                    <p className='modal-delete-desc'>
                        Are you sure to delete this withdraw?
                    </p>
                </Modal>
            )}
        </>
    );
}

export default Withdraw;
