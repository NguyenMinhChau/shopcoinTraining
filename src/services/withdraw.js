/* eslint-disable prettier/prettier */
import {Alert} from 'react-native';
import {
  adminGet,
  userDelete,
  userGet,
  userPost,
} from '../utils/axios/axiosInstance';
import {routersMain} from '../routers/Main';
import {routers} from '../routers/Routers';
import {getAllWithdraws} from '../app/payloads/getAll';

// GET ALL WITHDRAW
export const SVgetAllWithdraw = async (props = {}) => {
  const resGet = await adminGet(
    `/getAllWithdraw?page=${props.page}&show=${props.show}`,
  );
  props.dispatch(props.getAllWithdraws(resGet));
};

// GET WITHDRAW BY EMAIL/ID USER
export const SVgetWithdrawByEmailUser = async (props = {}) => {
  const resGet = await userGet(`/getAllWithdraw/${props?.email}`);
  props.dispatch(props.getAllWithdraws(resGet?.data));
};

// CREATE WITHDRAW
export const SVcreateWithdraw = async (props = {}) => {
  const {
    amount,
    email,
    rateWithdraw,
    token,
    setLoading,
    setisProcess,
    navigation,
  } = props;
  try {
    const resPost = await userPost('/withdraw', {
      amountUsd: parseFloat(amount),
      user: email,
      rateWithdraw: rateWithdraw,
      token: token,
    });
    setLoading(true);
    setisProcess(false);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success!', 'Withdraw request was successfully!', [
        {
          text: 'OK',
          onPress: () =>
            navigation.navigate({
              name: routersMain.SingleWithdraw,
              params: {
                data: resPost?.data,
              },
            }),
        },
      ]);
    }, 3000);
  } catch (err) {
    setLoading(true);
    setisProcess(false);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Error!', 'Payment no field rateWithdraw. Result is NaN', [
        {
          text: 'OK',
          onPress: () => navigation.navigate(routersMain.CreateWithdraw),
        },
      ]);
    }, 3000);
  }
};

// CHECK CODE
export const SVcheckCode = async (props = {}) => {
  const {code, token, setLoading, setIsProcess, dispatch, navigation, id} =
    props;
  try {
    const resGet = await userGet(`/enterOTPWithdraw/${code}`, {
      code: code,
      token: token,
      headers: {
        token: token,
      },
    });
    setLoading(true);
    setIsProcess(false);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success!', resGet?.message, [
        {
          text: 'OK',
          onPress: async () => {
            const res = await userGet(`/getAllWithdraw/${props?.email}`);
            dispatch(getAllWithdraws(res?.data));
            navigation.navigate(routers.Withdraw);
          },
        },
      ]);
    }, 3000);
  } catch (err) {
    setLoading(true);
    setIsProcess(false);
    await userDelete(`/cancelWithdraw/${id}`);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Error!', err?.response?.data?.message, [
        {
          text: 'OK',
          onPress: () => navigation.navigate(routersMain.CreateWithdraw),
        },
      ]);
    }, 3000);
  }
};

// DELETE WITHDRAW
export const SVdeleteWithdraw = async (props = {}) => {
  const {id, setLoading, setIsProcessCancel, navigation} = props;
  try {
    await userDelete(`/cancelWithdraw/${id}`);
    setLoading(true);
    setIsProcessCancel(false);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate(routers.Withdraw);
    }, 3000);
  } catch (err) {
    setLoading(true);
    setIsProcessCancel(false);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Error!', err?.response?.data?.message, [
        {
          text: 'OK',
          onPress: () => {},
        },
      ]);
    }, 3000);
  }
};

// RESEND CODE
export const SVresendCode = async (props = {}) => {
  const {id, email, token, setLoading} = props;
  try {
    await userPost(`/resendOTPWithdraw/${id}`, {
      email: email,
      token: token,
      headers: {
        token: token,
      },
    });
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Success!',
        'Resend Code successfully. Please check your mail!',
        [
          {
            text: 'OK',
            onPress: () => {},
          },
        ],
      );
    }, 3000);
  } catch (err) {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Error!', err?.response?.data?.message, [
        {
          text: 'OK',
          onPress: () => {},
        },
      ]);
    }, 3000);
  }
};
