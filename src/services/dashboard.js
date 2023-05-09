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
	} = props;
	try {
		const objectBody =
			fromDate && toDate
				? {
						from: fromDate,
						to: toDate,
				  }
				: {};
		const resPostDeposit = await axiosUtils.adminPost(
			'/totalDeposit',
			objectBody,
		);
		const resPostWithdraw = await axiosUtils.adminPost(
			'/totalWithdraw',
			objectBody,
		);
		const resPostBalance = await axiosUtils.adminGet(
			`user/balance/normal`,
			{},
		);
		const resPostCommission = await axiosUtils.adminGet(
			'total/commission',
			{},
		);
		dispatch(
			actions.setData({
				totalDeposit: resPostDeposit?.metadata,
				totalWithdraw: resPostWithdraw?.metadata,
				totalBalance: resPostBalance?.metadata?.total,
				totalCommission: resPostCommission?.metadata?.commission,
				dataUserBalance: resPostBalance?.metadata,
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
