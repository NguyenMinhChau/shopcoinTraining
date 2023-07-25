/* eslint-disable no-unused-vars */
import { actions } from '../app/';
import routers from '../routers/routers';
import {
	axiosUtils,
	searchUtils,
	dispatchEdit,
	dispatchDelete,
	validates,
} from '../utils';
import { FirstUpc } from '../utils/format/LetterFirstUpc';

// GET DATA DEPOSITS
export const getDeposits = async (props = {}) => {
	const { page, show, dispatch, state, search, setSnackbar } = props;
	try {
		const processDeposits = await axiosUtils.adminGet(
			`deposit/paging?page=${page}&show=${show}&search=${search}`,
		);
		const processUser = await axiosUtils.adminGet('user');
		dispatch(
			actions.setData({
				data: {
					...state.set.data,
					dataDeposits: processDeposits?.metadata,
					dataUser: processUser?.metadata,
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
// GET DEPOSITS/WITHDRAWS BY ID
export const getDepositsWithdrawById = async (props = {}) => {
	const { idDeposits, idWithdraw, dispatch, state, setSnackbar } = props;
	try {
		if (idDeposits || idWithdraw) {
			const processUser = await axiosUtils.adminGet('user');
			const process = await axiosUtils.adminGet(
				idDeposits ? `deposit/${idDeposits}` : `withdraw/${idWithdraw}`,
			);
			const { metadata } = process;
			dispatch(
				actions.setData({
					edit: {
						...state.set.edit,
						itemData: metadata,
					},
					data: {
						...state.set.data,
						dataUser: processUser?.metadata,
					},
				}),
			);
		}
	} catch (err) {
		setSnackbar({
			open: true,
			message: err?.response?.data?.message || 'Something error!',
			type: 'error',
		});
	}
};
// SEARCH DEPOSITS
export const searchDeposits = (props = {}) => {
	const { dataDeposits, deposits } = props;
	let dataDepositsFlag = dataDeposits; //.dataDeposit
	if (deposits) {
		dataDepositsFlag = dataDepositsFlag.filter((item) => {
			return (
				searchUtils.searchInput(deposits, item._id) ||
				searchUtils.searchInput(deposits, item.code) ||
				searchUtils.searchInput(deposits, item.user) ||
				searchUtils.searchInput(deposits, item?.amountVnd) ||
				searchUtils.searchInput(deposits, item?.amount) ||
				searchUtils.searchInput(deposits, item?.createBy) ||
				searchUtils.searchInput(deposits, item.status)
			);
		});
	}
	return dataDepositsFlag;
};
// HANDLE EDIT DEPOSITS
export const handleEdit = async (props = {}) => {
	const {
		data,
		note,
		id,
		dispatch,
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
		const resPut = await axiosUtils.adminPut(
			`handle/deposit/${id}`,
			{
				status: FirstUpc(statusUpdate) || FirstUpc(statusCurrent),
				note: note,
				token: data?.token,
				headers: { token: data?.token },
			},
			{ headers: { token: data?.token } },
		);
		setIsProcess(false);
		const res = await axiosUtils.adminGet(
			`deposit/paging?page=${page}&show=${show}&search=${search}`,
		);
		dispatchEdit(
			dispatch,
			state,
			setSnackbar,
			actions,
			res,
			'dataDeposits',
			resPut.message,
		);
		return data;
	} catch (err) {
		setIsProcess(false);
		dispatch(
			actions.toggleModal({
				modalStatus: false,
			}),
		);
		setSnackbar({
			open: true,
			message: err?.response?.data?.message || 'Something error!',
			type: 'error',
		});
	}
};
// HANDLE DELETE DEPOSITS
export const handleDelete = async (props = {}) => {
	const { data, id, dispatch, state, page, show, search, setSnackbar } =
		props;
	try {
		const resDel = await axiosUtils.adminDelete(`deposit/${id}`, {
			token: data?.token,
			headers: {
				token: data?.token,
			},
		});
		const res = await axiosUtils.adminGet(
			`deposit/paging?page=${page}&show=${show}&search=${search}`,
		);
		dispatchDelete(
			dispatch,
			state,
			setSnackbar,
			actions,
			res,
			'dataDeposits',
			resDel.message,
		);
	} catch (err) {
		dispatch(
			actions.toggleModal({
				modalDelete: false,
			}),
		);
		setSnackbar({
			open: true,
			message: err?.response?.data?.message || 'Something error!',
			type: 'error',
		});
	}
};
// HANDLE CREATE DEPOSIT
export const handleCreate = async (props = {}) => {
	const {
		amount,
		id_user,
		email_user,
		token,
		bankAdmin,
		setIsProcess,
		setData,
		setSnackbar,
		dispatch,
	} = props;
	try {
		const resPost = await axiosUtils.userPost(`deposit/${id_user}`, {
			amount: amount,
			method: bankAdmin?._id,
			token: token,
		});
		setIsProcess(false);
		const resGet = await axiosUtils.userGet(`deposit/${email_user}`);
		setData(resGet.metadata);
		setSnackbar({
			open: true,
			message: resPost?.message
				? resPost?.message
				: 'Create deposit successfully',
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
			message:
				"You don't have a payment account yet, please create one before doing so. Profile → Profile Payment. Thank you!",
			type: 'error',
		});
		dispatch(
			actions.toggleModal({
				selectBank: false,
			}),
		);
	}
};
// HANDLE UPDATE BILL DEPOSIT USER
export const handleUpdateBillDeposit = async (props = {}) => {
	const { token, id, logo, setIsProcess, history, setSnackbar } = props;
	try {
		const resPut = await axiosUtils.userPut(
			`deposit/image/${id}`,
			{
				statement: logo[0],
			},
			{
				headers: {
					'Content-Type': 'multipart/form-data',
					token: token,
				},
			},
		);
		setIsProcess(false);
		alert(resPut?.message ? resPut?.message : 'Upload bill successfully');
		history(routers.depositUser);
	} catch (err) {
		alert(err?.response?.data?.message || 'Upload bill failed');
	}
};
