import { actions } from '../app/';
import { axiosUtils, dispatchEdit } from '../utils';

// GET DATA RATE
export const getRates = async (props = {}) => {
	const { state, dispatch, setSnackbar, token } = props;
	try {
		const processRate = await axiosUtils.adminGet('rate', { token: token });
		dispatch(
			actions.setData({
				data: {
					...state.set.data,
					dataRate: processRate?.metadata,
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
// UPDATE ALL RATE
export const SVupdateRate = async (props = {}) => {
	const {
		rateDeposit,
		rateWithdraw,
		token,
		idRate,
		dispatch,
		state,
		data,
		setIsProcess,
		setSnackbar,
		setModalRate,
		setRateUpdate,
	} = props;
	try {
		const resPut = await axiosUtils.adminPut(`rate/${idRate}`, {
			rate_deposit: rateDeposit,
			rate_withdraw: rateWithdraw,
			headers: { token: token },
		});
		setIsProcess(false);
		setModalRate(false);
		setRateUpdate({ rateDeposit: null, rateWithdraw: null });
		const res = await axiosUtils.adminGet('rate', { token: token });
		dispatchEdit(
			dispatch,
			state,
			setSnackbar,
			actions,
			res,
			'dataRate',
			resPut.message,
		);
		return data;
	} catch (err) {
		setIsProcess(false);
		setModalRate(false);
		setSnackbar({
			open: true,
			type: 'error',
			message: err?.response?.data?.message || 'Something error!',
		});
	}
};
