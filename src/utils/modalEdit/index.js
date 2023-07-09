export const modalTrue = (e, item, dispatch, state, actions, nameModal) => {
	e.stopPropagation();
	dispatch(
		actions.toggleModal({
			...state.toggle,
			[nameModal]: true,
		}),
	);
	if (item) {
		dispatch(
			actions.setData({
				...state.set,
				edit: { ...state.set.edit, itemData: item },
				form: {
					...state.set.form,
					password: item?.password,
					oldPassword: item?.oldPassword,
					confirmPassword: item?.confirmPassword,
					accountName: item?.account_name,
					bankName: item?.method_name,
					accountNumber: item?.number,
					rateDeposit: item?.rateDeposit,
					rateWithdraw: item?.rateWithdraw,
					typePayment: item?.type,
				},
			}),
		);
	}
};
export const modalFalse = (e, dispatch, state, actions, nameModal) => {
	e.stopPropagation();
	dispatch(
		actions.toggleModal({
			...state.toggle,
			[nameModal]: false,
		}),
	);
	dispatch(
		actions.setData({
			...state.set,
			message: {
				del: '',
				upd: '',
				cre: '',
				error: '',
			},
			form: {
				...state.set.form,
				password: '',
				oldPassword: '',
				confirmPassword: '',
				accountName: '',
				bankName: '',
				accountNumber: '',
				rateDeposit: 0,
				rateWithdraw: 0,
			},
			edit: { ...state.set.edit, itemData: null },
		}),
	);
};
