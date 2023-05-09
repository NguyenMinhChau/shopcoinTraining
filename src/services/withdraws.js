import { actions } from '../app/';
import routers from '../routers/routers';
import {
	axiosUtils,
	searchUtils,
	dispatchEdit,
	dispatchDelete,
} from '../utils';

// GET DATA WITHDRAWS
export const getWithdraws = async (props = {}) => {
	const { page, show, dispatch, state, search, setSnackbar } = props;
	try {
		const processWithdraws = await axiosUtils.adminGet(
			`withdraw/paging?page=${page}&show=${show}&search=${search}`,
		);
		const processUser = await axiosUtils.adminGet('user');
		dispatch(
			actions.setData({
				data: {
					...state.set.data,
					dataWithdraw: processWithdraws,
					dataUser: processUser,
				},
			}),
		);
	} catch (err) {
		setSnackbar({
			open: true,
			type: 'error',
			message: err?.response?.data?.message || 'Something error!',
		});
	}
};
// SEARCH WITHDRAWS
export const searchWithdraw = (props = {}) => {
	const { dataWithdraw, withdraw } = props;
	let dataWithdrawFlag = dataWithdraw;
	if (withdraw) {
		dataWithdrawFlag = dataWithdrawFlag.filter((item) => {
			return (
				searchUtils.searchInput(withdraw, item._id) ||
				searchUtils.searchInput(withdraw, item.code) ||
				searchUtils.searchInput(withdraw, item.user) ||
				searchUtils.searchInput(withdraw, item.amountUsd) ||
				searchUtils.searchInput(withdraw, item?.amountVnd) ||
				searchUtils.searchInput(withdraw, item?.createBy) ||
				searchUtils.searchInput(withdraw, item.status)
			);
		});
	}
	return dataWithdrawFlag;
};
// HANDLE EDIT WITHDRAWS
export const handleEdit = async (props = {}) => {
	const {
		data,
		note,
		id,
		dispatch,
		actions,
		state,
		statusCurrent,
		statusUpdate,
		page,
		show,
		search,
		setSnackbar,
		setIsProcess,
	} = props;
	try {
		const resPut = await axiosUtils.adminPut(`handle/withdraw/${id}`, {
			status: statusUpdate || statusCurrent,
			note: note,
			token: data?.token,
		});
		setIsProcess(false);
		const res = await axiosUtils.adminGet(
			`/getAllWithdraw?page=${page}&show=${show}&search=${search}`,
		);
		dispatchEdit(
			dispatch,
			state,
			setSnackbar,
			actions,
			res,
			'dataWithdraw',
			resPut.message,
		);
		return data;
	} catch (err) {
		setIsProcess(false);
		setSnackbar({
			open: true,
			type: 'error',
			message: err?.response?.data?.message || 'Something error!',
		});
	}
};
// HANDLE DELETE WITHDRAWS
export const handleDelete = async (props = {}) => {
	const { data, id, dispatch, state, page, show, search, setSnackbar } =
		props;
	try {
		const resDel = await axiosUtils.adminDelete(`withdraw/${id}`, {
			headers: {
				token: data?.token,
			},
		});
		const res = await axiosUtils.adminGet(
			`withdraw/paging?page=${page}&show=${show}&search=${search}`,
		);
		dispatchDelete(
			dispatch,
			state,
			setSnackbar,
			actions,
			res,
			'dataWithdraw',
			resDel.message,
		);
	} catch (err) {
		setSnackbar({
			open: true,
			type: 'error',
			message: err?.response?.data?.message || 'Something error!',
		});
	}
};
// HANDLE CREATE WITHDRAWS
export const handleCreate = async (props = {}) => {
	const {
		amount,
		email,
		rateWithdraw,
		dispatch,
		token,
		setIsProcess,
		setData,
		setSnackbar,
	} = props;
	try {
		const resPost = await axiosUtils.userPost('/withdraw', {
			amountUsd: parseFloat(amount),
			user: email,
			rateWithdraw: rateWithdraw,
			token: token,
		});
		const resGet = await axiosUtils.userGet(`/getAllWithdraw/${email}`);
		setData(resGet.data);
		setIsProcess(false);
		setSnackbar({
			open: true,
			message: resPost?.message || 'Create Withdraw successfully',
			type: 'success',
		});
		dispatch(
			actions.toggleModal({
				selectBank: false,
			}),
		);
	} catch (err) {
		setIsProcess(false);
		setSnackbar({
			open: true,
			message: err?.response?.data?.message || 'Create Withdraw failed',
			type: 'error',
		});
		dispatch(
			actions.toggleModal({
				selectBank: false,
			}),
		);
	}
};
// HANDLE RESEND CODE
export const handleResendCode = async (props = {}) => {
	const { id, email, dispatch, token, setSnackbar } = props;
	try {
		const resPost = await axiosUtils.userPost(`/resendOTPWithdraw/${id}`, {
			email: email,
			token: token,
		});
		setSnackbar({
			open: true,
			message: resPost?.message || 'Resend code successfully',
			type: 'success',
		});
		dispatch(
			actions.toggleModal({
				selectBank: false,
			}),
		);
	} catch (err) {
		setSnackbar({
			open: true,
			message: err?.response?.data?.message || 'Resend code failed',
			type: 'error',
		});
		dispatch(
			actions.toggleModal({
				selectBank: false,
			}),
		);
	}
};
// HANDLE CHECK CODE WITHDRAW USER
export const handleCheckCodeWithdraw = async (props = {}) => {
	const { code, token, dispatch, setIsProcess, setIsProcessCancel, history } =
		props;
	try {
		const resGet = await axiosUtils.userGet(
			`/enterOTPWithdraw/${props?.code}`,
			{
				code: code,
				headers: {
					token: token,
				},
			},
		);
		setIsProcess(false);
		setIsProcessCancel(false);
		alert(resGet?.message ? resGet?.message : 'Verify code successfully');
		dispatch(
			actions.toggleModal({
				selectBank: false,
			}),
		);
		history(routers.withdrawUser);
	} catch (err) {
		setIsProcess(false);
		setIsProcessCancel(false);
		alert(err?.response?.data?.message || 'Verify code failed');
		dispatch(
			actions.toggleModal({
				selectBank: false,
			}),
		);
	}
};
// HANDLE CANCEL WITHDRAW
export const handleCancelWithdraw = async (props = {}) => {
	const { token, id, dispatch, actions, setIsProcessCancel, history } = props;
	try {
		const resDel = await axiosUtils.userDelete(`/cancelWithdraw/${id}`, {
			token: token,
			headers: {
				token: token,
			},
		});
		setIsProcessCancel(false);
		alert(resDel?.message || 'Cancel withdraw successfully');
		dispatch(
			actions.toggleModal({
				selectBank: false,
			}),
		);
		history(routers.withdrawUser);
	} catch (err) {
		setIsProcessCancel(false);
		alert(err?.response?.data?.message || 'Cancel withdraw failed');
		dispatch(
			actions.toggleModal({
				selectBank: false,
			}),
		);
	}
};
