/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {
  FormInput,
  ModalBank,
  ModalLoading,
  SelectAlert,
} from '../../components';
import {useAppContext} from '../../utils';
import {formatVND} from '../../utils/format/Money';
import {setFormDeposits} from '../../app/payloads/form';
import {setCurrentUser} from '../../app/payloads/user';
import {setMessage} from '../../app/payloads/message';
import requestRefreshToken from '../../utils/axios/refreshToken';
import styles from './CreateDepositsCss';
import stylesGeneral from '../../styles/General';
import stylesStatus from '../../styles/Status';
import {SVcreateDeposits} from '../../services/deposits';
import {
  getPaymentAdminById,
  getRateDepositWithdraw,
} from '../../app/payloads/getById';
import {
  SVgetAllPaymentAdmin,
  SVgetPaymentAdminById,
} from '../../services/payment';
import {getAllPaymentAdmin} from '../../app/payloads/getAll';
import {SVgetRateDepositWithdraw} from '../../services/rate';
import {useToast} from 'native-base';

export default function CreateDeposits({navigation}) {
  const toast = useToast();
  const {state, dispatch} = useAppContext();
  const {
    currentUser,
    dataPaymentAdmin,
    paymentAdminById,
    rateDepositWithdraw,
    deposits: {amountUSDT, bank},
  } = state;
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isProcess, setIsProcess] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const getAllPA = dataToken => {
    SVgetAllPaymentAdmin({
      dispatch,
      toast,
      token: dataToken?.token,
    });
  };
  useEffect(() => {
    requestRefreshToken(
      currentUser,
      getAllPA,
      state,
      dispatch,
      setCurrentUser,
      toast,
      navigation,
    );
    SVgetAllPaymentAdmin({
      toast,
      dispatch,
    });
    dispatch(
      setFormDeposits({
        amountUSDT: '',
        bank: null,
      }),
    );
  }, []);
  useEffect(() => {
    SVgetRateDepositWithdraw({
      dispatch,
      toast,
    });
  }, [amountUSDT]);
  const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(
      setFormDeposits({
        amountUSDT: '',
        bank: null,
      }),
    );
    wait(2000).then(() => setRefreshing(false));
  }, []);
  const handleModalBank = () => {
    setModalVisible(!modalVisible);
  };
  const handleChange = (name, val) => {
    dispatch(setFormDeposits({[name]: val}));
    setModalVisible(false);
  };
  const dataBank = dataPaymentAdmin?.reduce((acc, item) => {
    acc.push({
      id: item?._id,
      name: item?.method_name,
      user: item?.account_name,
      accountNumber: item?.number,
    });
    return acc;
  }, []);
  const createDepositsAPI = data => {
    SVcreateDeposits({
      id_payment_admin: bank?.id,
      id_user: currentUser?.id,
      bankAdmin: bank,
      amount: amountUSDT,
      token: data?.token,
      rateDeposit: rateDepositWithdraw[0]?.rate_deposit,
      setLoading,
      dispatch,
      toast,
      navigation,
      setFormDeposits,
      setIsProcess,
    });
  };
  const handleSubmit = async () => {
    try {
      await 1;
      setIsProcess(true);
      requestRefreshToken(
        currentUser,
        createDepositsAPI,
        state,
        dispatch,
        setCurrentUser,
        toast,
        navigation,
      );
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <ScrollView
      style={[styles.container]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <Text style={[styles.title, stylesGeneral.text_black]}>
        Create Deposits
      </Text>
      <FormInput
        label="Amount USD"
        placeholder="0.00"
        onChangeText={val => handleChange('amountUSDT', val)}
      />
      <SelectAlert
        label="Choose Payment Method"
        onTouchStart={handleModalBank}
        value={bank?.name || 'Please choose method'}
      />
      {amountUSDT &&
        bank &&
        amountUSDT * rateDepositWithdraw[0]?.rate_deposit > 0 && (
          <View style={[styles.deposits_VND]}>
            <Text
              style={[
                styles.deposits_money,
                stylesGeneral.fwbold,
                stylesStatus.confirm,
              ]}>
              Deposits (VND):{' '}
              {formatVND(amountUSDT * rateDepositWithdraw[0]?.rate_deposit)}
            </Text>
          </View>
        )}
      <TouchableOpacity
        disabled={
          !amountUSDT ||
          isProcess ||
          !bank ||
          (amountUSDT && !Number(amountUSDT))
        }
        activeOpacity={0.6}
        style={[
          styles.btn_submit,
          (!amountUSDT ||
            isProcess ||
            !bank ||
            (amountUSDT && !Number(amountUSDT))) &&
            stylesGeneral.op6,
          stylesStatus.confirmbgcbold,
        ]}
        onPress={handleSubmit}>
        <Text style={[stylesStatus.white, stylesGeneral.fwbold]}>
          {isProcess ? <ActivityIndicator color="white" /> : 'Submit'}
        </Text>
      </TouchableOpacity>
      <ModalBank
        modalVisible={modalVisible}
        handleModalBank={handleModalBank}
        handleChange={handleChange}
        dataBank={dataBank ? dataBank : []}
      />
      {loading && <ModalLoading />}
    </ScrollView>
  );
}
