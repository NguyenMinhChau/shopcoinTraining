import { actions } from '../app/';
import {
	axiosUtils,
	dispatchCreate,
	dispatchEdit,
	dispatchDelete,
	searchUtils,
	numberUtils,
} from '../utils';
// GET DATA PAYMENT
export const getPayments = async (props = {}) => {
	const { page, show, search, dispatch, state, setSnackbar } = props;
	try {
		const processPayment = await axiosUtils.adminGet(
			`/getAllPayments?page=${page}&show=${show}&search=${search}`,
		);
		dispatch(
			actions.setData({
				data: {
					...state.set.data,
					dataPayment: processPayment,
				},
			}),
		);
	} catch (err) {
		setSnackbar({
			open: true,
			message: err?.response?.data?.message || 'Something error!',
			type: 'error',
		});
	}
};
// GET ALL PAYMENT ADMIN
export const SVgetAllPaymentAdmin = async (props = {}) => {
	const { dispatch, state, setSnackbar } = props;
	try {
		const resGet = await axiosUtils.adminGet('/getAllPaymentAdmin', {});
		dispatch(
			actions.setData({
				data: {
					...state.set.data,
					dataPaymentAdmin: resGet.data,
				},
			}),
		);
	} catch (err) {
		setSnackbar({
			open: true,
			message: err?.response?.data?.message || 'Something error!',
			type: 'error',
		});
	}
};
// CHECK VALIDITY OF PAYMENT
export const checkFormPayment = (props = {}) => {
	const {
		accountName,
		refAccountName,
		bankName,
		refBankName,
		accountNumber,
		refAccountNumber,
	} = props;
	if (!accountName) {
		refAccountName.current.focus();
		return false;
	} else if (!bankName) {
		refBankName.current.focus();
		return false;
	} else if (!accountNumber) {
		refAccountNumber.current.focus();
		return false;
	}
	return true;
};
// SEARCH PAYMENT
export const searchPayment = (props = {}) => {
	const { dataPayment, payment } = props;
	let dataUserFlag = dataPayment;
	if (payment) {
		dataUserFlag = dataUserFlag.filter((item) => {
			return (
				searchUtils.searchInput(payment, item.code) ||
				searchUtils.searchInput(payment, item.accountName) ||
				searchUtils.searchInput(payment, item.methodName) ||
				searchUtils.searchInput(payment, item.accountNumber) ||
				searchUtils.searchInput(payment, item.type) ||
				searchUtils.searchInput(
					payment,
					numberUtils.formatUSD(item.transform),
				)
			);
		});
	}
	return dataUserFlag;
};
// CREATE PAYMENT
export const handleCreate = async (props = {}) => {
	const {
		bankName,
		accountName,
		accountNumber,
		rateDeposit,
		rateWithdraw,
		data,
		page,
		show,
		dispatch,
		state,
		setSnackbar,
		setIsProcess,
	} = props;
	try {
		const resPost = await axiosUtils.adminPost('/payment', {
			methodName: bankName,
			accountName: accountName,
			accountNumber: accountNumber,
			rateDeposit: rateDeposit || 0,
			rateWithdraw: rateWithdraw || 0,
			token: data?.token,
		});
		setIsProcess(false);
		const res = await axiosUtils.adminGet(
			`/getAllPayments?page=${page}&show=${show}`,
		);
		dispatchCreate(
			dispatch,
			state,
			setSnackbar,
			actions,
			res,
			'dataPayment',
			resPost.message,
		);
		return data;
	} catch (err) {
		setIsProcess(false);
		setSnackbar({
			open: true,
			message: err?.response?.data?.message || 'Something error!',
			type: 'error',
		});
	}
};
// UPDATE PAYMENT
export const handleUpdate = async (props = {}) => {
	const {
		id,
		bankName,
		accountName,
		accountNumber,
		rateDeposit,
		rateWithdraw,
		data,
		page,
		show,
		search,
		dispatch,
		state,
		setIsProcess,
		setSnackbar,
	} = props;
	try {
		const resPut = await axiosUtils.adminPut(`/updatePayment/${id}`, {
			methodName: bankName,
			accountName: accountName,
			accountNumber: accountNumber,
			rateDeposit: rateDeposit,
			rateWithdraw: rateWithdraw,
			token: data?.token,
		});
		setIsProcess(false);
		const res = await axiosUtils.adminGet(
			`/getAllPayments?page=${page}&show=${show}&search=${search}`,
		);
		dispatchEdit(
			dispatch,
			state,
			setSnackbar,
			actions,
			res,
			'dataPayment',
			resPut.message,
		);
		return data;
	} catch (err) {
		setIsProcess(false);
		setSnackbar({
			open: true,
			message: err?.response?.data?.message || 'Something error!',
			type: 'error',
		});
	}
};
// UPDATE TYPE PAYMENT
export const handleUpdateType = async (props = {}) => {
	const {
		id,
		statusUpdate,
		statusCurrent,
		data,
		dispatch,
		state,
		page,
		show,
		setIsProcess,
		setSnackbar,
	} = props;
	try {
		const resPut = await axiosUtils.adminPut(`/updatePayment/${id}`, {
			type: statusUpdate.toLowerCase() || statusCurrent.toLowerCase(),
			token: data?.token,
		});
		setIsProcess(false);
		const res = await axiosUtils.adminGet(
			`/getAllPayments?page=${page}&show=${show}`,
		);
		dispatchEdit(
			dispatch,
			state,
			setSnackbar,
			actions,
			res,
			'dataPayment',
			resPut.message,
		);
		return data;
	} catch (err) {
		setIsProcess(false);
		setSnackbar({
			open: true,
			message: err?.response?.data?.message || 'Something error!',
			type: 'error',
		});
	}
};
// DELETE PAYMENT
export const handleDelete = async (props = {}) => {
	const { id, data, page, show, search, dispatch, state, setSnackbar } =
		props;
	try {
		const resDel = await axiosUtils.adminDelete(`/deletePayment/${id}`, {
			headers: {
				token: data.token,
			},
		});
		const resPayment = await axiosUtils.adminGet(
			`/getAllPayments?page=${page}&show=${show}&search=${search}`,
		);
		dispatchDelete(
			dispatch,
			state,
			setSnackbar,
			actions,
			resPayment,
			'dataPayment',
			resDel.message,
		);
		return data;
	} catch (err) {
		setSnackbar({
			open: true,
			message: err?.response?.data?.message || 'Something error!',
			type: 'error',
		});
	}
};
