/* eslint-disable no-unused-vars */
/* eslint-disable no-use-before-define */
import { actions } from '../app/';
import {
	axiosUtils,
	searchUtils,
	dispatchDelete,
	dispatchEdit,
} from '../utils';
// GET DATA USERS
export const getUsers = async (props = {}) => {
	const { dispatch, state, page, show, search, setSnackbar } = props;
	try {
		const processUsers = await axiosUtils.adminGet(
			`users/paging?page=${page}&show=${show}&search=${search}`,
		);
		dispatch(
			actions.setData({
				data: {
					...state.set.data,
					dataUser: processUsers?.metadata,
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
export const getUsersAll = async (props = {}) => {
	const { dispatch, state, page, show, search, setSnackbar } = props;
	try {
		const processUsers = await axiosUtils.adminGet(`user`);
		dispatch(
			actions.setData({
				data: {
					...state.set.data,
					dataUser: processUsers?.metadata,
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
// GET USER BY ID
export const getUserById = async (props = {}) => {
	const { idUser, dispatch, state, setSnackbar } = props;
	try {
		if (idUser) {
			const process = await axiosUtils.adminGet(`user/${idUser}`);
			const processCoins = await axiosUtils.coinGet('/');
			const resGet = await axiosUtils.adminPost('payment/admin', {});
			const { metadata } = process;
			dispatch(
				actions.setData({
					edit: {
						...state.set.edit,
						itemData: metadata,
					},
					data: {
						...state.set.data,
						dataSettingCoin: processCoins?.metadata,
						dataPaymentAdmin: resGet.metadata,
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

export const getUserByIdNoCoin = async (props = {}) => {
	const { idUser, dispatch, setSnackbar } = props;
	try {
		if (idUser) {
			const process = await axiosUtils.adminGet(`user/${idUser}`);
			const { metadata } = process;
			dispatch(
				actions.setData({
					userById: metadata,
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

// SEARCH DATA USERS
export const searchUsers = (props = {}) => {
	const { dataUser, user } = props;
	let dataUserFlag = dataUser;
	if (user) {
		dataUserFlag = dataUserFlag.filter((item) => {
			return (
				searchUtils.searchInput(user, item.payment.username) ||
				searchUtils.searchInput(user, item.payment.email) ||
				searchUtils.searchInput(user, item.createdAt) ||
				searchUtils.searchInput(user, item.payment.rule) ||
				searchUtils.searchInput(user, item.rank)
			);
		});
	}
	return dataUserFlag;
};
// EDIT RANK/FEE USER
export const handleUpdateRankFeeUser = async (props = {}) => {
	const {
		fee,
		data,
		id,
		dispatch,
		state,
		page,
		show,
		statusUpdate,
		statusCurrent,
		search,
		setSnackbar,
		setIsProcess,
		setIsProcessFee,
		setFeeValue,
	} = props;
	const object = fee
		? {
				fee: fee,
				token: data?.token,
		  }
		: {
				rank: statusUpdate.toUpperCase() || statusCurrent.toUpperCase(),
				token: data?.token,
		  };
	try {
		const resPut = await axiosUtils.adminPut(`user/${id}`, object);
		setIsProcess && setIsProcess(false);
		setIsProcessFee && setIsProcessFee(false);
		setFeeValue && setFeeValue('');
		if (!setIsProcessFee) {
			const res = await axiosUtils.adminGet(
				`users/paging?page=${page}&show=${show}&search=${search}`,
			);
			dispatch(
				actions.setData({
					data: {
						...state.set.data,
						dataUser: res?.metadata,
					},
				}),
			);
			dispatchEdit(
				dispatch,
				state,
				setSnackbar,
				actions,
				res,
				'dataUser',
				resPut.message,
			);
		} else {
			const process = await axiosUtils.adminGet(`user/${id}`);
			dispatch(
				actions.setData({
					edit: {
						...state.set.edit,
						itemData: process?.metadata,
					},
				}),
			);
		}
		setSnackbar({
			open: true,
			message: resPut?.message || 'Successfully!',
			type: 'success',
		});
		// return data;
	} catch (err) {
		setIsProcess && setIsProcess(false);
		setIsProcessFee && setIsProcessFee(false);
		setSnackbar({
			open: true,
			message: err?.response?.data?.message || 'Something error!',
			type: 'error',
		});
	}
};
// EDIT RULE USER
export const handleUpdateRuleUser = async (props = {}) => {
	const {
		data,
		id,
		dispatch,
		state,
		page,
		show,
		statusUpdate,
		statusCurrent,
		search,
		setSnackbar,
		setIsProcess,
		setModalChangeRule,
	} = props;
	try {
		const resPut = await axiosUtils.adminPut(`user/permission/${id}`, {
			permission:
				statusUpdate.toLowerCase() || statusCurrent.toLowerCase(),
			token: data?.token,
		});
		setIsProcess && setIsProcess(false);
		setModalChangeRule && setModalChangeRule(false);
		const res = await axiosUtils.adminGet(
			`users/paging?page=${page}&show=${show}&search=${search}`,
		);
		dispatchEdit(
			dispatch,
			state,
			setSnackbar,
			actions,
			res,
			'dataUser',
			resPut.message,
		);
		dispatch(
			actions.setData({
				data: {
					...state.set.data,
					dataUser: res?.metadata,
				},
			}),
		);
		return data;
	} catch (err) {
		setIsProcess && setIsProcess(false);
		setSnackbar({
			open: true,
			message: err?.response?.data?.message || 'Something error!',
			type: 'error',
		});
	}
};
// DELETE USERS
export const handleDelete = async (props = {}) => {
	const { data, id, dispatch, state, page, show, search, setSnackbar } =
		props;
	const resDel = await axiosUtils.adminGet(`resetUser/${id}`, {
		headers: {
			token: data?.token,
		},
	});
	const res = await axiosUtils.adminGet(
		`/users/paging/?page=${page}&show=${show}&search=${search}`,
	);
	dispatchDelete(
		dispatch,
		state,
		setSnackbar,
		actions,
		res,
		'dataUser',
		resDel.message,
	);
};
// CHANGE COIN GIFTS VALUE
export const changeCoinGifts = async (props = {}) => {
	const { coin, selectStatus, dispatch, state } = props;
	dispatch(
		actions.setData({
			...state.set,
			changeCoin: coin,
		}),
	);
	dispatch(
		actions.toggleModal({
			...state.toggle,
			selectStatus: !selectStatus,
		}),
	);
};
// CHANGE BANK VALUE
export const changeBankSelect = async (props = {}) => {
	const {
		bankValue,
		selectBank,
		dispatch,
		state,
		setStateModalProfilePayment,
	} = props;
	dispatch(
		actions.setData({
			...state.set,
			bankValue: bankValue,
		}),
	);
	dispatch(
		actions.toggleModal({
			...state.toggle,
			selectBank: !selectBank,
		}),
	);
	if (setStateModalProfilePayment) {
		setStateModalProfilePayment(false);
	}
};
// UPDATE COIN
export const updateCoinGift = async (props = {}) => {
	const {
		token,
		id,
		changeCoin,
		quantityCoin,
		createBy,
		date,
		dispatch,
		state,
		setIsProcessCoin,
		setSnackbar,
	} = props;
	try {
		const resPut = await axiosUtils.adminPost(`change/coin/${id}`, {
			symbol: changeCoin,
			quantity: parseFloat(quantityCoin),
			createBy: createBy,
			date: date,
			token: token,
		});
		setIsProcessCoin && setIsProcessCoin(false);
		const process = await axiosUtils.adminGet(`user/${id}`);
		const { metadata } = process;
		dispatch(
			actions.setData({
				edit: {
					...state.set.edit,
					itemData: metadata,
				},
				changeCoin: '',
				quantityCoin: '',
				bankValue: '',
			}),
		);
		dispatch(
			actions.toggleModal({
				modalDelete: false,
				modalStatus: false,
			}),
		);
		setSnackbar({
			open: true,
			message: resPut.message,
			type: 'success',
		});
	} catch (err) {
		setIsProcessCoin && setIsProcessCoin(false);
		setSnackbar({
			open: true,
			message: err?.response?.data?.message || 'Something error!',
			type: 'error',
		});
	}
};
// SEARCH COIN GIFT
export const searchCoinGift = (props = {}) => {
	const { dataCoins, coin } = props;
	let DataCoinFlag = dataCoins;
	if (coin) {
		DataCoinFlag = DataCoinFlag.filter((item) => {
			return searchUtils.searchInput(coin, item.name);
		});
	}
	return DataCoinFlag;
};
// SEARCH PAYMENT ADMIN
export const searchPaymentAdmin = (props = {}) => {
	const { dataPaymentAdmin, bank } = props;
	let DataPaymentAdminFlag = dataPaymentAdmin;
	if (bank) {
		DataPaymentAdminFlag = DataPaymentAdminFlag.filter((item) => {
			return (
				searchUtils.searchInput(bank, item.methodName) ||
				searchUtils.searchInput(bank, item.accountName) ||
				searchUtils.searchInput(bank, item.accountNumber)
			);
		});
	}
	return DataPaymentAdminFlag;
};
// CHANG PASSWORD USER BY ID
export const changePasswordUser = async (props = {}) => {
	const {
		data,
		id,
		dispatch,
		state,
		password,
		setSnackbar,
		setIsProcessChangePwd,
	} = props;
	try {
		const resPut = await axiosUtils.adminPut(`user/password/${id}`, {
			password: password,
			token: data?.token,
		});
		setIsProcessChangePwd(false);
		const process = await axiosUtils.adminGet(`user/${id}`);
		const { metadata } = process;
		dispatch(
			actions.setData({
				edit: {
					...state.set.edit,
					itemData: metadata,
				},
			}),
		);
		dispatch(
			actions.toggleModal({
				...state.toggle,
				modalDelete: false,
				modalStatus: false,
			}),
		);
		setSnackbar({
			open: true,
			message: resPut?.message || 'Change password successfully!',
			type: 'success',
		});
	} catch (err) {
		setIsProcessChangePwd(false);
		setSnackbar({
			open: true,
			message: err?.response?.data?.message || 'Something error!',
			type: 'error',
		});
	}
};
// REFRESH PASSWORD USER
export const refreshPasswordUser = async (props = {}) => {
	const { data, id, dispatch, state, setIsProcessRefreshPwd, setSnackbar } =
		props;
	try {
		const resPut = await axiosUtils.adminPut(`user/password/reset/${id}`, {
			token: data?.token,
		});
		setIsProcessRefreshPwd(false);
		const process = await axiosUtils.adminGet(`user/${id}`);
		const { metadata } = process;
		dispatch(
			actions.setData({
				edit: {
					...state.set.edit,
					itemData: metadata,
				},
			}),
		);
		dispatch(
			actions.toggleModal({
				...state.toggle,
				modalDelete: false,
				modalStatus: false,
			}),
		);
		setSnackbar({
			open: true,
			message: resPut.message,
			type: 'success',
		});
	} catch (err) {
		setIsProcessRefreshPwd(false);
		setSnackbar({
			open: true,
			message: err?.response?.data?.message || 'Something error!',
			type: 'error',
		});
	}
};
// BLOCK/UNBLOCK USER
export const blockAndUnblockUser = async (props = {}) => {
	const {
		token,
		id,
		dispatch,
		state,
		blockUser,
		setIsProcessBlockUser,
		setSnackbar,
	} = props;
	try {
		const resPut = await axiosUtils.adminPut(`user/lock/${id}`, {
			lock: blockUser,
			token: token,
		});
		setIsProcessBlockUser(false);
		const process = await axiosUtils.adminGet(`user/${id}`);
		const { metadata } = process;
		dispatch(
			actions.setData({
				edit: {
					...state.set.edit,
					itemData: metadata,
				},
			}),
		);
		dispatch(
			actions.toggleModal({
				...state.toggle,
				modalDelete: false,
				modalStatus: false,
			}),
		);
		setSnackbar({
			open: true,
			message: resPut.message,
			type: 'success',
		});
	} catch (err) {
		setIsProcessBlockUser(false);
		setSnackbar({
			open: true,
			message: err?.response?.data?.message || 'Something error!',
			type: 'error',
		});
	}
};
// CHANGE PASSWORD USER
export const changePassword = async (props = {}) => {
	const {
		id,
		oldPWD,
		newPWD,
		token,
		setIsProcess,
		setStateModalChangePwd,
		setSnackbar,
	} = props;
	try {
		const resPut = await axiosUtils.userPut(`password/${id}`, {
			// oldPWD: oldPWD,
			password: newPWD,
			token: token,
		});
		setIsProcess(false);
		setStateModalChangePwd(false);
		setSnackbar({
			open: true,
			message: resPut?.message
				? resPut?.message
				: 'Change password successfully',
			type: 'success',
		});
	} catch (err) {
		setIsProcess(false);
		setStateModalChangePwd(false);
		setSnackbar({
			open: true,
			message:
				`Change password failed. ${err?.response?.data?.message}` ||
				'Change password failed',
			type: 'error',
		});
	}
};
// CREATE PROFILE PAYMENT USER
export const createProfilePayment = async (props = {}) => {
	const {
		id,
		bank,
		accountName,
		accountNumber,
		token,
		setIsProcess,
		setSnackbar,
		setStateModalProfilePayment,
	} = props;
	try {
		const resPut = await axiosUtils.userPut(`payment/${id}`, {
			bankName: bank,
			name: accountName,
			account: accountNumber,
			token: token,
		});
		setIsProcess(false);
		setStateModalProfilePayment(false);
		setSnackbar({
			open: true,
			message: resPut?.message
				? resPut?.message
				: 'Create payment account successfully',
			type: 'success',
		});
	} catch (err) {
		setIsProcess(false);
		setStateModalProfilePayment(false);
		setSnackbar({
			open: true,
			message:
				err?.response?.data?.message || 'Create payment account failed',
			type: 'error',
		});
	}
};
// UPLOAD DOCUMENT USER
export const uploadDocument = async (props = {}) => {
	const {
		token,
		cccdFont,
		cccdBeside,
		licenseFont,
		licenseBeside,
		setIsProcess,
		setStateModalUpload,
		setSnackbar,
		id,
	} = props;
	try {
		const resPut = await axiosUtils.userPut(
			`image/${id}`,
			{
				cccdFont: cccdFont,
				cccdBeside: cccdBeside,
				licenseFont: licenseFont,
				licenseBeside: licenseBeside,
				token: token,
			},
			{
				headers: {
					'Content-Type': 'multipart/form-data',
					token: token,
				},
			},
		);
		setIsProcess(false);
		setStateModalUpload(false);
		setSnackbar({
			open: true,
			message: resPut?.message
				? resPut?.message
				: 'Upload document successfully',
			type: 'success',
		});
	} catch (err) {
		setIsProcess(false);
		setStateModalUpload(false);
		setSnackbar({
			open: true,
			message:
				err?.response?.data?.message ||
				'Upload document failed. Image size is too large. Please upload images that are less than or equal to 450x300 pixels',
			type: 'error',
		});
	}
};
