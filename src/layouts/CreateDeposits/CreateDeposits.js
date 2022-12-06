/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
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
  getUserById,
  getPaymentAdminById,
  getRateDepositWithdraw,
} from '../../app/payloads/getById';
import {SVgetUserById} from '../../services/user';
import {
  SVgetAllPaymentAdmin,
  SVgetPaymentAdminById,
} from '../../services/payment';
import {getAllPaymentAdmin} from '../../app/payloads/getAll';
import {SVgetRateDepositWithdraw} from '../../services/rate';

export default function CreateDeposits({navigation}) {
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
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    SVgetUserById({
      id: currentUser?.id,
      dispatch,
      getUserById,
    });
    SVgetAllPaymentAdmin({
      dispatch,
      getAllPaymentAdmin,
    });
    SVgetRateDepositWithdraw({
      // numberBank: userById?.payment?.bank?.account,
      dispatch,
      getRateDepositWithdraw,
    });
  }, []);
  useEffect(() => {
    if (bank) {
      SVgetPaymentAdminById({
        id: bank?.id,
        dispatch,
        getPaymentAdminById,
      });
    }
  }, [bank]);
  const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };
  const onRefresh = useCallback(() => {
    setRefreshing(true);
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
      name: item?.methodName,
      user: item?.accountName,
      accountNumber: item?.accountNumber,
    });
    return acc;
  }, []);
  // const rateDeposit = paymentAdminById ? paymentAdminById?.rateDeposit : 0;
  const createDepositsAPI = data => {
    SVcreateDeposits({
      amount: amountUSDT,
      email: currentUser.email,
      amountVnd: parseFloat(amountUSDT * rateDepositWithdraw?.rateDeposit),
      token: data?.token,
      bankAdmin: paymentAdminById,
      setLoading,
      dispatch,
      navigation,
      setFormDeposits,
    });
  };
  const handleSubmit = async () => {
    try {
      requestRefreshToken(
        currentUser,
        createDepositsAPI,
        state,
        dispatch,
        setCurrentUser,
        setMessage,
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
        // keyboardType="number-pad"
        onChangeText={val => handleChange('amountUSDT', val)}
      />
      <SelectAlert
        label="Choose Payment Method"
        onTouchStart={handleModalBank}
        value={bank?.name}
      />
      {amountUSDT && bank && amountUSDT * rateDepositWithdraw?.rateDeposit > 0 && (
        <View style={[styles.deposits_VND]}>
          <Text
            style={[
              styles.deposits_money,
              stylesGeneral.fwbold,
              stylesStatus.confirm,
            ]}>
            Deposits (VND):{' '}
            {formatVND(amountUSDT * rateDepositWithdraw?.rateDeposit)}
          </Text>
        </View>
      )}
      <TouchableOpacity
        disabled={!amountUSDT || !bank || (amountUSDT && !Number(amountUSDT))}
        activeOpacity={0.6}
        style={[
          styles.btn_submit,
          (!amountUSDT || !bank || (amountUSDT && !Number(amountUSDT))) &&
            stylesGeneral.op6,
          stylesStatus.confirmbgcbold,
        ]}
        onPress={handleSubmit}>
        <Text style={[stylesStatus.white, stylesGeneral.fwbold]}>Submit</Text>
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
