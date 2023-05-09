/* eslint-disable prettier/prettier */
import {Alert} from 'react-native';
import {adminGet, userPut} from '../utils/axios/axiosInstance';
import {routersMain} from '../routers/Main';

// ADD BANK INFO
export const addBankInfo = async (props = {}) => {
  const {
    id,
    bank,
    accountName,
    accountNumber,
    token,
    setLoading,
    setIsProcess,
    navigation,
  } = props;
  try {
    await userPut(`/additionBankInfo/${id}`, {
      bankName: bank,
      nameAccount: accountName,
      accountNumber: accountNumber,
      token: token,
    });
    setLoading(true);
    setIsProcess(false);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success!', 'Your payment has been updated!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate(routersMain.CreateWithdraw),
        },
      ]);
    }, 3000);
  } catch (err) {
    setLoading(true);
    setIsProcess(false);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Error!',
        `${err?.response?.data?.message}. This account number already exists`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate(routersMain.ProfilePayment),
          },
        ],
      );
    }, 3000);
  }
};
// GET ALL PAYMENT ADMIN
export const SVgetAllPaymentAdmin = async (props = {}) => {
  const resGet = await adminGet('/getAllPaymentAdmin', {});
  props.dispatch(props.getAllPaymentAdmin(resGet.data));
};
// GET PAYMENT ADMIN BY ID
export const SVgetPaymentAdminById = async (props = {}) => {
  const resGet = await adminGet(`/getPayment/${props?.id}`);
  props.dispatch(props.getPaymentAdminById(resGet.data));
};
