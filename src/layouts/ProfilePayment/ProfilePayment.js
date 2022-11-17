/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
import {Text, ScrollView, RefreshControl, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
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

export default function ProfilePayment({navigation}) {
  const {state, dispatch} = useAppContext();
  const {
    currentUser,
    profilePayment: {bank, accountName, accountNumber},
  } = state;
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
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
      bank,
      accountName,
      accountNumber,
      token: data?.token,
      setLoading,
      navigation,
    });
  };
  const handleSubmit = async () => {
    try {
      requestRefreshToken(
        currentUser,
        addBankInfoAPI,
        state,
        dispatch,
        setCurrentUser,
        setMessage,
      );
    } catch (err) {
      console.log(err);
    }
  };
  const dataBank = [
    {
      id: 1,
      name: 'Vietcombank',
    },
    {
      id: 2,
      name: 'Techcombank',
    },
    {
      id: 3,
      name: 'BIDV',
    },
    {
      id: 4,
      name: 'Vietinbank',
    },
    {
      id: 5,
      name: 'Agribank',
    },
  ];
  return (
    <ScrollView
      style={[styles.container]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <Text style={[styles.title]}>Payment</Text>
      <Text style={[styles.desc]}>
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
          (!bank || !accountName || !accountNumber) && stylesGeneral.op6,
          stylesStatus.confirmbgcbold,
        ]}
        onPress={handleSubmit}
        disabled={!bank || !accountName || !accountNumber}>
        <Text style={[styles.btn_text, stylesStatus.white]}>Submit</Text>
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
