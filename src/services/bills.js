/* eslint-disable prettier/prettier */
import {getHistoryBuy} from '../app/payloads/history';
import {userGet} from '../utils/axios/axiosInstance';

// GET BUY HISTORY
export const SVgetBuyHistory = async (props = {}) => {
  const {id_user, dispatch, toast, token} = props;
  try {
    const resGet = await userGet(`bill/sell/${id_user}`, {
      headers: {token: token},
    });
    dispatch(getHistoryBuy(resGet?.metadata));
  } catch (err) {
    toastShow(toast, err?.response?.data?.message || 'Something error!');
  }
};
// GET SELL HISTORY
export const SVgetSellHistory = async (props = {}) => {
  const resGet = await userGet(`/getAllSell/${props.id}`);
  props.dispatch(props.getHistorySell(resGet?.data));
};
