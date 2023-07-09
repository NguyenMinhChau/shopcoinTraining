import { actions } from '../app/';
import {
	axiosUtils,
	searchUtils,
	dispatchEdit,
	dispatchDelete,
} from '../utils';

// GET DATA BUYS
export const getSells = async (props = {}) => {
	const { page, show, dispatch, state, search, setSnackbar } = props;
	try {
		const processSells = await axiosUtils.adminGet(
			`bill/sellCoin/paging?page=${page}&show=${show}&search=${search}`,
		);
		const processUser = await axiosUtils.adminGet('user');
		dispatch(
			actions.setData({
				data: {
					...state.set.data,
					dataSell: processSells?.metadata,
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
// SEARCH DATA BUYS
export const searchSells = (props = {}) => {
	const { dataSell, sell } = props;
	let dataSellFlag =
		dataSell && dataSell?.data?.filter((x) => x?.type === 'SellCoin');
	if (sell) {
		dataSellFlag = dataSellFlag.filter((item) => {
			return (
				searchUtils.searchInput(sell, item._id) ||
				searchUtils.searchInput(sell, item.buyer.gmailUSer) ||
				searchUtils.searchInput(sell, item?.amountUsd) ||
				searchUtils.searchInput(sell, item?.amount) ||
				searchUtils.searchInput(sell, item?.symbol) ||
				searchUtils.searchInput(sell, item?.createdAt) ||
				searchUtils.searchInput(sell, item?.createBy) ||
				searchUtils.searchInput(sell, item.status)
			);
		});
	}
	return dataSellFlag;
};
// UPDATE STATUS/FEE BUYS
export const handleUpdateStatusFeeSell = async (props = {}) => {
	const {
		fee,
		data,
		id,
		dispatch,
		state,
		note,
		page,
		show,
		statusUpdate,
		statusCurrent,
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
		const resPut = await axiosUtils.adminPut(`handle/sell/${id}`, object);
		setIsProcess && setIsProcess(false);
		const res = await axiosUtils.adminGet(
			`bill/sellCoin/paging?page=${page}&show=${show}&search=${search}`,
		);
		dispatchEdit(
			dispatch,
			state,
			setSnackbar,
			actions,
			res,
			'dataSell',
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
// DELETE BUYS
export const handleDelete = async (props = {}) => {
	const { data, id, dispatch, state, page, show, search, setSnackbar } =
		props;
	try {
		const resDel = await axiosUtils.adminDelete(
			`sell/${id}`,
			{
				headers: {
					token: data?.token,
				},
				token: data?.token,
			},
			{
				headers: {
					token: data?.token,
				},
			},
		);
		const res = await axiosUtils.adminGet(
			`/bill/sellCoin/paging?page=${page}&show=${show}&search=${search}`,
		);
		dispatchDelete(
			dispatch,
			state,
			setSnackbar,
			actions,
			res,
			'dataSell',
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
