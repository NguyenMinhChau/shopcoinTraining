/* eslint-disable prettier/prettier */
import {Alert} from 'react-native';
import {coinGet, userGet, userPost} from '../utils/axios/axiosInstance';
import {routersMain} from '../routers/Main';
import {routers} from '../routers/Routers';

// GET ALL COINS
export const SVgetAllCoins = async (props = {}) => {
  const resGet = await userGet(
    props.page && props.show
      ? `getAllCoin/${props.email}?page=${props.page}&show=${props.show}`
      : `/getAllCoin/${props.email}`,
  );
  props.dispatch(props.getAllCoins(resGet));
};
// GET COIN BY ID
export const SVgetACoin = async (props = {}) => {
  if (props.id) {
    const resGet = await coinGet(`/getCoin/${props.id}`);
    props.dispatch(props.getById(resGet?.data));
  }
};
// GET ALL MY COIN
export const SVgetAllMyCoin = async (props = {}) => {
  const resGet = await userGet(`/getAllCoinOfUser/${props.id}`);
  props.dispatch(props.getAllMyCoin(resGet?.data));
};
// GET COIN BY SYMBOL
export const SVgetCoinBySymbol = async (props = {}) => {
  if (props.symbol) {
    const resGet = await coinGet(`/getCoinSymbol/${props.symbol}`);
    props.dispatch(props.getBySymbol(resGet?.data));
  }
};
// BUY COIN
export const SVbuyCoin = async (props = {}) => {
  const {
    gmailUser,
    amount,
    amountUsd,
    symbol,
    price,
    token,
    setLoading,
    setIsProcess,
    navigation,
  } = props;
  try {
    await userPost('/BuyCoin', {
      gmailUser: gmailUser,
      amount: amount,
      amountUsd: amountUsd, //amount * price
      symbol: symbol,
      price: price, // api
      type: 'BuyCoin',
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
    }, 3000);
  } catch (err) {
    setLoading(true);
    setIsProcess(false);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Error!',
        `An error occurred, please try again. ${err?.response?.data?.message}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate(routers.Home),
          },
        ],
      );
    }, 3000);
  }
};
// SELL COIN
export const SVsellCoin = async (props = {}) => {
  const {
    gmailUser,
    amount,
    amountUsd,
    symbol,
    price,
    token,
    setLoading,
    setIsProcess,
    setIsProcessSellAll,
    navigation,
  } = props;
  try {
    await userPost('/SellCoin', {
      gmailUser: gmailUser,
      amount: amount,
      amountUsd: amountUsd, //amount * price
      symbol: symbol,
      price: price, // api
      type: 'SellCoin',
      token: token,
    });
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
    }, 3000);
  } catch (err) {
    setLoading(true);
    setIsProcess(false);
    setIsProcessSellAll(false);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Error!',
        `An error occurred, please try again. ${err?.response?.data?.message}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate(routers.MyCoin),
          },
        ],
      );
    }, 3000);
  }
};
