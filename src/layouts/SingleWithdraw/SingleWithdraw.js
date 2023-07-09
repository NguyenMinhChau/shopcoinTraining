/* eslint-disable prettier/prettier */
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Clipboard from '@react-native-community/clipboard';
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
  SVgetWithdrawByID,
  SVresendCode,
} from '../../services/withdraw';
import {setCurrentUser} from '../../app/payloads/user';
import {setMessage} from '../../app/payloads/message';
import requestRefreshToken from '../../utils/axios/refreshToken';
import {textLower} from '../../utils/format/textLowercase';
import {useToast} from 'native-base';
import {SVgetUserById} from '../../services/user';

export default function SingleWithdraw({navigation, route}) {
  const toast = useToast();
  const {data} = route.params;
  const {state, dispatch} = useAppContext();
  const {currentUser, codeVerify, userById} = state;
  const [refreshing, setRefreshing] = React.useState(false);
  const [WRbyId, setWRbyId] = React.useState(null);
  const [timer, setTimer] = useState(300);
  const [loading, setLoading] = useState(false);
  const [isProcess, setIsProcess] = useState(false);
  const [isProcessCancel, setIsProcessCancel] = useState(false);
  const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };
  useEffect(() => {
    SVgetUserById({
      id: currentUser?.id,
      dispatch,
      toast,
    });
    SVgetWithdrawByID({
      id_wr: data?._id,
      toast,
      setWRbyId,
    });
  }, []);
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
  const createWithdrawAPI = dataAPI => {
    SVcheckCode({
      code: codeVerify,
      token: dataAPI?.token,
      id: data?.withdraw?._id || data?._id,
      email: currentUser.email,
      id_user: currentUser.id,
      dispatch,
      setLoading,
      navigation,
      setIsProcess,
      toast,
    });
  };
  const handleSubmit = async () => {
    setIsProcess(true);
    requestRefreshToken(
      currentUser,
      createWithdrawAPI,
      state,
      dispatch,
      setCurrentUser,
      toast,
      navigation,
    );
  };
  const cancelWithdrawAPI = dataAPI => {
    SVdeleteWithdraw({
      token: dataAPI?.token,
      id: data?.withdraw?._id || data?._id,
      email_user: currentUser?.email,
      id_user: currentUser?.id,
      setLoading,
      navigation,
      dispatch,
      toast,
      setIsProcessCancel,
    });
  };
  const handleCancel = () => {
    setIsProcessCancel(true);
    requestRefreshToken(
      currentUser,
      cancelWithdrawAPI,
      state,
      dispatch,
      setCurrentUser,
      toast,
      navigation,
    );
  };
  const resendCodeWithdrawAPI = dataAPI => {
    SVresendCode({
      token: dataAPI?.token,
      id: WRbyId?._id || data?._id,
      email: currentUser?.email,
      setLoading,
      navigation,
      toast,
    });
  };
  const handleResendCode = async () => {
    requestRefreshToken(
      currentUser,
      resendCodeWithdrawAPI,
      state,
      dispatch,
      setCurrentUser,
      toast,
      navigation,
    );
    setTimer(300);
  };
  const copyToClipboard = value => {
    Clipboard.setString(value);
    toast.show({
      title: 'Copied to clipboard success!',
      status: 'success',
      duration: 3000,
    });
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
          text={WRbyId?.status || data?.status}
          styleDesc={[
            stylesStatus.status,
            textLower(WRbyId?.status || data?.status) === 'onhold' ||
            textLower(WRbyId?.status || data?.status) === 'on hold'
              ? stylesStatus.vipbgc
              : textLower(WRbyId?.status || data?.status) === 'completed' ||
                textLower(WRbyId?.status || data?.status) === 'complete'
              ? stylesStatus.completebgc
              : textLower(WRbyId?.status || data?.status) === 'canceled' ||
                textLower(WRbyId?.status || data?.status) === 'cancel'
              ? stylesStatus.cancelbgc
              : textLower(WRbyId?.status || data?.status) === 'confirmed' ||
                textLower(WRbyId?.status || data?.status) === 'confirm'
              ? stylesStatus.confirmbgc
              : stylesStatus.demobgc,
          ]}
        />
        <RowDetail
          title="Created At"
          text={dateFormat(WRbyId?.createdAt || data?.createdAt, 'DD/MM/YYYY')}
        />
        <RowDetail
          title="Amount USD"
          text={formatUSDT(WRbyId?.amount || data?.amount)}
        />
        <RowDetail
          title="Amount VND"
          text={formatVND(WRbyId?.amount_vnd || data?.amount_vnd)}
        />
        <View style={[styles.info_item, stylesGeneral.flexRow]}>
          <Text style={[styles.info_item_text, stylesGeneral.text_black]}>
            Method
          </Text>
          <View style={[stylesGeneral.flexEnd]}>
            <Text style={[styles.info_item_desc, stylesGeneral.text_black]}>
              {userById?.payment?.bank?.method_name}
            </Text>
            <Text style={[styles.info_item_desc, stylesGeneral.text_black]}>
              {userById?.payment?.bank?.account_name}
            </Text>
            <Text style={[styles.info_item_desc, stylesGeneral.text_black]}>
              {userById?.payment?.bank?.number}
              {' | '}
              <Text
                style={[styles.text_copy, stylesStatus.confirm]}
                onPress={() =>
                  copyToClipboard(userById?.payment?.bank?.number)
                }>
                Copy
              </Text>
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
            onPress={() => handleCancel(WRbyId?._id)}>
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
