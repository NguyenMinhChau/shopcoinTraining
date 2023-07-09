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
import {toastShow} from '../utils/toast';

// GET ALL WITHDRAW
export const SVgetAllWithdraw = async (props = {}) => {
  const resGet = await adminGet(
    `/getAllWithdraw?page=${props.page}&show=${props.show}`,
  );
  props.dispatch(props.getAllWithdraws(resGet));
};

// GET WITHDRAW BY EMAIL/ID USER
export const SVgetWithdrawByEmailUser = async (props = {}) => {
  const {email_user, id_user, toast, dispatch, token} = props;
  try {
    const resGet = await userGet(`withdraws/${id_user}`, {
      headers: {token: token},
    });
    dispatch(getAllWithdraws(resGet?.metadata));
  } catch (err) {
    toastShow(toast, err?.response?.data?.message || 'Something error!');
  }
};
// GET WITHDRAW BY ID
export const SVgetWithdrawByID = async (props = {}) => {
  const {id_wr, toast, setWRbyId} = props;
  try {
    const resGet = await adminGet(`withdraw/${id_wr}`, {});
    setWRbyId(resGet?.metadata);
  } catch (err) {
    toastShow(toast, err?.response?.data?.message || 'Something error!');
  }
};

// CREATE WITHDRAW
export const SVcreateWithdraw = async (props = {}) => {
  const {
    id_user,
    amount,
    email,
    method,
    setLoading,
    dispatch,
    navigation,
    toast,
    token,
    setFormWithdraw,
    setisProcess,
  } = props;
  try {
    const resPost = await userPost(`withdraw/${id_user}`, {
      amount: parseFloat(amount),
      method: id_user,
      token: token,
      headers: {token: token},
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
                data: resPost?.metadata,
              },
            }),
        },
      ]);
    }, 1000);
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
    }, 1000);
  }
};

// CHECK CODE
export const SVcheckCode = async (props = {}) => {
  const {
    code,
    token,
    id,
    email,
    id_user,
    dispatch,
    setLoading,
    navigation,
    setIsProcess,
    toast,
  } = props;
  try {
    const resGet = await userPost(`withdraw/otp/${code}/${id}`, {
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
            const res = await userGet(`withdraws/${id_user}`);
            dispatch(getAllWithdraws(res?.metadata));
            navigation.navigate(routers.Withdraw);
          },
        },
      ]);
    }, 1000);
  } catch (err) {
    setLoading(true);
    setIsProcess(false);
    // await userGet(`withdraw/${id}`);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Error!',
        err?.response?.data?.message || 'OTP code is valid!',
        [
          {
            text: 'OK',
            onPress: () => {},
          },
        ],
      );
    }, 1000);
  }
};

// DELETE WITHDRAW
export const SVdeleteWithdraw = async (props = {}) => {
  const {
    token,
    id,
    email_user,
    id_user,
    setLoading,
    navigation,
    toast,
    dispatch,
    setIsProcessCancel,
  } = props;
  try {
    const resGet = await userGet(
      `withdraw/${id}`,
      {
        token: token,
        headers: {token: token},
      },
      {headers: {token: token}},
    );
    setLoading(true);
    setIsProcessCancel(false);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate(routers.Withdraw);
    }, 1000);
    toastShow(
      toast,
      resGet?.metadata || resGet?.message || 'Delete withdraw successfully!',
    );
    const res = await userGet(`withdraws/${id_user}`);
    dispatch(getAllWithdraws(res?.metadata));
  } catch (err) {
    console.log(err);
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
    }, 1000);
  }
};

// RESEND CODE
export const SVresendCode = async (props = {}) => {
  const {token, id, email, setLoading, navigation, toast} = props;
  try {
    const resPost = await userPost(`withdraw/resetCode/${id}`, {
      email: email,
      token: token,
      headers: {
        token: token,
      },
    });
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
    }, 1000);
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
    }, 1000);
  }
};
