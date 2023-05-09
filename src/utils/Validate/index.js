import { actions } from '../../app/';

export const validateCase1_2 = (res, props) => {
    props.dispatch(
        actions.toggleModal({
            modalPaymentEdit: false,
            modalSettingEdit: false,
            modalDepositsEdit: false,
            modalWithdrawEdit: false,
            modalBuyEdit: false,
            modalSellEdit: false,
            modalDelete: false,
            modalStatus: false,
        })
    );
    props.setSnackbar({
        open: true,
        message: res?.message ? res?.message : 'Error',
        type: 'error',
    });
};
