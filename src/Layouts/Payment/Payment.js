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
        form: { accountName, bankName, accountNumber, rateDeposit, rateWithdraw },
    } = state.set;
    const { modalPaymentEdit, modalDelete, modalStatus } = state.toggle;
    const [isProcess, setIsProcess] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        type: '',
        message: '',
    });
    // Ref Input
    const refAccountName = useRef();
    const refBankName = useRef();
    const refAccountNumber = useRef();
    useEffect(() => {
        document.title = `Payment | ${process.env.REACT_APP_TITLE_WEB}`;
    }, []);
    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar({
            ...snackbar,
            open: false,
        });
    };
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
            page,
            show,
            search: useDebouncePayment,
        });
    }, [page, show, useDebouncePayment]);
    const dataPaymentFlag = dataPayment?.data?.payments || dataPayment?.data;
    // Modal Payment + Input Form
    const modalPaymentTrue = (e, item) => {
        return modalUtils.modalTrue(e, item, dispatch, state, actions, 'modalPaymentEdit');
    };
    const modalPaymentFalse = (e) => {
        return modalUtils.modalFalse(e, dispatch, state, actions, 'modalPaymentEdit');
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
    const handleCreatePayment = (data) => {
        handleCreate({
            data,
            dispatch,
            state,
            bankName,
            accountName,
            accountNumber,
            rateDeposit,
            rateWithdraw,
            page,
            show,
            setSnackbar,
            setIsProcess,
        });
    };
    const createPayment = (e) => {
        e.preventDefault();
        setIsProcess(true);
        requestRefreshToken(currentUser, handleCreatePayment, state, dispatch, actions);
    };
    const handleUpdatePayment = (data, id) => {
        handleUpdate({
            data,
            id,
            dispatch,
            state,
            bankName,
            accountName,
            accountNumber,
            rateDeposit,
            rateWithdraw,
            page,
            show,
            search: payment,
            setSnackbar,
            setIsProcess,
        });
    };
    const updatePayment = (id) => {
        setIsProcess(true);
        requestRefreshToken(currentUser, handleUpdatePayment, state, dispatch, actions, id);
    };
    const handleUpdateTypePayment = (data, id) => {
        handleUpdateType({
            data,
            id,
            dispatch,
            state,
            statusUpdate,
            statusCurrent,
            page,
            show,
            setIsProcess,
            setSnackbar,
        });
    };
    const updatedTypePayment = (id) => {
        setIsProcess(true);
        requestRefreshToken(currentUser, handleUpdateTypePayment, state, dispatch, actions, id);
    };
    const handleDeletePayment = (data, id) => {
        handleDelete({
            data,
            id,
            dispatch,
            state,
            page,
            show,
            search: payment,
            setSnackbar,
        });
    };
    const deletePayment = (id) => {
        requestRefreshToken(currentUser, handleDeletePayment, state, dispatch, actions, id);
    };
    function RenderBodyTable({ data }) {
        return (
            <>
                {data.map((item, index) => {
                    return (
                        <tr key={index}>
                            <td className='upc'>{handleUtils.indexTable(page, show, index)}</td>
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
                                    onClick={(e) => toggleEditTrue(e, item.type, item._id)}
                                />
                            </td>

                            <td>
                                <ActionsTable
                                    edit
                                    onClickDel={(e) => modalDeleteTrue(e, item._id)}
                                    onClickEdit={(e) => modalPaymentTrue(e, item)}></ActionsTable>
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
                handleCloseSnackbar={handleCloseSnackbar}
                openSnackbar={snackbar.open}
                typeSnackbar={snackbar.type}
                messageSnackbar={snackbar.message}>
                <RenderBodyTable data={dataPaymentFlag} />
            </General>
            {modalStatus && (
                <Modal
                    titleHeader='Change Type Payment'
                    actionButtonText='Submit'
                    openModal={toggleEditTrue}
                    closeModal={toggleEditFalse}
                    classNameButton='vipbgc'
                    onClick={() => updatedTypePayment(currentUser?.idUpdate || edit.id)}
                    isProcess={isProcess}>
                    <p className='modal-delete-desc'>Are you sure change type payment?</p>
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
                    onClick={edit.itemData ? () => updatePayment(edit.itemData._id) : createPayment}
                    isProcess={isProcess}
                    disabled={!accountName || !bankName || !accountNumber}>
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
                    isProcess={isProcess}>
                    <p className='modal-delete-desc'>Are you sure to delete this payment?</p>
                </Modal>
            )}
        </>
    );
}

export default Payment;
