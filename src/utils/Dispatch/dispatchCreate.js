const dispatchCreate = (dispatch, state, setSnackbar, actions, data, nameData, message) => {
    dispatch(
        actions.setData({
            form: {
                username: '',
                email: '',
                password: '',
                oldPassword: '',
                confirmPassword: '',
                accountName: '',
                bankName: '',
                accountNumber: '',
                nameCoin: '',
                fullName: '',
                rateDeposit: 0,
                rateWithdraw: 0,
                symbolCoin: '',
                indexCoin: '',
                imageCoin: null,
            },
            data: {
                ...state.set.data,
                [nameData]: data,
            },
            edit: { ...state.set.edit, id: '', itemData: null, data: null },
        })
    );
    dispatch(
        actions.toggleModal({
            modalPaymentEdit: false,
            modalSettingEdit: false,
            modalDepositsEdit: false,
            modalWithdrawEdit: false,
            modalBuyEdit: false,
            modalSellEdit: false,
            modalStatus: false,
        })
    );
    setSnackbar({
        open: true,
        message: message ? message : 'Created Success',
        type: 'success',
    });
};

export default dispatchCreate;
