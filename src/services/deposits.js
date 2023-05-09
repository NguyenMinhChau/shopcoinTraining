/* eslint-disable prettier/prettier */
import {Alert} from 'react-native';
import {
  adminGet,
  userGet,
  userPost,
  userPut,
} from '../utils/axios/axiosInstance';
import {routersMain} from '../routers/Main';
import {routers} from '../routers/Routers';
import {setFormDeposits} from '../app/payloads/form';
import {getAllDeposits} from '../app/payloads/getAll';

// GET ALL DEPOSITS
export const SVgetAllDeposits = async (props = {}) => {
  const resGet = await adminGet(
    `/getAllDeposit?page=${props.page}&show=${props.show}`,
  );
  props.dispatch(props.getAllDeposits(resGet));
};

// GET DEPOSITS BY EMAIL/ID USER
export const SVgetDepositsByEmailUser = async (props = {}) => {
  const resGet = await userGet(`/getAllDeposits/${props?.email}`);
  props.dispatch(props.getAllDeposits(resGet?.data));
};

// CREATE DEPOSITS
export const SVcreateDeposits = async (props = {}) => {
  const {
    amount,
    email,
    amountVnd,
    bankAdmin,
    rateDeposit,
    token,
    setLoading,
    setIsProcess,
    navigation,
    dispatch,
  } = props;
  try {
    const resPost = await userPost('/deposit', {
      amount: amount,
      user: email,
      amountVnd: amountVnd,
      bankAdmin: bankAdmin,
      rateDeposit: rateDeposit,
      token: token,
    });
    setLoading(true);
    setIsProcess(false);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success!', 'Deposits request was successfully!', [
        {
          text: 'OK',
          onPress: () =>
            navigation.navigate({
              name: routersMain.SingleDeposits,
              params: {
                data: resPost?.data,
                bankAdmin: props?.bankAdmin,
              },
            }),
        },
      ]);
      dispatch(
        setFormDeposits({
          amountUSDT: '',
          bank: '',
        }),
      );
    }, 3000);
  } catch (err) {
    setLoading(true);
    setIsProcess(false);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Error!',
        'You have no payment yet. Please update your payment before making a deposit',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate(routersMain.ProfilePayment);
            },
          },
        ],
      );
    }, 3000);
  }
};
// UPDATE DEPOSITS
export const SVupdateDeposits = async (props = {}) => {
  const {
    image,
    id,
    bankAdmin,
    token,
    setLoading,
    setIsProcess,
    dispatch,
    navigation,
    email,
  } = props;
  const object = {
    imageDeposit: image,
  };
  try {
    const resPut = await userPut(
      `/additionImageDeposit/${id}`,
      {
        ...object,
        bankAdmin: bankAdmin,
      },
      {
        headers: {
          // 'Content-Type': 'multipart/form-data',
          token: token,
        },
      },
    );
    setLoading(true);
    setIsProcess(false);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success!', resPut?.message, [
        {
          text: 'OK',
          onPress: async () => {
            navigation.navigate({
              name: routers.Deposits,
              params: {
                data: resPut?.data,
              },
            });
            const resGet = await userGet(`/getAllDeposits/${email}`);
            dispatch(getAllDeposits(resGet?.data));
          },
        },
      ]);
    }, 3000);
  } catch (err) {
    setLoading(true);
    setIsProcess(false);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Erroe!', err?.response?.data?.message, [
        {
          text: 'OK',
          onPress: () => {},
        },
      ]);
    }, 3000);
  }
};
