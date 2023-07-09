/* eslint-disable prettier/prettier */

import {getRateDepositWithdraw} from '../app/payloads/getById';
import {adminGet, rateGet} from '../utils/axios/axiosInstance';

// GET RATE DEPOSIT/WITHDRAW
export const SVgetRateDepositWithdraw = async (props = {}) => {
  const {dispatch, toast} = props;
  try {
    const resGet = await adminGet('rate');
    dispatch(getRateDepositWithdraw(resGet.metadata));
  } catch (err) {
    toastShow(toast, err?.response?.data?.message || 'Something error!');
  }
};
