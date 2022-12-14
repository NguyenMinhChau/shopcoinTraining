import {
    axiosUtils,
    searchUtils,
    dispatchEdit,
    dispatchDelete,
    validates,
} from '../utils';

// GET DATA BUYS
export const getBuys = async (props = {}) => {
    const processBuys = await axiosUtils.adminGet(
        `/getAllBuy?page=${props.page}&show=${props.show}&search=${props.search}`
    );
    const processUser = await axiosUtils.adminGet('/getAllUser');
    props.dispatch(
        props.actions.setData({
            ...props.state.set,
            data: {
                ...props.state.set.data,
                dataBuy: processBuys,
                dataUser: processUser,
            },
        })
    );
};
// GET BUY/SELL BY ID
export const getBuySellById = async (props = {}) => {
    if (props.idBuy || props.idSell) {
        const processUser = await axiosUtils.adminGet('/getAllUser');
        const process = await axiosUtils.adminGet(
            props.idBuy ? `/getBuy/${props.idBuy}` : `/getSell/${props.idSell}`
        );
        const { data } = process;
        props.dispatch(
            props.actions.setData({
                ...props.state.set,
                edit: {
                    ...props.state.set.edit,
                    itemData: data,
                },
                data: {
                    ...props.state.set.data,
                    dataUser: processUser,
                },
            })
        );
    }
};
// CHECK ERROR ACTIONS
export const checkErrorBuys = (props = {}) => {
    return props.dispatch(
        props.actions.setData({
            ...props.state.set,
            message: {
                error: props.err?.response?.data,
            },
        })
    );
};
// SEARCH DATA BUYS
export const searchBuys = (props = {}) => {
    let dataBuyFlag =
        props.dataBuy &&
        props.dataBuy?.data?.filter((x) => x?.type === 'BuyCoin');
    if (props.buy) {
        dataBuyFlag = dataBuyFlag.filter((item) => {
            return (
                searchUtils.searchInput(props.buy, item._id) ||
                searchUtils.searchInput(props.buy, item.buyer.gmailUSer) ||
                searchUtils.searchInput(props.buy, item?.amountUsd) ||
                searchUtils.searchInput(props.buy, item?.amount) ||
                searchUtils.searchInput(props.buy, item?.symbol) ||
                searchUtils.searchInput(props.buy, item?.createdAt) ||
                searchUtils.searchInput(props.buy, item?.createBy) ||
                searchUtils.searchInput(props.buy, item.status)
            );
        });
    }
    return dataBuyFlag;
};
// UPDATE STATUS/FEE BUYS
export const handleUpdateStatusFeeBuy = async (props = {}) => {
    const object = props.fee
        ? {
              fee: props.fee,
              token: props.data?.token,
          }
        : {
              status: props.statusUpdate || props.statusCurrent,
              note: props.note,
              token: props.data?.token,
          };
    const resPut = await axiosUtils.adminPut(
        `handleBuyCoin/${props.id}`,
        object
    );
    switch (resPut.code) {
        case 0:
            const res = await axiosUtils.adminGet(
                `/getAllBuy?page=${props.page}&show=${props.show}&search=${props.search}`
            );
            dispatchEdit(
                props.dispatch,
                props.state,
                props.actions,
                res,
                'dataBuy',
                resPut.message
            );
            return props.data;
        case 1:
        case 2:
            validates.validateCase1_2(resPut, props);
            break;
        default:
            break;
    }
};
// DELETE BUYS
export const handleDelete = async (props = {}) => {
    const resDel = await axiosUtils.adminDelete(`/deleteBuy/${props.id}`, {
        headers: {
            token: props.data?.token,
        },
    });
    switch (resDel.code) {
        case 0:
            const res = await axiosUtils.adminGet(
                `getAllBuy?page=${props.page}&show=${props.show}&search=${props.search}`
            );
            dispatchDelete(
                props.dispatch,
                props.state,
                props.actions,
                res,
                'dataBuy',
                resDel.message
            );
            return props.data;
        case 1:
        case 2:
            validates.validateCase1_2(resDel, props);
            break;
        default:
            break;
    }
};
