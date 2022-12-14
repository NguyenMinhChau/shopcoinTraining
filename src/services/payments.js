import {
    axiosUtils,
    dispatchCreate,
    dispatchEdit,
    dispatchDelete,
    searchUtils,
    numberUtils,
    validates,
} from '../utils';
// GET DATA PAYMENT
export const getPayments = async (props = {}) => {
    const processPayment = await axiosUtils.adminGet(
        `/getAllPayments?page=${props.page}&show=${props.show}&search=${props.search}`
    );
    props.dispatch(
        props.actions.setData({
            ...props.state.set,
            data: {
                ...props.state.set.data,
                dataPayment: processPayment,
            },
        })
    );
};
// GET ALL PAYMENT ADMIN
export const SVgetAllPaymentAdmin = async (props = {}) => {
    const resGet = await axiosUtils.adminGet('/getAllPaymentAdmin', {});
    props.dispatch(
        props.actions.setData({
            ...props.state.set,
            data: {
                ...props.state.set.data,
                dataPaymentAdmin: resGet.data,
            },
        })
    );
};
// CHECK VALIDITY OF PAYMENT
export const checkFormPayment = (props = {}) => {
    if (!props.accountName) {
        props.refAccountName.current.focus();
        return false;
    } else if (!props.bankName) {
        props.refBankName.current.focus();
        return false;
    } else if (!props.accountNumber) {
        props.refAccountNumber.current.focus();
        return false;
    }
    return true;
};
// CHECK ERROR ACTIONS
export const checkErrorPayment = (props = {}) => {
    return props.dispatch(
        props.actions.setData({
            ...props.state.set,
            message: {
                error: props.err?.response?.data,
            },
        })
    );
};
// SEARCH PAYMENT
export const searchPayment = (props = {}) => {
    let dataUserFlag = props.dataPayment;
    if (props.payment) {
        dataUserFlag = dataUserFlag.filter((item) => {
            return (
                searchUtils.searchInput(props.payment, item.code) ||
                searchUtils.searchInput(props.payment, item.accountName) ||
                searchUtils.searchInput(props.payment, item.methodName) ||
                searchUtils.searchInput(props.payment, item.accountNumber) ||
                searchUtils.searchInput(props.payment, item.type) ||
                searchUtils.searchInput(
                    props.payment,
                    numberUtils.formatUSD(item.transform)
                )
            );
        });
    }
    return dataUserFlag;
};
// CREATE PAYMENT
export const handleCreate = async (props = {}) => {
    const resPost = await axiosUtils.adminPost('/payment', {
        methodName: props.bankName,
        accountName: props.accountName,
        accountNumber: props.accountNumber,
        rateDeposit: props.rateDeposit || 0,
        rateWithdraw: props.rateWithdraw || 0,
        token: props.data?.token,
    });
    switch (resPost.code) {
        case 0:
            const res = await axiosUtils.adminGet(
                `/getAllPayments?page=${props.page}&show=${props.show}`
            );
            dispatchCreate(
                props.dispatch,
                props.state,
                props.actions,
                res,
                'dataPayment',
                resPost.message
            );
            return props.data;
        case 1:
        case 2:
            validates.validateCase1_2(resPost, props);
            break;
        default:
            break;
    }
};
// UPDATE PAYMENT
export const handleUpdate = async (props = {}) => {
    const resPut = await axiosUtils.adminPut(`/updatePayment/${props.id}`, {
        methodName: props.bankName,
        accountName: props.accountName,
        accountNumber: props.accountNumber,
        rateDeposit: props.rateDeposit,
        rateWithdraw: props.rateWithdraw,
        token: props.data?.token,
    });
    switch (resPut.code) {
        case 0:
            const res = await axiosUtils.adminGet(
                `/getAllPayments?page=${props.page}&show=${props.show}&search=${props.search}`
            );
            dispatchEdit(
                props.dispatch,
                props.state,
                props.actions,
                res,
                'dataPayment',
                resPut.message
            );
            return props.data;
        case 1:
        case 2:
            validates.validateCase1_2(resPut, props);
            break;
        default:
            break;
    }
};
// UPDATE TYPE PAYMENT
export const handleUpdateType = async (props = {}) => {
    const resPut = await axiosUtils.adminPut(`/updatePayment/${props.id}`, {
        type:
            props.statusUpdate.toLowerCase() ||
            props.statusCurrent.toLowerCase(),
        token: props.data?.token,
    });
    switch (resPut.code) {
        case 0:
            const res = await axiosUtils.adminGet(
                `/getAllPayments?page=${props.page}&show=${props.show}`
            );
            dispatchEdit(
                props.dispatch,
                props.state,
                props.actions,
                res,
                'dataPayment',
                resPut.message
            );
            return props.data;
        case 1:
        case 2:
            validates.validateCase1_2(resPut, props);
            break;
        default:
            break;
    }
};

// DELETE PAYMENT
export const handleDelete = async (props = {}) => {
    const resDel = await axiosUtils.adminDelete(`/deletePayment/${props.id}`, {
        headers: {
            token: props.data.token,
        },
    });
    switch (resDel.code) {
        case 0:
            const resPayment = await axiosUtils.adminGet(
                `/getAllPayments?page=${props.page}&show=${props.show}&search=${props.search}`
            );
            dispatchDelete(
                props.dispatch,
                props.state,
                props.actions,
                resPayment,
                'dataPayment',
                resDel.message
            );
            return props.data;
        case 1:
        case 2:
            validates.validateCase1_2(resDel, props);
            break;
        default:
            break;
    }
};
