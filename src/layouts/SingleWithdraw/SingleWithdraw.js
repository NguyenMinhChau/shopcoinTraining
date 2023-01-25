/* eslint-disable prettier/prettier */
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
import {formatUSDT, formatVND} from '../../utils/format/Money';
import {setCodeValue} from '../../app/payloads/form';
import {getAllWithdraws} from '../../app/payloads/getAll';
import {FormInput, ModalLoading, RowDetail} from '../../components';
import styles from './SingleWithdrawCss';
import stylesGeneral from '../../styles/General';
import stylesStatus from '../../styles/Status';
import {dateFormat} from '../../utils/format/Date';
import {
  SVcheckCode,
  SVdeleteWithdraw,
  SVresendCode,
} from '../../services/withdraw';
import {setCurrentUser} from '../../app/payloads/user';
import {setMessage} from '../../app/payloads/message';
import requestRefreshToken from '../../utils/axios/refreshToken';
import {textLower} from '../../utils/format/textLowercase';

export default function SingleWithdraw({navigation, route}) {
  const {data} = route.params;
  const {state, dispatch} = useAppContext();
  const {currentUser, codeVerify} = state;
  const [refreshing, setRefreshing] = React.useState(false);
  const [timer, setTimer] = useState(300);
  const [loading, setLoading] = useState(false);
  const [isProcess, setIsProcess] = useState(false);
  const [isProcessCancel, setIsProcessCancel] = useState(false);
  const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };
  useEffect(() => {
    if (timer > 0) {
      setTimeout(() => setTimer(timer - 1), 1000);
    } else {
      setTimer(0);
    }
  }, [timer]);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    wait(2000).then(() => setRefreshing(false));
  }, []);
  const handleChangeInput = (name, val) => {
    dispatch(setCodeValue(val));
  };
  // console.log(data);
  const createWithdrawAPI = dataAPI => {
    SVcheckCode({
      code: codeVerify,
      token: dataAPI?.token,
      id: data?.withdraw?._id || data?._id,
      email: currentUser.email,
      dispatch,
      getAllWithdraws,
      setLoading,
      navigation,
      setIsProcess,
    });
  };
  const handleSubmit = async () => {
    try {
      await 1;
      setIsProcess(true);
      requestRefreshToken(
        currentUser,
        createWithdrawAPI,
        state,
        dispatch,
        setCurrentUser,
        setMessage,
      );
    } catch (err) {
      console.log(err);
    }
  };
  const cancelWithdrawAPI = (dataAPI, id) => {
    SVcheckCode({
      token: dataAPI?.token,
      id: id,
      setLoading,
      navigation,
      setIsProcessCancel,
    });
  };
  const handleCancel = async id => {
    await 1;
    setIsProcessCancel(true);
    requestRefreshToken(
      currentUser,
      cancelWithdrawAPI,
      state,
      dispatch,
      setCurrentUser,
      setMessage,
      id,
    );
    // SVdeleteWithdraw({
    //   id: id,
    //   setLoading,
    //   navigation,
    //   setIsProcessCancel,
    // });
  };
  const resendCodeWithdrawAPI = (dataAPI, id) => {
    SVresendCode({
      token: dataAPI?.token,
      id: data?.withdraw?._id || data?._id,
      email: currentUser?.email,
      setLoading,
      navigation,
    });
  };
  const handleResendCode = async () => {
    try {
      requestRefreshToken(
        currentUser,
        resendCodeWithdrawAPI,
        state,
        dispatch,
        setCurrentUser,
        setMessage,
      );
      // SVresendCode({
      //   id: data?.withdraw?._id || data?._id,
      //   email: currentUser?.email,
      //   setLoading,
      //   navigation,
      // });
      setTimer(300);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <ScrollView
      style={[styles.container]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <Text style={[styles.title, stylesGeneral.text_black]}>
        Withdraw Detail
      </Text>
      <View style={[styles.info_withdraw, stylesGeneral.mb10]}>
        <RowDetail
          title="Status"
          text={data?.withdraw?.status || data?.status}
          styleDesc={[
            stylesStatus.status,
            textLower(data?.withdraw?.status || data?.status) === 'onhold' ||
            textLower(data?.withdraw?.status || data?.status) === 'on hold'
              ? stylesStatus.vipbgc
              : textLower(data?.withdraw?.status || data?.status) ===
                  'completed' ||
                textLower(data?.withdraw?.status || data?.status) === 'complete'
              ? stylesStatus.completebgc
              : textLower(data?.withdraw?.status || data?.status) ===
                  'canceled' ||
                textLower(data?.withdraw?.status || data?.status) === 'cancel'
              ? stylesStatus.cancelbgc
              : textLower(data?.withdraw?.status || data?.status) ===
                  'confirmed' ||
                textLower(data?.withdraw?.status || data?.status) === 'confirm'
              ? stylesStatus.confirmbgc
              : stylesStatus.demobgc,
          ]}
        />
        <RowDetail
          title="Created At"
          text={dateFormat(
            data?.withdraw?.createdAt || data?.createdAt,
            'DD/MM/YYYY',
          )}
        />
        <RowDetail
          title="Amount USD"
          text={formatUSDT(data?.withdraw?.amount || data?.amount)}
        />
        <RowDetail
          title="Amount VND"
          text={formatVND(data?.withdraw?.amountVnd || data?.amountVnd)}
        />
        <View style={[styles.info_item, stylesGeneral.flexRow]}>
          <Text style={[styles.info_item_text, stylesGeneral.text_black]}>
            Method
          </Text>
          <View style={[stylesGeneral.flexEnd]}>
            <Text style={[styles.info_item_desc, stylesGeneral.text_black]}>
              {data?.withdraw?.method?.methodName || data?.method?.methodName}
            </Text>
            <Text style={[styles.info_item_desc, stylesGeneral.text_black]}>
              {data?.withdraw?.method?.accountName || data?.method?.accountName}
            </Text>
            <Text style={[styles.info_item_desc, stylesGeneral.text_black]}>
              {data?.withdraw?.method?.accountNumber ||
                data?.method?.accountNumber}
            </Text>
          </View>
        </View>
      </View>
      <View style={[styles.verify_code_container]}>
        <FormInput
          label="Enter the following code"
          placeholder="Enter verify code"
          nameSymbol="shield-alt"
          onChangeText={val => handleChangeInput('codeVerify', val)}
        />
        <Text style={[stylesGeneral.mb5, stylesGeneral.fz16]}>
          This code is valid in 5 minutes. Code:{' '}
          <Text style={[timer <= 10 && stylesStatus.cancel]}>
            {timer > 0
              ? `${'0' + Math.floor(timer / 60)}:${
                  timer % 60 >= 10 ? timer % 60 : '0' + (timer % 60)
                }`
              : '00:00'}
          </Text>
        </Text>
        <Text
          onPress={handleResendCode}
          style={[
            stylesGeneral.fwbold,
            stylesStatus.complete,
            stylesGeneral.mb30,
          ]}>
          Resend Code
        </Text>
        <View style={[styles.btn_container]}>
          <TouchableOpacity
            activeOpacity={0.6}
            style={[
              styles.btn,
              (!codeVerify || isProcess) && stylesGeneral.op6,
              stylesStatus.confirmbgcbold,
              stylesGeneral.mr10,
            ]}
            disabled={!codeVerify || isProcess}
            onPress={handleSubmit}>
            <Text style={[styles.btn_text, stylesStatus.white]}>
              {isProcess ? <ActivityIndicator color="white" /> : 'Submit'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.6}
            disabled={isProcessCancel}
            style={[
              styles.btn,
              stylesStatus.cancelbgcbold,
              isProcessCancel && stylesGeneral.op6,
            ]}
            onPress={() => handleCancel(data?.withdraw?._id)}>
            <Text style={[styles.btn_text, stylesStatus.white]}>
              {isProcessCancel ? <ActivityIndicator color="white" /> : 'Cancel'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {loading && <ModalLoading />}
    </ScrollView>
  );
}
