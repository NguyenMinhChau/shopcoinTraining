/* eslint-disable prettier/prettier */

import {adminGet, rateGet} from '../utils/axios/axiosInstance';

// GET RATE
export const SVgetRate = async (props = {}) => {
  const resGet = await rateGet('/getRate/636383900f123aac4ee95969');
  props.dispatch(props.getRate(resGet.data));
};
// GET RATE DEPOSIT/WITHDRAW
export const SVgetRateDepositWithdraw = async (props = {}) => {
  const resGet = await adminGet('/getRates');
  props.dispatch(props.getRateDepositWithdraw(resGet.data));
};
