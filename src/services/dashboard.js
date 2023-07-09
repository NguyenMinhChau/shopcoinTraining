/* eslint-disable no-unused-vars */
import { actions } from '../app/';
import { axiosUtils } from '../utils';

export const SVtotal = async (props = {}) => {
	const {
		fromDate,
		toDate,
		setIsLoad,
		setIsProcess,
		page,
		show,
		search,
		dispatch,
		setSnackbar,
		setDataSymbol,
	} = props;
	try {
		const objectBody =
			fromDate && toDate
				? {
						from: fromDate,
						to: toDate,
				  }
				: {};
		const resPostDeposit = await axiosUtils.adminGet(
			'total/deposit',
			objectBody,
		);
		const resPostWithdraw = await axiosUtils.adminGet(
			'total/withdraw',
			objectBody,
		);
		const resPostBalance = await axiosUtils.adminGet(`total/balance`, {});
		const resPostCommission = await axiosUtils.adminPost(
			'total/commission',
			{},
		);
		const resUserBalance = await axiosUtils.adminGet(
			'user/balance/normal',
			{},
		);
		const resSymbol = await axiosUtils.coinGet('total/sold', {});
		setDataSymbol(resSymbol?.metadata);
		dispatch(
			actions.setData({
				totalDeposit: resPostDeposit?.metadata,
				totalWithdraw: resPostWithdraw?.metadata,
				totalBalance: resPostBalance?.metadata,
				totalCommission: resPostCommission?.metadata,
				dataUserBalance: resUserBalance?.metadata,
			}),
		);
		setIsProcess(false);
		setIsLoad(false);
	} catch (err) {
		setIsProcess(false);
		setIsLoad(false);
		setSnackbar({
			open: true,
			type: 'error',
			message: err?.response?.data?.message || 'Something error!',
		});
	}
};
