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
import {toastShow} from '../utils/toast';

// GET ALL DEPOSITS
export const SVgetAllDeposits = async (props = {}) => {
  const resGet = await adminGet(
    `/getAllDeposit?page=${props.page}&show=${props.show}`,
  );
  props.dispatch(props.getAllDeposits(resGet));
};

// GET DEPOSITS BY EMAIL/ID USER
export const SVgetDepositsByEmailUser = async (props = {}) => {
  const {email_user, dispatch, toast} = props;
  try {
    const resGet = await userGet(`deposit/${email_user}`);
    dispatch(getAllDeposits(resGet?.metadata));
  } catch (err) {
    toastShow(toast, err?.response?.data?.message || 'Something error!');
  }
};
// GET DEPOSITS BY ID
export const SVgetDepositsById = async (props = {}) => {
  const {id_dp, toast, setDPbyID} = props;
  try {
    const resGet = await adminGet(`deposit/${id_dp}`);
    setDPbyID(resGet?.metadata);
  } catch (err) {
    toastShow(toast, err?.response?.data?.message || 'Something error!');
  }
};

// CREATE DEPOSITS
export const SVcreateDeposits = async (props = {}) => {
  const {
    id_payment_admin,
    id_user,
    bankAdmin,
    amount,
    token,
    rateDeposit,
    setLoading,
    dispatch,
    toast,
    navigation,
    setFormDeposits,
    setIsProcess,
  } = props;
  try {
    const resPost = await userPost(`deposit/${id_user}`, {
      amount: amount,
      method: id_payment_admin,
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
                data: resPost?.metadata,
                bankAdmin: bankAdmin,
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
    }, 1000);
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
    }, 1000);
  }
};
// UPDATE DEPOSITS
export const SVupdateDeposits = async (props = {}) => {
  const {
    id,
    token,
    image,
    dispatch,
    getAllDeposits,
    setLoading,
    navigation,
    setIsProcess,
    toast,
    email_user,
  } = props;
  const object = {
    fileName: image?.fileName,
    imageBase64: image?.image,
  };
  try {
    const resPut = await userPut(
      `deposit/image/${id}`,
      {
        ...object,
      },
      {
        headers: {
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
                data: resPut?.metadata,
              },
            });
            const resGet = await userGet(`deposit/${email_user}`);
            dispatch(getAllDeposits(resGet?.metadata));
          },
        },
      ]);
    }, 1000);
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
    }, 1000);
  }
};
