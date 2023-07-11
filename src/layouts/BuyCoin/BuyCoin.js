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
import socketIO from 'socket.io-client';
import {URL_SERVER} from '@env';
import {useAppContext} from '../../utils';
import {formatUSDT, precisionRound} from '../../utils/format/Money';
import {getIdUserJWT} from '../../utils/getUser/Id';
import requestRefreshToken from '../../utils/axios/refreshToken';
import {SVgetACoin, SVbuyCoin} from '../../services/coin';
import {SVgetDepositsByEmailUser} from '../../services/deposits';
import {setPriceCoinSocket} from '../../app/payloads/socket';
import {getById} from '../../app/payloads/getById';
import {setCurrentUser} from '../../app/payloads/user';
import {setMessage} from '../../app/payloads/message';
import {getAllDeposits} from '../../app/payloads/getAll';
import {setAmountCoin} from '../../app/payloads/form';
import {removeUSDT} from '../../utils/format/removeUSDT';
import {FormInput, ImageCp, ModalLoading} from '../../components';
import stylesGeneral from '../../styles/General';
import styles from './BuyCoinCss';
import stylesStatus from '../../styles/Status';
import {useToast} from 'native-base';
import {URL_SOCKET} from '@env';

export default function BuyCoin({navigation, route}) {
  const {id} = route.params;
  const toast = useToast();
  const {state, dispatch} = useAppContext();
  const {
    priceCoinSocket,
    currentUser,
    amountCoin,
    data: {dataById},
  } = state;
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const [isProcess, setIsProcess] = useState(false);
  useEffect(() => {
    SVgetACoin({
      id_coin: id,
      toast,
      dispatch,
    });
    getIdUserJWT(currentUser, dispatch);
    SVgetDepositsByEmailUser({
      email_user: currentUser.email,
      toast,
      dispatch,
    });
    dispatch(setAmountCoin(''));
  }, []);
  useEffect(() => {
    const socket = socketIO(`${URL_SOCKET}`, {
      jsonp: false,
    });
    socket.on(`send-data-${dataById?.symbol}`, data => {
      dispatch(setPriceCoinSocket(data));
    });
    return () => {
      socket.disconnect();
      socket.close();
    };
  }, [dataById?.symbol]);
  const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    dispatch(setAmountCoin(''));
    wait(2000).then(() => setRefreshing(false));
  }, []);
  const handleChange = (name, val) => {
    dispatch(setAmountCoin(val));
  };
  const handleBuyAPI = data => {
    SVbuyCoin({
      id_user: currentUser?.id,
      amount: parseFloat(amountCoin),
      symbol: dataById?.symbol,
      price: parseFloat(priceCoinSocket),
      token: data?.token,
      setLoading,
      navigation,
      setIsProcess,
      toast,
    });
  };
  const handleSubmit = () => {
    setIsProcess(true);
    requestRefreshToken(
      currentUser,
      handleBuyAPI,
      state,
      dispatch,
      setCurrentUser,
      toast,
      navigation,
    );
  };
  const yourWallet = formatUSDT(currentUser?.balance);
  const isDisabled =
    amountCoin &&
    (amountCoin < parseFloat(10 / priceCoinSocket) ||
      amountCoin > parseFloat(currentUser?.balance / priceCoinSocket) ||
      (amountCoin && !Number(amountCoin)));
  const suggestMin = precisionRound(parseFloat(10 / priceCoinSocket));
  const suggestMax = precisionRound(
    parseFloat(currentUser?.balance / priceCoinSocket),
  );
  const amountUsd = formatUSDT(
    precisionRound(amountCoin * priceCoinSocket),
  ).replace('USD', '');
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
        <ImageCp uri={dataById?.logo} />
        <View style={[styles.nameCoin, stylesGeneral.ml12]}>
          <Text style={[styles.name, stylesGeneral.text_black]}>
            {removeUSDT(dataById?.symbol)}
          </Text>
          <Text style={[styles.desc, stylesGeneral.text_black]}>
            {dataById?.fullName}
          </Text>
        </View>
      </View>
      <View style={[styles.exchange]}>
        <Text
          style={[
            stylesStatus.complete,
            stylesGeneral.fz16,
            stylesGeneral.fw500,
          ]}>
          = {priceCoinSocket || 'Processing price...'}
        </Text>
      </View>
      <Text
        style={[
          stylesGeneral.fz16,
          stylesGeneral.mb10,
          stylesGeneral.fwb,
          stylesGeneral.text_black,
        ]}>
        Your Walet: {yourWallet}
      </Text>
      <FormInput
        label="Amount Coin"
        placeholder="Enter mount coin"
        // keyboardType="number-pad"
        onChangeText={val => handleChange('amountCoin', val)}
        icon={isDisabled}
        color={isDisabled ? 'red' : ''}
        name="exclamation-triangle"
      />
      {amountCoin && priceCoinSocket ? (
        <>
          <View style={[stylesGeneral.mb5]}>
            <Text style={[stylesGeneral.text_black]}>Suggest amount</Text>
            <Text style={[stylesStatus.cancel]}>Min: {suggestMin}</Text>
            <Text style={[stylesStatus.cancel]}>Max: {suggestMax}</Text>
          </View>
          <View style={[styles.amountUsdt, stylesStatus.completebgc]}>
            <Text
              style={[
                stylesGeneral.fz16,
                stylesGeneral.fwbold,
                stylesStatus.complete,
              ]}>
              Amount USD: {amountUsd}
            </Text>
          </View>
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
      <TouchableOpacity
        activeOpacity={0.6}
        style={[
          styles.btn,
          (!amountCoin || isDisabled || isProcess || !priceCoinSocket) &&
            stylesGeneral.op6,
          stylesStatus.confirmbgcbold,
        ]}
        onPress={handleSubmit}
        disabled={!amountCoin || isDisabled || isProcess || !priceCoinSocket}>
        <Text style={[styles.btn_text, stylesStatus.white]}>
          {isProcess ? <ActivityIndicator color="white" /> : 'Submit'}
        </Text>
      </TouchableOpacity>
      {loading && <ModalLoading />}
    </ScrollView>
  );
}
