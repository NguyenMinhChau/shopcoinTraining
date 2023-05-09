const dispatchEdit = (dispatch, state, setSnackbar, actions, data, nameData, message) => {
    dispatch(
        actions.setData({
            statusUpdate: '',
            statusCurrent: '',
            fee: '',
            data: {
                ...state.set.data,
                [nameData]: data,
            },
            edit: { ...state.set.edit, id: '', itemData: null, data: null },
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
        message: message ? message : 'Updated Success',
        type: 'success',
    });
};

export default dispatchEdit;
