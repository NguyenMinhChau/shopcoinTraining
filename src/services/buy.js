import { actions } from '../app/';
import {
	axiosUtils,
	searchUtils,
	dispatchEdit,
	dispatchDelete,
} from '../utils';

// GET DATA BUYS
export const getBuys = async (props = {}) => {
	const { page, show, dispatch, state, search, setSnackbar } = props;
	try {
		const processBuys = await axiosUtils.adminGet(
			`bill/buyCoin/paging?page=${page}&show=${show}&search=${search}`,
		);
		const processUser = await axiosUtils.adminGet('user');
		dispatch(
			actions.setData({
				data: {
					...state.set.data,
					dataBuy: processBuys,
					dataUser: processUser,
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
// GET BUY/SELL BY ID
export const getBuySellById = async (props = {}) => {
	const { idBuy, idSell, dispatch, state, setSnackbar } = props;
	try {
		if (idBuy || idSell) {
			const processUser = await axiosUtils.adminGet('user');
			const process = await axiosUtils.adminGet(
				`bill/${idBuy || idSell}`,
			);
			const { data } = process;
			dispatch(
				actions.setData({
					edit: {
						...state.set.edit,
						itemData: data,
					},
					data: {
						...state.set.data,
						dataUser: processUser,
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
// SEARCH DATA BUYS
export const searchBuys = (props = {}) => {
	const { dataBuy, buy } = props;
	let dataBuyFlag =
		dataBuy && dataBuy?.data?.filter((x) => x?.type === 'BuyCoin');
	if (buy) {
		dataBuyFlag = dataBuyFlag.filter((item) => {
			return (
				searchUtils.searchInput(buy, item._id) ||
				searchUtils.searchInput(buy, item.buyer.gmailUSer) ||
				searchUtils.searchInput(buy, item?.amountUsd) ||
				searchUtils.searchInput(buy, item?.amount) ||
				searchUtils.searchInput(buy, item?.symbol) ||
				searchUtils.searchInput(buy, item?.createdAt) ||
				searchUtils.searchInput(buy, item?.createBy) ||
				searchUtils.searchInput(buy, item.status)
			);
		});
	}
	return dataBuyFlag;
};
// UPDATE STATUS/FEE BUYS
export const handleUpdateStatusFeeBuy = async (props = {}) => {
	const {
		fee,
		data,
		id,
		dispatch,
		note,
		state,
		statusUpdate,
		statusCurrent,
		page,
		show,
		search,
		setSnackbar,
		setIsProcess,
	} = props;
	const object = fee
		? {
				fee: fee,
				token: data?.token,
		  }
		: {
				status: statusUpdate || statusCurrent,
				note: note,
				token: data?.token,
		  };
	try {
		const resPut = await axiosUtils.adminPut(`handle/buy/${id}`, object);
		setIsProcess && setIsProcess(false);
		const res = await axiosUtils.adminGet(
			`bill/buyCoin/paging?page=${page}&show=${show}&search=${search}`,
		);
		dispatchEdit(
			dispatch,
			state,
			setSnackbar,
			actions,
			res,
			'dataBuy',
			resPut.message,
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
// DELETE BUYS - CHƯA BIẾT API
export const handleDelete = async (props = {}) => {
	const { data, id, dispatch, state, page, show, search, setSnackbar } =
		props;
	try {
		const resDel = await axiosUtils.adminDelete(`bill/${id}`, {
			headers: {
				token: data?.token,
			},
		});
		const res = await axiosUtils.adminGet(
			`bill/buyCoin/paging?page=${page}&show=${show}&search=${search}`,
		);
		dispatchDelete(
			dispatch,
			state,
			setSnackbar,
			actions,
			res,
			'dataBuy',
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
