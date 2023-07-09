/* eslint-disable prettier/prettier */
import {Alert} from 'react-native';
import {coinGet, userGet, userPost} from '../utils/axios/axiosInstance';
import {routersMain} from '../routers/Main';
import {routers} from '../routers/Routers';
import {toastShow} from '../utils/toast';
import {getAllCoins, getAllMyCoin} from '../app/payloads/getAll';
import {getById, getBySymbol} from '../app/payloads/getById';

// GET ALL COINS
export const SVgetAllCoins = async (props = {}) => {
  const {toast, id_user, dispatch} = props;
  try {
    const resGet = await userGet(`coin/${id_user}`);
    dispatch(getAllCoins(resGet?.metadata));
  } catch (err) {
    console.log('Get all coins: ', err);
    toastShow(toast, err?.response?.data?.message || 'Something error!');
  }
};
// GET COIN BY ID
export const SVgetACoin = async (props = {}) => {
  const {id_coin, toast, dispatch} = props;
  try {
    if (id_coin) {
      const resGet = await coinGet(`${id_coin}`);
      dispatch(getById(resGet?.metadata));
    }
  } catch (err) {
    toastShow(toast, err?.response?.data?.messgae || 'Something error!');
  }
};
// GET ALL MY COIN
export const SVgetAllMyCoin = async (props = {}) => {
  const {id_user, toast, dispatch, token} = props;
  try {
    const resGet = await userGet(`/coin/own/${id_user}`, {
      headers: {token: token},
    });
    dispatch(getAllMyCoin(resGet?.metadata));
  } catch (err) {
    toastShow(toast, err?.response?.data?.message || 'Something error!');
  }
};
// GET COIN BY SYMBOL
export const SVgetCoinBySymbol = async (props = {}) => {
  const {id_coin, toast} = props;
  try {
    if (id_coin) {
      const resGet = await coinGet(`${id_coin}`);
      dispatch(getBySymbol(resGet?.metadata));
    }
  } catch (err) {
    toastShow(toast, err?.response?.data?.message || 'Something error!');
  }
};
// BUY COIN
export const SVbuyCoin = async (props = {}) => {
  const {
    id_user,
    amount,
    symbol,
    price,
    token,
    setLoading,
    setIsProcess,
    navigation,
    toast,
  } = props;
  try {
    await userPost(`buy/${id_user}`, {
      quantity: amount,
      symbol: symbol,
      price: price,
      token: token,
    });
    setLoading(true);
    setIsProcess(false);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Success!',
        `${symbol.replace(
          'USDT',
          '',
        )} has been bought! Please wait for admin to approve.`,
        [
          {
            text: 'Continue',
            onPress: () => navigation.navigate(routers.Home),
          },
          {
            text: 'View History',
            onPress: () => navigation.navigate(routers.History),
          },
        ],
      );
    }, 1000);
  } catch (err) {
    setLoading(true);
    setIsProcess(false);
    toastShow(toast, err?.response?.data?.message || 'Something error!');
    navigation.navigate(routers.Home);
  }
};
// SELL COIN
export const SVsellCoin = async (props = {}) => {
  const {
    id_user,
    amount,
    symbol,
    price,
    token,
    setLoading,
    setIsProcess,
    setIsProcessSellAll,
    navigation,
    toast,
  } = props;
  try {
    await userPost(
      `sell/${id_user}`,
      {
        quantity: amount,
        symbol: symbol,
        price: price,
        token: token,
        headers: {token: token},
      },
      {headers: {token: token}},
    );
    setLoading(true);
    setIsProcess(false);
    setIsProcessSellAll(false);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Success!',
        `${symbol.replace(
          'USDT',
          '',
        )} has been sold! Please wait for admin to approve.`,
        [
          {
            text: 'Continue',
            onPress: () => navigation.navigate(routers.MyCoin),
          },
          {
            text: 'View History',
            onPress: () => navigation.navigate(routersMain.SellHistory),
          },
        ],
      );
    }, 1000);
  } catch (err) {
    setLoading(true);
    setIsProcess(false);
    setIsProcessSellAll(false);
    toastShow(toast, err?.response?.data?.message || 'Something error!');
    navigation.navigate(routers.MyCoin);
  }
};
