const dispatchDelete = (dispatch, state, setSnackbar, actions, data, nameData, message) => {
    dispatch(
        actions.setData({
            data: {
                ...state.set.data,
                [nameData]: data,
            },
            edit: { ...state.set.edit, id: '', itemData: null, data: null },
        })
    );
    console.log('delete');

    dispatch(
        actions.toggleModal({
            modalDelete: false,
        })
    );
    setSnackbar({
        open: true,
        message: message ? message : 'Deleted Success',
        type: 'success',
    });
};

export default dispatchDelete;
