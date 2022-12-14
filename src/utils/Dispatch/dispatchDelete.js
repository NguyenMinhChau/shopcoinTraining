const dispatchDelete = (dispatch, state, actions, data, nameData, message) => {
    dispatch(
        actions.setData({
            data: {
                ...state.set.data,
                [nameData]: data,
            },
            edit: { ...state.set.edit, id: '', itemData: null, data: null },
            message: {
                del: message ? message : 'Deleted Success',
                error: '',
                cre: '',
                upd: '',
            },
        })
    );
    dispatch(
        actions.toggleModal({
            modalDelete: false,
            alertModal: true,
        })
    );
    // window.scrollTo({
    //     top: 0,
    //     behavior: 'smooth',
    // });
};

export default dispatchDelete;
