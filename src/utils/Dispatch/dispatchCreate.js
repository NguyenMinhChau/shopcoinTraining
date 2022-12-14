const dispatchCreate = (dispatch, state, actions, data, nameData, message) => {
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
            message: {
                cre: message ? message : 'Created Success',
                error: '',
                del: '',
                upd: '',
            },
        })
    );
    dispatch(
        actions.toggleModal({
            modalPaymentEdit: false,
            alertModal: true,
        })
    );
    // window.scrollTo({
    //     top: 0,
    //     behavior: 'smooth',
    // });
};

export default dispatchCreate;
