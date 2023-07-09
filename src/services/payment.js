/* eslint-disable prettier/prettier */
import {Alert} from 'react-native';
import {adminGet, adminPost, userPut} from '../utils/axios/axiosInstance';
import {routersMain} from '../routers/Main';
import {toastShow} from '../utils/toast';
import {getAllPaymentAdmin} from '../app/payloads/getAll';
import {routers} from '../routers/Routers';

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
    toast,
  } = props;
  try {
    await userPut(`payment/${id}`, {
      bankName: bank,
      name: accountName,
      account: accountNumber,
      token: token,
    });
    setLoading(true);
    setIsProcess(false);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success!', 'Your payment has been updated!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate(routers.Profile),
        },
      ]);
    }, 1000);
  } catch (err) {
    console.log(err);
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
    }, 1000);
  }
};
// GET ALL PAYMENT ADMIN
export const SVgetAllPaymentAdmin = async (props = {}) => {
  const {dispatch, toast} = props;
  try {
    const resGet = await adminPost('payment/admin', {});
    dispatch(getAllPaymentAdmin(resGet.metadata));
  } catch (err) {
    toastShow(toast, err?.response?.data?.message || 'Something error!');
  }
};
// GET PAYMENT ADMIN BY ID
export const SVgetPaymentAdminById = async (props = {}) => {
  const resGet = await adminGet(`/getPayment/${props?.id}`);
  props.dispatch(props.getPaymentAdminById(resGet.data));
};
