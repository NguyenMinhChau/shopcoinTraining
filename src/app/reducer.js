import { SET, TOGGLE } from './actions';
import { localStoreUtils } from '../utils';

const userStore = localStoreUtils.getStore();

const initialState = {
	set: {
		currentUser: userStore,
		accountMenu: null,
		statusCurrent: '',
		statusUpdate: '',
		fileRejections: [],
		sort: 'asc',
		isBlockUser: false,
		changeCoin: '',
		bankValue: '',
		quantityCoin: '',
		fee: '',
		tokenResetPwd: '',
		isMenuList: false,
		userById: null,
		message: {
			del: '',
			upd: '',
			cre: '',
			error: '',
		},
		form: {
			username: '',
			email: '',
			password: '',
			otpCode: '',
			accountName: '',
			bankName: '',
			accountNumber: '',
			nameCoin: '',
			fullName: '',
			rateDeposit: 0,
			rateWithdraw: 0,
			symbolCoin: '',
			indexCoin: '',
			logo: null,
			typePayment: '',
		},
		pagination: {
			page: 1,
			show: 10, //10,20,30,50
		},
		totalDeposit: '',
		totalWithdraw: '',
		totalBalance: '',
		totalCommission: '',
		dataUserBalance: [],
		data: {
			dataPayment: [],
			dataPaymentAdmin: [],
			dataRate: [],
			dataSettingCoin: [],
			dataCoinInactive: [],
			dataDeposits: [],
			dataChangeCoins: [],
			dataWithdraw: [],
			dataBuy: [],
			dataSell: [],
			dataUser: [],
			dataDashboard: [],
			dataBlacklistUser: [],
		},
		searchValues: {
			dateFrom: '',
			dateTo: '',
			dashboard: '',
			userBalance: '',
			payment: '',
			rate: '',
			settingCoin: '',
			deposits: '',
			changeCoin: '',
			withdraw: '',
			buy: '',
			sell: '',
			user: '',
			coin: '',
			bank: '',
			userBlacklist: '',
			buyHistory: '',
			sellHistory: '',
			depositUser: '',
			withdrawUser: '',
		},
		edit: {
			id: '',
			data: null,
			itemData: null,
		},
	},
	toggle: {
		modalPaymentEdit: false,
		modalSettingEdit: false,
		modalDepositsEdit: false,
		modalWithdrawEdit: false,
		modalBuyEdit: false,
		modalSellEdit: false,
		modalDelete: false,
		modalStatus: false,
		hideAllUser: false,
		alertModal: false,
		selectStatus: false,
		selectBank: false,
		feeUpdate: false,
	},
};

const setData = (payload) => {
	return {
		type: SET,
		payload,
	};
};
const toggleModal = (payload) => {
	return {
		type: TOGGLE,
		payload,
	};
};

const reducer = (state, action) => {
	switch (action?.type) {
		case SET:
			return {
				...state,
				set: {
					...state.set,
					...action.payload,
				},
			};
		case TOGGLE:
			return {
				...state,
				toggle: {
					...state.toggle,
					...action.payload,
				},
			};
		default:
			return state;
	}
};
export { initialState, setData, toggleModal };
export default reducer;
