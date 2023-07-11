/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useAppContext} from '../../utils';
import {formatUSDT, precisionRound} from '../../utils/format/Money';
import {setAmountSell} from '../../app/payloads/form';
import {setCurrentUser} from '../../app/payloads/user';
import socketIO from 'socket.io-client';
import {SVsellCoin} from '../../services/coin';
import {FormInput, ImageCp, ModalLoading, RowDetail} from '../../components';
import styles from './SellCoinCss';
import stylesStatus from '../../styles/Status';
import stylesGeneral from '../../styles/General';
import requestRefreshToken from '../../utils/axios/refreshToken';
import {setPriceCoinSocket} from '../../app/payloads/socket';
import {useToast} from 'native-base';
import {URL_SOCKET, URL_SERVER} from '@env';
import {coinGet, userGet} from '../../utils/axios/axiosInstance';

export default function SellCoin({navigation, route}) {
  const {item} = route.params;
  const toast = useToast();
  const {state, dispatch} = useAppContext();
  const {priceCoinSocket, amountSell, currentUser} = state;
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const [isProcess, setIsProcess] = useState(false);
  const [isProcessSellAll, setIsProcessSellAll] = useState(false);
  const [coin, setCoin] = useState([]);
  const [coinById, setCoinById] = useState(null);
  const handleChangeInput = (name, val) => {
    dispatch(setAmountSell(val));
  };
  const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    dispatch(setAmountSell(''));
    wait(2000).then(() => setRefreshing(false));
  }, []);
  const getCoinBySymbol = async () => {
    const resGet = await coinGet(`${item._id}`);
    setCoin(resGet.metadata);
    const resGetAllCoin = await userGet(`coin/own/${currentUser?.id}`);
    const coinById = resGetAllCoin?.metadata?.find(
      item => item?._id === resGet.metadata._id,
    );
    setCoinById(coinById);
  };
  useEffect(() => {
    dispatch(setAmountSell(''));
    // getCoinBySymbol();
  }, []);
  useEffect(() => {
    const socket = socketIO(`${URL_SOCKET}`, {
      jsonp: false,
    });
    socket.on(`send-data-${item?.symbol}`, data => {
      dispatch(setPriceCoinSocket(data));
    });
    return () => {
      socket.disconnect();
      socket.close();
    };
  }, [item?.symbol]);
  const sellCoinAPI = data => {
    SVsellCoin({
      id_user: currentUser?.id,
      amount: amountSell ? amountSell : item?.amount,
      toast,
      symbol: item?.symbol,
      price: priceCoinSocket,
      token: data?.token,
      navigation,
      setLoading,
      setIsProcess,
      setIsProcessSellAll,
    });
  };
  const handleSubmit = async () => {
    if (amountSell) {
      setIsProcess(true);
    } else {
      setIsProcessSellAll(true);
    }
    requestRefreshToken(
      currentUser,
      sellCoinAPI,
      state,
      dispatch,
      setCurrentUser,
      toast,
      navigation,
    );
    dispatch(setAmountSell(''));
  };
  const isDisabled =
    parseFloat(amountSell) < 0.01 ||
    parseFloat(amountSell) > item?.amount ||
    (amountSell && !Number(amountSell));
  const suggestMax = precisionRound(item?.amount);
  return (
    <ScrollView
      style={[styles.container]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View
        style={[
          styles.image_container,
          stylesGeneral.flexRow,
          stylesGeneral.flexCenter,
        ]}>
        <ImageCp uri={item?.logo} />
        <View style={[styles.nameCoin, stylesGeneral.ml12]}>
          <Text style={[styles.name, stylesGeneral.text_black]}>
            {item?.symbol?.replace('USDT', '')}
          </Text>
          <Text
            style={[styles.desc, stylesGeneral.fz16, stylesGeneral.text_black]}>
            {item?.fullName}
          </Text>
        </View>
      </View>
      <View style={[styles.info_sellCoin]}>
        <RowDetail title="Quantity" text={item?.amount} />
        <RowDetail
          title="USD"
          text={
            priceCoinSocket
              ? `~ ${formatUSDT(item?.amount * priceCoinSocket)}`
              : 'Processing USD...'
          }
        />
        <RowDetail
          title="Average buy price"
          text={priceCoinSocket?.weightedAvgPrice || 'unknown'}
        />
        <RowDetail
          title="Coin price"
          text={priceCoinSocket ? priceCoinSocket : 'Processing price...'}
        />
        <View style={[styles.row_single]}>
          <FormInput
            label="Amount Sell"
            placeholder="0.00"
            onChangeText={val =>
              handleChangeInput('amountSell', val.replace(',', '.'))
            }
            // keyboardType="number-pad"
            icon={isDisabled}
            color={isDisabled ? 'red' : ''}
            name="exclamation-triangle"
          />
          {amountSell && priceCoinSocket ? (
            <>
              <View style={[stylesGeneral.mb5]}>
                <Text style={[stylesGeneral.text_black]}>Suggest amount</Text>
                <Text style={[stylesStatus.cancel]}>Min: 0.01</Text>
                <Text style={[stylesStatus.cancel]}>Max: {suggestMax}</Text>
              </View>
              {parseFloat(amountSell * priceCoinSocket) >= 0 && amountSell && (
                <Text
                  style={[
                    stylesGeneral.mb10,
                    stylesGeneral.fz16,
                    stylesGeneral.fwbold,
                    stylesStatus.complete,
                  ]}>
                  Receive:{' '}
                  {formatUSDT(parseFloat(amountSell * priceCoinSocket))}
                </Text>
              )}
            </>
          ) : (
            !priceCoinSocket && (
              <View>
                <Text style={[stylesGeneral.mt10, stylesStatus.black]}>
                  Please wait for pricing...
                </Text>
              </View>
            )
          )}
        </View>
      </View>
      <View style={[styles.btn_container]}>
        <TouchableOpacity
          activeOpacity={0.6}
          disabled={!amountSell || isDisabled || isProcess || !priceCoinSocket}
          style={[
            styles.btn,
            (!amountSell || isDisabled || isProcess || !priceCoinSocket) &&
              stylesGeneral.op6,
            stylesStatus.confirmbgcbold,
            stylesGeneral.mr10,
          ]}
          onPress={handleSubmit}>
          <Text style={[styles.btn_text, stylesStatus.white]}>
            {isProcess ? <ActivityIndicator color="white" /> : 'Sell Coin'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSubmit}
          activeOpacity={0.6}
          style={[
            styles.btn,
            stylesStatus.vipbgcbold,
            (isProcessSellAll || !priceCoinSocket) && stylesGeneral.op6,
          ]}
          disabled={isProcessSellAll || !priceCoinSocket}>
          <Text style={[styles.btn_text, stylesStatus.white]}>
            {isProcessSellAll ? (
              <ActivityIndicator color="white" />
            ) : (
              'Sell All'
            )}
          </Text>
        </TouchableOpacity>
      </View>
      {loading && <ModalLoading />}
    </ScrollView>
  );
}
