/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {
  FormInput,
  ModalBank,
  ModalLoading,
  SelectAlert,
} from '../../components';
import {useAppContext} from '../../utils';
import {setCurrentUser} from '../../app/payloads/user';
import {setMessage} from '../../app/payloads/message';
import requestRefreshToken from '../../utils/axios/refreshToken';
import styles from './ProfilePaymentCss';
import stylesGeneral from '../../styles/General';
import stylesStatus from '../../styles/Status';
import {setFormProfilePayment} from '../../app/payloads/form';
import {addBankInfo} from '../../services/payment';
import dataBank from '../../utils/dataBank';
import {useToast} from 'native-base';

export default function ProfilePayment({navigation}) {
  const toast = useToast();
  const {state, dispatch} = useAppContext();
  const {
    currentUser,
    profilePayment: {bank, accountName, accountNumber},
  } = state;
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isProcess, setIsProcess] = useState(false);
  useEffect(() => {
    dispatch(
      setFormProfilePayment({
        bank: null,
        accountName: '',
        accountNumber: '',
      }),
    );
  }, []);
  const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    dispatch(
      setFormProfilePayment({
        bank: null,
        accountName: '',
        accountNumber: '',
      }),
    );
    wait(2000).then(() => setRefreshing(false));
  }, []);
  const handleModalBank = () => {
    setModalVisible(!modalVisible);
  };
  const handleChange = (name, val) => {
    dispatch(setFormProfilePayment({[name]: val}));
    setModalVisible(false);
  };
  const addBankInfoAPI = data => {
    addBankInfo({
      id: currentUser?.id,
      bank: bank?.name,
      accountName,
      accountNumber,
      token: data?.token,
      setLoading,
      navigation,
      toast,
      setIsProcess,
    });
  };
  const handleSubmit = async () => {
    setIsProcess(true);
    requestRefreshToken(
      currentUser,
      addBankInfoAPI,
      state,
      dispatch,
      setCurrentUser,
      toast,
      navigation,
    );
  };
  return (
    <ScrollView
      style={[styles.container]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <Text style={[styles.title, stylesGeneral.text_black]}>Payment</Text>
      <Text style={[styles.desc, stylesGeneral.text_black]}>
        Support the following pyayment methods to load or withdraw funds.
      </Text>
      <SelectAlert
        label="Choose bank"
        onTouchStart={handleModalBank}
        value={bank?.name}
      />
      <FormInput
        label="Account name"
        placeholder="Enter account name"
        onChangeText={val => handleChange('accountName', val)}
      />
      <FormInput
        label="Account number"
        keyboardType="number-pad"
        placeholder="Enter account number"
        onChangeText={val => handleChange('accountNumber', val)}
      />
      <TouchableOpacity
        style={[
          styles.btn,
          (!bank || !accountName || !accountNumber || isProcess) &&
            stylesGeneral.op6,
          stylesStatus.confirmbgcbold,
        ]}
        onPress={handleSubmit}
        disabled={!bank || !accountName || !accountNumber || isProcess}>
        <Text style={[styles.btn_text, stylesStatus.white]}>
          {isProcess ? <ActivityIndicator color="white" /> : 'Submit'}
        </Text>
      </TouchableOpacity>
      <ModalBank
        modalVisible={modalVisible}
        handleModalBank={handleModalBank}
        handleChange={handleChange}
        dataBank={dataBank}
      />
      {loading && <ModalLoading />}
    </ScrollView>
  );
}
