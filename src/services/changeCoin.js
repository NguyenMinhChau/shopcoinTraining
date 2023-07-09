import { actions } from '../app/';
import { axiosUtils, dispatchDelete } from '../utils';
import { adminGet } from '../utils/Axios/axiosInstance';

// GET DATA CHANGE COIN
export const getChangeCoin = async (props = {}) => {
	const {
		page,
		show,
		dispatch,
		state,
		search,
		dataSettingCoin,
		setSnackbar,
	} = props;
	try {
		const processChangeCoin = await axiosUtils.adminGet(`change/coin`);
		const processUser = await axiosUtils.adminGet('user');
		const res = await axiosUtils.adminGet(
			`coins/paging?page=${page}&show=${dataSettingCoin?.total || 10}`,
		);
		dispatch(
			actions.setData({
				data: {
					...state.set.data,
					dataChangeCoins: processChangeCoin?.metadata,
					dataUser: processUser?.metadata,
					dataSettingCoin: res?.metadata,
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
export const getChangeCoinById = async (props = {}) => {
	const { id_coin, setSnackbar, token, setChangeCoinById } = props;
	try {
		const resGet = await adminGet(`change/coin/${id_coin}`, {});
		setChangeCoinById(resGet?.metadata);
	} catch (err) {
		setSnackbar({
			open: true,
			message: err?.response?.data?.message || 'Something error!',
			type: 'error',
		});
	}
};
// CHANGE COIN API
export const changeCoinGiftsSUB = async (props = {}) => {
	const {
		data,
		email,
		coin,
		quantityCoin,
		createBy,
		time,
		dispatch,
		state,
		page,
		show,
		search,
		setIsProcess,
		setSnackbar,
	} = props;
	try {
		const resPut = await axiosUtils.adminPost(
			`/changeCoinNegative/${email}`,
			{
				coin: coin,
				quantity: parseFloat(quantityCoin),
				createBy: createBy,
				time: time,
				token: data?.token,
			},
		);
		const processChangeCoin = await axiosUtils.adminGet(`change/coin`);
		dispatch(
			actions.setData({
				changeCoin: '',
				quantityCoin: '',
				data: {
					...state.set.data,
					dataChangeCoins: processChangeCoin?.metadata,
				},
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
		setIsProcess(false);
	} catch (err) {
		setIsProcess(false);
		dispatch(
			actions.setData({
				quantityCoin: '',
				changeCoin: '',
			}),
		);
		setSnackbar({
			open: true,
			message: err?.response?.data?.message || 'Something error!',
			type: 'error',
		});
	}
};
//  DELETE CHANGE COIN
export const deleteChangeCoin = async (props = {}) => {
	const { data, state, dispatch, id, page, show, search, setSnackbar } =
		props;
	try {
		const resDel = await axiosUtils.adminDelete(`change/coin/${id}`, {
			headers: {
				token: data?.token,
			},
		});
		const res = await axiosUtils.adminGet(`change/coin`);
		dispatchDelete(
			dispatch,
			state,
			setSnackbar,
			actions,
			res,
			'dataChangeCoins',
			resDel.message,
		);
	} catch (err) {
		setSnackbar({
			open: true,
			message: err?.response?.data?.message || 'Something error!',
			type: 'error',
		});
	}
};
