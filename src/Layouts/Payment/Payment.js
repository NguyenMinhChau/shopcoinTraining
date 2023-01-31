/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import className from 'classnames/bind';
import { Modal, FormInput, ActionsTable, SelectStatus } from '../../components';
import { actions } from '../../app/';
import { General } from '../';
import {
    getPayments,
    checkFormPayment,
    checkErrorPayment,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleUpdateType,
} from '../../services/payments';
import {
    DataPayments,
    useAppContext,
    modalUtils,
    requestRefreshToken,
    handleUtils,
    deleteUtils,
    formUtils,
    localStoreUtils,
    useDebounce,
} from '../../utils';
import styles from './Payment.module.css';
import { TrStatus } from '../../components/TableData/TableData';

const cx = className.bind(styles);

function Payment() {
    const { state, dispatch } = useAppContext();
    const {
        edit,
        currentUser,
        statusUpdate,
        statusCurrent,
        message: { error },
        data: { dataPayment },
        searchValues: { payment },
        pagination: { page, show },
        form: {
            accountName,
            bankName,
            accountNumber,
            rateDeposit,
            rateWithdraw,
        },
    } = state.set;
    const { modalPaymentEdit, modalDelete, modalStatus } = state.toggle;
    const [isProcess, setIsProcess] = useState(false);
    // Ref Input
    const refAccountName = useRef();
    const refBankName = useRef();
    const refAccountNumber = useRef();
    useEffect(() => {
        document.title = `Payment | ${process.env.REACT_APP_TITLE_WEB}`;
    }, []);
    const useDebouncePayment = useDebounce(payment, 500);
    useEffect(() => {
        if (useDebouncePayment) {
            setTimeout(() => {
                dispatch(
                    actions.setData({
                        pagination: { page: 1, show: 10 },
                    })
                );
            }, 500);
        }
    }, [useDebouncePayment]);
    useEffect(() => {
        getPayments({
            dispatch,
            state,
            actions,
            page,
            show,
            search: useDebouncePayment,
        });
    }, [page, show, useDebouncePayment]);
    const dataPaymentFlag = dataPayment?.data?.payments || dataPayment?.data;
    // Modal Payment + Input Form
    const modalPaymentTrue = (e, item) => {
        return modalUtils.modalTrue(
            e,
            item,
            dispatch,
            state,
            actions,
            'modalPaymentEdit'
        );
    };
    const modalPaymentFalse = (e) => {
        return modalUtils.modalFalse(
            e,
            dispatch,
            state,
            actions,
            'modalPaymentEdit'
        );
    };
    const modalDeleteTrue = (e, id) => {
        return deleteUtils.deleteTrue(e, id, dispatch, state, actions);
    };
    const modalDeleteFalse = (e) => {
        return deleteUtils.deleteFalse(e, dispatch, state, actions);
    };
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
    const handleChange = (e) => {
        return formUtils.changeForm(e, dispatch, state, actions);
    };
    // Create + Update Payment
    const handleCreatePayment = async (data) => {
        await handleCreate({
            data,
            dispatch,
            state,
            actions,
            bankName,
            accountName,
            accountNumber,
            rateDeposit,
            rateWithdraw,
            page,
            show,
        });
    };
    const createPayment = async (e) => {
        try {
            const isCheck = checkFormPayment({
                bankName,
                accountName,
                accountNumber,
                refAccountName,
                refBankName,
                refAccountNumber,
            });
            if (isCheck) {
                e.preventDefault();
                await 1;
                setIsProcess(true);
                setTimeout(() => {
                    requestRefreshToken(
                        currentUser,
                        handleCreatePayment,
                        state,
                        dispatch,
                        actions
                    );
                    setIsProcess(false);
                }, 1000);
            }
        } catch (err) {
            checkErrorPayment({ dispatch, state, actions, err });
        }
    };
    const handleUpdatePayment = async (data, id) => {
        await handleUpdate({
            data,
            id,
            dispatch,
            state,
            actions,
            bankName,
            accountName,
            accountNumber,
            rateDeposit,
            rateWithdraw,
            page,
            show,
            search: payment,
        });
    };
    const updatePayment = async (id) => {
        try {
            await 1;
            setIsProcess(true);
            setTimeout(() => {
                requestRefreshToken(
                    currentUser,
                    handleUpdatePayment,
                    state,
                    dispatch,
                    actions,
                    id
                );
                setIsProcess(false);
            }, 1000);
        } catch (err) {
            checkErrorPayment({ dispatch, state, actions, err });
        }
    };
    const handleUpdateTypePayment = async (data, id) => {
        handleUpdateType({
            data,
            id,
            dispatch,
            state,
            actions,
            statusUpdate,
            statusCurrent,
            page,
            show,
        });
    };
    const updatedTypePayment = async (id) => {
        try {
            await 1;
            setIsProcess(true);
            setTimeout(() => {
                requestRefreshToken(
                    currentUser,
                    handleUpdateTypePayment,
                    state,
                    dispatch,
                    actions,
                    id
                );
                setIsProcess(false);
            }, 1000);
        } catch (err) {
            checkErrorPayment({ dispatch, state, actions, err });
        }
    };
    const handleDeletePayment = (data, id) => {
        handleDelete({
            data,
            id,
            dispatch,
            state,
            actions,
            page,
            show,
            search: payment,
        });
    };
    const deletePayment = async (id) => {
        try {
            requestRefreshToken(
                currentUser,
                handleDeletePayment,
                state,
                dispatch,
                actions,
                id
            );
        } catch (err) {
            checkErrorPayment({ dispatch, state, actions, err });
        }
    };
    function RenderBodyTable({ data }) {
        return (
            <>
                {data.map((item, index) => {
                    return (
                        <tr key={index}>
                            <td className='upc'>
                                {handleUtils.indexTable(page, show, index)}
                            </td>
                            <td className='item-w150'>
                                {item.accountName || <Skeleton width={50} />}
                            </td>
                            <td className='item-w150'>
                                {item.methodName || <Skeleton width={50} />}
                            </td>
                            <td className='item-w150'>
                                {item.accountNumber || <Skeleton width={50} />}
                            </td>
                            <td>
                                <TrStatus
                                    item={item.type}
                                    onClick={(e) =>
                                        toggleEditTrue(e, item.type, item._id)
                                    }
                                />
                            </td>

                            <td>
                                <ActionsTable
                                    edit
                                    onClickDel={(e) =>
                                        modalDeleteTrue(e, item._id)
                                    }
                                    onClickEdit={(e) =>
                                        modalPaymentTrue(e, item)
                                    }
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
                valueSearch={payment}
                nameSearch='payment'
                textBtnNew='New Payment'
                onCreate={modalPaymentTrue}
                dataFlag={dataPaymentFlag}
                dataHeaders={DataPayments().headers}
                totalData={dataPayment?.total || dataPayment?.data?.total}
                classNameButton='completebgc'
                classNameButtonUpdateAllFields='vipbgc'
            >
                <RenderBodyTable data={dataPaymentFlag} />
            </General>
            {modalStatus && (
                <Modal
                    titleHeader='Change Type Payment'
                    actionButtonText='Submit'
                    openModal={toggleEditTrue}
                    closeModal={toggleEditFalse}
                    classNameButton='vipbgc'
                    onClick={() =>
                        updatedTypePayment(currentUser?.idUpdate || edit.id)
                    }
                    isProcess={isProcess}
                >
                    <p className='modal-delete-desc'>
                        Are you sure change type payment?
                    </p>
                    <SelectStatus typePayment />
                </Modal>
            )}
            {modalPaymentEdit && (
                <Modal
                    titleHeader={edit.itemData ? 'Edit Payment' : 'New Payment'}
                    actionButtonText={edit.itemData ? 'Update' : 'Create'}
                    closeModal={modalPaymentFalse}
                    openModal={modalPaymentTrue}
                    classNameButton='vipbgc'
                    errorMessage={error}
                    onClick={
                        edit.itemData
                            ? () => updatePayment(edit.itemData._id)
                            : createPayment
                    }
                    isProcess={isProcess}
                    disabled={!accountName || !bankName || !accountNumber}
                >
                    <FormInput
                        label='Account Name'
                        type='text'
                        placeholder='Enter account name'
                        name='accountName'
                        value={accountName}
                        onChange={handleChange}
                        ref={refAccountName}
                        classNameField={`${cx('payment-form-field')}`}
                        classNameInput={`${cx('payment-form-input')}`}
                    />
                    <FormInput
                        label='Bank Name'
                        type='text'
                        placeholder='Enter bank name'
                        name='bankName'
                        value={bankName}
                        onChange={handleChange}
                        ref={refBankName}
                        classNameField={`${cx('payment-form-field')}`}
                        classNameInput={`${cx('payment-form-input')}`}
                    />
                    <FormInput
                        label='Account Number'
                        type='text'
                        placeholder='Enter account number'
                        name='accountNumber'
                        value={accountNumber}
                        ref={refAccountNumber}
                        onChange={handleChange}
                        classNameField={`${cx('payment-form-field')}`}
                        classNameInput={`${cx('payment-form-input')}`}
                    />
                </Modal>
            )}
            {modalDelete && (
                <Modal
                    titleHeader='Delete Payment'
                    actionButtonText='Delete'
                    openModal={modalDeleteTrue}
                    closeModal={modalDeleteFalse}
                    classNameButton='cancelbgc'
                    onClick={() => deletePayment(edit.id)}
                    isProcess={isProcess}
                >
                    <p className='modal-delete-desc'>
                        Are you sure to delete this payment?
                    </p>
                </Modal>
            )}
        </>
    );
}

export default Payment;
