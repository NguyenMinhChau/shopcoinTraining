/* eslint-disable array-callback-return */
import {
	axiosUtils,
	dispatchCreate,
	dispatchEdit,
	dispatchDelete,
	searchUtils,
} from '../utils';
import routers from '../routers/routers';
import { actions } from '../app/';
// GET DATA COINS
export const getCoins = async (props = {}) => {
	const { page, show, search, dispatch, state, setSnackbar } = props;
	try {
		const processCoins = await axiosUtils.adminGet(
			`coins/paging?page=${page}&show=${show}&search=${search}`,
		);
		const processCoinsInactive = await axiosUtils.adminGet(
			`/coin/inactive/all`,
		);
		dispatch(
			actions.setData({
				data: {
					...state.set.data,
					dataSettingCoin: processCoins?.metadata,
					dataDashboard: processCoins?.metadata,
					dataCoinInactive: processCoinsInactive?.metadata,
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
// GET DATA COINS USER
export const getCoinsUser = async (props = {}) => {
	const { dispatch, state, page, show, search, id, setSnackbar } = props;
	try {
		const res = await axiosUtils.userGet(
			`coin/${id}?page=${page}&show=${show}&search=${search}`,
		);
		dispatch(
			actions.setData({
				data: {
					...state.set.data,
					dataSettingCoin: res,
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

// GET DATA COINS INACTIVE
export const getCoinsInactive = async (props = {}) => {
	const { dispatch, state, page, show, search, setSnackbar } = props;
	try {
		const processCoins = await axiosUtils.adminGet(`coin/inactive/all`);
		dispatch(
			actions.setData({
				data: {
					...state.set.data,
					dataCoinInactive: processCoins?.metadata,
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
// GET DATA COINS USER BUY
export const getCoinsUserBuy = async (props = {}) => {
	const { page, show, dispatch, state, actions } = props;
	const processCoins = await axiosUtils.coinGet(
		`/getAmountCoinUserBuy?page=${page}&show=${show}`,
	);
	dispatch(
		actions.setData({
			data: {
				...state.set.data,
				dataDashboard: processCoins,
			},
		}),
	);
};
// GET COIN INACTIVE BY ID
export const getCoinInactiveById = async (props = {}) => {
	const { idCoin, dispatch, state, setDataUserFake, setSnackbar } = props;
	try {
		if (idCoin) {
			const res = await axiosUtils.adminGet(`coin/inactive/${idCoin}`);
			const processUser = await axiosUtils.adminGet('user');
			const { metadata } = res;
			const unShowList =
				metadata?.unshow?.length > 1
					? metadata?.unshow
					: metadata?.unshow.length === 1
					? metadata?.unshow[0]?.split(',')?.filter((x) => x)
					: [];
			dispatch(
				actions.setData({
					form: {
						...state.set.form,
						nameCoin: metadata.name,
						symbolCoin: metadata.symbol,
						logo: [metadata.logo],
						fullName: metadata.fullName,
					},
					data: {
						...state.set.data,
						dataBlacklistUser: unShowList?.reduce((acc, item) => {
							processUser?.metadata?.map((user) => {
								if (user?.payment?.email === item) {
									acc.push(user);
								}
							});
							setDataUserFake(acc);
							return acc;
						}, []),
						dataUser: processUser?.metadata,
					},
					edit: {
						...state.set.edit,
						id: metadata._id,
						itemData: metadata,
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
// GET COIN BY ID
export const getCoinById = async (props = {}) => {
	const { idCoin, dispatch, state, setDataUserFake, setSnackbar } = props;
	try {
		if (idCoin) {
			const res = await axiosUtils.adminGet(`coin/${idCoin}`);
			const processUser = await axiosUtils.adminGet('user');
			const { metadata } = res;
			const unShowList =
				metadata?.unshow?.split(',')?.filter((x) => x) || [];
			dispatch(
				actions.setData({
					form: {
						...state.set.form,
						nameCoin: metadata.name,
						symbolCoin: metadata.symbol,
						logo: [metadata.logo],
						fullName: metadata.fullName,
					},
					data: {
						...state.set.data,
						dataBlacklistUser: unShowList?.reduce((acc, item) => {
							processUser?.metadata?.map((user) => {
								if (user?.payment?.email === item) {
									acc.push(user);
								}
							});
							setDataUserFake([...new Set(acc)]);
							return [...new Set(acc)];
						}, []),
						dataUser: processUser?.metadata,
					},
					edit: {
						...state.set.edit,
						id: metadata._id,
						itemData: metadata,
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

// SEARCH COINS
export const searchCoins = (props = {}) => {
	const { dataSettingCoin, settingCoin } = props;
	let dataSettingFlag = dataSettingCoin; //.data
	if (settingCoin) {
		dataSettingFlag = dataSettingFlag.filter((item) => {
			return (
				searchUtils.searchInput(settingCoin, item._id) ||
				searchUtils.searchInput(settingCoin, item.name) ||
				searchUtils.searchInput(settingCoin, item.createdAt) ||
				searchUtils.searchInput(settingCoin, item?.coin?.name) ||
				searchUtils.searchInput(settingCoin.toString(), item?.high) ||
				searchUtils.searchInput(settingCoin.toString(), item?.low) ||
				searchUtils.searchInput(settingCoin.toString(), item?.price) ||
				searchUtils.searchInput(settingCoin.toString(), item?.amount) ||
				searchUtils.searchInput(
					settingCoin.toString(),
					item?.coin?.price,
				)
			);
		});
	}
	return dataSettingFlag;
};
// SEARCH HISTORY BUY COINS
export const searchHistoryBuyCoins = (props = {}) => {
	const { data, buyHistory } = props;
	let dataFlag = data; //.data
	if (buyHistory) {
		dataFlag = dataFlag.filter((item) => {
			return (
				searchUtils.searchInput(buyHistory, item._id) ||
				searchUtils.searchInput(buyHistory, item.symbol) ||
				searchUtils.searchInput(buyHistory, item.createdAt) ||
				searchUtils.searchInput(buyHistory.toString(), item.amount) ||
				searchUtils.searchInput(
					buyHistory.toString(),
					item.amountUsd,
				) ||
				searchUtils.searchInput(buyHistory.toString(), item.status)
			);
		});
	}
	return dataFlag;
};
// SEARCH HISTORY SELL COINS
export const searchHistorySellCoins = (props = {}) => {
	const { data, sellHistory } = props;
	let dataFlag = data; //.data
	if (sellHistory) {
		dataFlag = dataFlag.filter((item) => {
			return (
				searchUtils.searchInput(sellHistory, item._id) ||
				searchUtils.searchInput(sellHistory, item.symbol) ||
				searchUtils.searchInput(sellHistory, item.createdAt) ||
				searchUtils.searchInput(sellHistory.toString(), item.amount) ||
				searchUtils.searchInput(sellHistory.toString(), item.amountUsd)
			);
		});
	}
	return dataFlag;
};
// SEARCH DEPOSIT USER
export const searchDepositUser = (props = {}) => {
	const { data, depositUser } = props;
	let dataFlag = data; //.data
	if (depositUser) {
		dataFlag = dataFlag.filter((item) => {
			return (
				searchUtils.searchInput(depositUser, item._id) ||
				searchUtils.searchInput(depositUser, item.code) ||
				searchUtils.searchInput(depositUser, item.symbol) ||
				searchUtils.searchInput(depositUser, item.amount) ||
				searchUtils.searchInput(depositUser, item.amountVnd) ||
				searchUtils.searchInput(depositUser, item.status) ||
				searchUtils.searchInput(
					depositUser,
					item?.bankAdmin?.methodName,
				) ||
				searchUtils.searchInput(
					depositUser,
					item?.bankAdmin?.accountName,
				) ||
				searchUtils.searchInput(
					depositUser,
					item?.bankAdmin?.accountNumber,
				)
			);
		});
	}
	return dataFlag;
};
// SEARCH WITHDRAW USER
export const searchWithdrawUser = (props = {}) => {
	const { data, withdrawUser } = props;
	let dataFlag = data; //.data
	if (withdrawUser) {
		dataFlag = dataFlag.filter((item) => {
			return (
				searchUtils.searchInput(withdrawUser, item.symbol) ||
				searchUtils.searchInput(withdrawUser, item.amountUsd) ||
				searchUtils.searchInput(withdrawUser, item.amountVnd) ||
				searchUtils.searchInput(withdrawUser, item.status) ||
				searchUtils.searchInput(
					withdrawUser,
					item?.method?.methodName,
				) ||
				searchUtils.searchInput(
					withdrawUser,
					item?.method?.accountName,
				) ||
				searchUtils.searchInput(
					withdrawUser,
					item?.method?.accountNumber,
				)
			);
		});
	}
	return dataFlag;
};
// SEARCH BANK ADMIN USER
export const searchBankAdminUser = (props = {}) => {
	const { data, bank } = props;
	let dataFlag = data; //.data
	if (bank) {
		dataFlag = dataFlag.filter((item) => {
			return (
				searchUtils.searchInput(bank, item.accountName) ||
				searchUtils.searchInput(bank, item.accountNumber) ||
				searchUtils.searchInput(bank, item.code) ||
				searchUtils.searchInput(bank, item.methodName) ||
				searchUtils.searchInput(bank, item.name)
			);
		});
	}
	return dataFlag;
};
// SEARCH BLACKLIST USERS
export const searchBlacklistUsers = (props = {}) => {
	const { dataUser, userBlacklist } = props;
	let searchDataFlag = dataUser; //.dataUser
	if (userBlacklist) {
		searchDataFlag = searchDataFlag?.filter((item) => {
			return (
				searchUtils.searchInput(userBlacklist, item.payment.email) ||
				searchUtils.searchInput(userBlacklist, item.payment.name)
			);
		});
	}
	return searchDataFlag;
};
// CREATE COINS
export const handleCreate = async (props = {}) => {
	const {
		nameCoin,
		symbolCoin,
		indexCoin,
		fullName,
		logo,
		hideAllUser,
		dataUser,
		dataBlacklistUser,
		data,
		history,
		page,
		show,
		setSnackbar,
		dispatch,
		state,
		setIsProcess,
	} = props;
	const form = {
		nameCoin: nameCoin,
		symbolCoin: symbolCoin,
		indexCoin: indexCoin,
		fullName: fullName,
		logo: logo,
		hideAllUser: hideAllUser,
		dataBlacklistUser: hideAllUser ? dataUser : dataBlacklistUser,
	};
	const unShowList = form?.dataBlacklistUser?.reduce((acc, item) => {
		acc += `${item.payment.email},`;
		return acc;
	}, '');
	try {
		const resPost = await axiosUtils.adminPost(
			'coin',
			{
				statement: form.logo[0],
				name: form.nameCoin,
				symbol: form.symbolCoin,
				fullName: form.fullName,
				unshow: unShowList,
				token: data?.token,
			},
			{
				headers: {
					'Content-Type': 'multipart/form-data',
					token: data?.token,
				},
			},
		);
		setIsProcess(false);
		const res = await axiosUtils.adminGet(
			`coins/paging?page=${page}&show=${show}`,
		);
		dispatchCreate(
			dispatch,
			state,
			setSnackbar,
			actions,
			res,
			'dataSettingCoin',
			resPost.message,
		);
		history(`${routers.settingCoin}`);
	} catch (err) {
		setIsProcess(false);
		setSnackbar({
			open: true,
			message: err?.response?.data?.message || 'Something error!',
			type: 'error',
		});
	}
};
// CREATE COINS
export const handleCreateCoinInactive = async (props = {}) => {
	const {
		logo_sub,
		nameCoin,
		symbolCoin,
		fullName,
		logo,
		dispatch,
		state,
		data,
		page,
		show,
		history,
		setSnackbar,
		setIsProcess,
	} = props;
	const objectBody = logo_sub
		? {
				logo: logo_sub,
				name: nameCoin,
				symbol: symbolCoin,
				fullName: fullName,
				token: data?.token,
		  }
		: {
				logo: logo[0],
				name: nameCoin,
				symbol: symbolCoin,
				fullName: fullName,
				token: data?.token,
		  };
	try {
		const resPost = await axiosUtils.adminPost(
			'/coin/inactive',
			objectBody,
			{
				headers: {
					// 'Content-Type': 'multipart/form-data',
					token: data?.token,
				},
			},
		);
		setIsProcess && setIsProcess(false);
		const res = await axiosUtils.adminGet(`coin/inactive/all`);
		dispatchCreate(
			dispatch,
			state,
			setSnackbar,
			actions,
			res,
			'dataCoinInactive',
			resPost.message,
		);
		history(`${routers.coinInactive}`);
		return data;
	} catch (err) {
		setIsProcess && setIsProcess(false);
		setSnackbar({
			open: true,
			severity: 'error',
			message: err?.response?.data?.message || 'Something error!',
		});
	}
};
// UPDATE COINS
export const handleUpdate = async (props = {}) => {
	const {
		nameCoin,
		symbolCoin,
		indexCoin,
		fullName,
		logo,
		hideAllUser,
		dataUser,
		dataBlacklistUser,
		id,
		data,
		history,
		dispatch,
		state,
		setSnackbar,
		page,
		show,
		search,
		setIsProcess,
	} = props;
	const form = {
		nameCoin: nameCoin,
		symbolCoin: symbolCoin,
		indexCoin: indexCoin,
		fullName: fullName,
		logo: logo,
		hideAllUser: hideAllUser,
		dataBlacklistUser: hideAllUser ? dataUser : dataBlacklistUser,
	};
	const unshowList = form.dataBlacklistUser.reduce((acc, item) => {
		acc += `${item.payment.email},`;
		return acc;
	}, '');
	try {
		const resPut = await axiosUtils.adminPut(
			`coin/${id}`,
			{
				statement: form.logo[0],
				name: form.nameCoin,
				symbol: form.symbolCoin,
				fullName: form.fullName,
				unshow: unshowList,
				token: data?.token,
			},
			{
				headers: {
					'Content-Type': 'multipart/form-data',
					token: data?.token,
				},
			},
		);
		setIsProcess(false);
		const res = await axiosUtils.adminGet(
			`coins/paging?page=${page}&show=${show}&search=${search}`,
		);
		dispatchEdit(
			dispatch,
			state,
			setSnackbar,
			actions,
			res,
			'dataSettingCoin',
			resPut.message,
		);
		setSnackbar({
			open: true,
			message: resPut?.message || 'Successfully!',
			type: 'success',
		});
		history(`${routers.settingCoin}`);
	} catch (err) {
		setIsProcess(false);
		setSnackbar({
			open: true,
			message: err?.response?.data?.message || 'Something error!',
			type: 'error',
		});
	}
};
// UPDATE COINS INACTIVE
export const handleUpdateInactive = async (props = {}) => {
	const {
		data,
		dispatch,
		state,
		nameCoin,
		symbolCoin,
		fullName,
		logo,
		page,
		show,
		id,
		token,
		search,
		history,
		setIsProcess,
		setSnackbar,
	} = props;
	const form = {
		nameCoin: nameCoin,
		symbolCoin: symbolCoin,
		fullName: fullName,
		logo: logo,
	};
	try {
		const resPut = await axiosUtils.adminPut(
			`coin/inactive/${id}`,
			{
				statement: form.logo[0],
				name: form.nameCoin,
				symbol: form.symbolCoin,
				fullName: form.fullName,
				token: token,
			},
			{
				headers: {
					'Content-Type': 'multipart/form-data',
					token: data?.token,
				},
			},
		);
		setIsProcess(false);
		const res = await axiosUtils.adminGet(`coin/inactive/all`);
		dispatchEdit(
			dispatch,
			state,
			setSnackbar,
			actions,
			res,
			'dataCoinInactive',
			resPut.message,
		);

		history(`${routers.coinInactive}`);
		return data;
	} catch (err) {
		setIsProcess(false);
		setSnackbar({
			open: true,
			severity: 'error',
			message: err?.response?.data?.message || 'Something error!',
		});
	}
};

// DELETE COINS
export const handleDelete = async (props = {}) => {
	const { id, data, page, show, search, dispatch, state, setSnackbar } =
		props;
	try {
		const resDel = await axiosUtils.adminDelete(`coin/${id}`, {
			headers: {
				token: data.token,
			},
		});
		const res = await axiosUtils.adminGet(
			`/coins/paging?page=${page}&show=${show}&search=${search}`,
		);
		dispatchDelete(
			dispatch,
			state,
			setSnackbar,
			actions,
			res,
			'dataSettingCoin',
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
// DELETE COINS
export const handleDeleteInactive = async (props = {}) => {
	const {
		data,
		id,
		dispatch,
		state,
		actions,
		page,
		show,
		search,
		setSnackbar,
	} = props;
	try {
		const resDel = await axiosUtils.adminDelete(`coin/inactive/${id}`, {
			headers: {
				token: data.token,
			},
		});
		const res = await axiosUtils.adminGet(`coin/inactive/all`);
		dispatchDelete(
			dispatch,
			state,
			setSnackbar,
			actions,
			res,
			'dataCoinInactive',
			resDel.message,
		);
		return data;
	} catch (err) {
		setSnackbar({
			open: true,
			severity: 'error',
			message: err?.response?.data?.message || 'Something error!',
		});
	}
};
// ONCLICK EDIT COINS
export const onClickEdit = async (props = {}) => {
	const { item, dispatch, state } = props;
	console.log(item);
	const dataUser = await axiosUtils.adminGet('user');
	// const data = item?.unshow.split(',').filter((x) => x) || [];
	dispatch(
		actions.setData({
			...state?.set,
			form: {
				...state.set.form,
				nameCoin: item.name,
				symbolCoin: item.symbol,
				indexCoin: item.index,
				logo: [item.logo],
				fullName: item.fullName,
			},
			// data: {
			// 	...state.set.data,
			// 	dataBlacklistUser: data?.reduce((acc, item) => {
			// 		dataUser?.metadata?.map((user) => {
			// 			if (user?.payment?.email === item) {
			// 				acc.push(user);
			// 			}
			// 		});
			// 		return acc;
			// 	}, []),
			// },
			edit: {
				id: item?._id || item?.id,
				itemData: item,
			},
		}),
	);
};
// HANDLE APPLY BLACKLIST USERS
export const handleApplyBlacklist = async (props = {}) => {
	const { userBlacklist, dispatch, state, dataUserFake } = props;
	if (userBlacklist) {
		dispatch(
			actions.setData({
				data: {
					...state.set.data,
					dataBlacklistUser: dataUserFake,
				},
				searchValues: {
					...state.set.searchValues,
					userBlacklist: '',
				},
			}),
		);
	}
};
// HANDLE DELETE BLACKLIST USERS
export const handleDeleteBlacklist = async (props = {}) => {
	const { dispatch, state, id, setDataUserFake, dataUserFake, setSnackbar } =
		props;
	await 1;
	dispatch(
		actions.setData({
			data: {
				...state.set.data,
				dataBlacklistUser: dataUserFake.filter(
					(item) => item._id !== id,
				),
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
		message: `Xoá thành công user blacklist - Delete successfully | id: ${id}`,
		type: 'success',
	});
	setDataUserFake(dataUserFake.filter((item) => item._id !== id));
};
// HANDLE BUY COIN USER
export const handleBuyCoin = async (props = {}) => {
	const {
		idUser,
		symbol,
		amount,
		price,
		date,
		token,
		setIsProcess,
		history,
	} = props;
	try {
		const resPost = await axiosUtils.userPost(`buy/${idUser}`, {
			symbol: symbol,
			quantity: amount,
			price: price,
			date: date,
			token: token,
		});
		setIsProcess(false);
		alert(resPost?.message || 'Buy coin successfully');
		history(routers.homeUser);
	} catch (err) {
		setIsProcess(false);
		alert(err?.response?.data?.message || 'Buy coin failed');
		history(routers.homeUser);
	}
};
// HANDLE SELL COIN USER
export const handleSellCoin = async (props = {}) => {
	const {
		id_user,
		amount,
		amountUsd,
		symbol,
		price,
		token,
		setIsProcessAll,
		setIsProcess,
		history,
		setAmountSell,
		dispatch,
	} = props;
	try {
		const resPost = await axiosUtils.userPost(`sell/${id_user}`, {
			quantity: amount,
			symbol: symbol,
			price: price,
			type: 'SellCoin',
			token: token,
		});
		setIsProcess(false);
		setIsProcessAll(false);
		dispatch(setAmountSell(''));
		alert(resPost?.message || 'Sell coin successfully');
		history(routers.myCoinUser);
	} catch (err) {
		setIsProcess(false);
		setIsProcessAll(false);
		alert(err?.response?.data?.message || 'Something error!');
		history(routers.myCoinUser);
	}
};
