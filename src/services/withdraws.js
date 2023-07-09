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
					dataWithdraw: processWithdraws?.metadata,
					dataUser: processUser?.metadata,
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
			`withdraw/paging?page=${page}&show=${show}&search=${search}`,
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
			token: data?.token,
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
		email_user,
		id_user,
		dispatch,
		token,
		setIsProcess,
		setData,
		setSnackbar,
		history,
	} = props;
	try {
		const resPost = await axiosUtils.userPost(`withdraw/${id_user}`, {
			amount: parseFloat(amount),
			method: id_user,
			token: token,
		});
		const resGet = await axiosUtils.userGet(`withdraws/${id_user}`);
		setData(resGet.metadata);
		setIsProcess(false);
		alert(resPost?.message || 'Create Withdraw successfully');
		dispatch(
			actions.toggleModal({
				selectBank: false,
			}),
		);
		history(`${routers.withdrawUser}/${resPost.metadata?._id}`);
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
	const { id, email, token, setSnackbar, setIsProcessResend } = props;
	try {
		const resPost = await axiosUtils.userPost(`withdraw/resetCode/${id}`, {
			email: email,
			token: token,
			headers: { token: token },
		});
		setSnackbar({
			open: true,
			message: resPost?.message || 'Resend code successfully',
			type: 'success',
		});
		setIsProcessResend(false);
	} catch (err) {
		setSnackbar({
			open: true,
			message: err?.response?.data?.message || 'Resend code failed',
			type: 'error',
		});
		setIsProcessResend(false);
	}
};
// HANDLE CHECK CODE WITHDRAW USER
export const handleCheckCodeWithdraw = async (props = {}) => {
	const {
		code,
		id_wr,
		token,
		dispatch,
		setIsProcess,
		setIsProcessCancel,
		history,
		setSnackbar,
	} = props;
	try {
		const resGet = await axiosUtils.userPost(
			`withdraw/otp/${code}/${id_wr}`,
			{
				token: token,
				headers: {
					token: token,
				},
			},
		);
		setIsProcess(false);
		setIsProcessCancel(false);
		alert(resGet?.message || 'Verify code successfully');
		dispatch(
			actions.toggleModal({
				selectBank: false,
			}),
		);
		history(routers.withdrawUser);
	} catch (err) {
		setIsProcess(false);
		setIsProcessCancel(false);
		setSnackbar({
			open: true,
			message: err?.response?.data?.message || 'Verify code failed',
			type: 'error',
		});
		dispatch(
			actions.toggleModal({
				selectBank: false,
			}),
		);
	}
};
// HANDLE CANCEL WITHDRAW
export const handleCancelWithdraw = async (props = {}) => {
	const { token, id, setIsProcessCancel, history, setSnackbar } = props;
	try {
		const resDel = await axiosUtils.userGet(`withdraw/${id}`, {
			token: token,
			headers: {
				token: token,
			},
		});
		setIsProcessCancel(false);
		alert(resDel?.message || 'Cancel withdraw successfully');
		history(routers.withdrawUser);
	} catch (err) {
		setIsProcessCancel(false);
		setSnackbar({
			open: true,
			message: err?.response?.data?.message || 'Cancel withdraw failed',
			type: 'error',
		});
	}
};
