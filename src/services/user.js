/* eslint-disable prettier/prettier */
import {Alert} from 'react-native';
import {
  adminGet,
  authPost,
  userGet,
  userPost,
  userPut,
} from '../utils/axios/axiosInstance';
import {removeAsyncStore, setAsyncStore} from '../utils/localStore/localStore';
import {routersMain} from '../routers/Main';
import {routers} from '../routers/Routers';
import {getUserById} from '../app/payloads/getById';
import {setFormValue} from '../app/payloads/form';
import {setMessage} from '../app/payloads/message';
import {getTokenForgotPwd} from '../app/payloads/getToken';
import {toastShow} from '../utils/toast';

// GET USER BY ID
export const SVgetUserById = async (props = {}) => {
  const {id, dispatch, setBalance, currentUser, setCurrentUser, toast} = props;
  try {
    const resGet = await adminGet(`user/${id}`);
    dispatch(getUserById(resGet?.metadata));
    if (setBalance && currentUser && setCurrentUser) {
      setBalance(resGet?.metadata?.Wallet?.balance);
      setAsyncStore({
        ...currentUser,
        balance: resGet?.metadata?.Wallet?.balance,
        rank: resGet?.metadata?.rank,
      });
      dispatch(
        setCurrentUser({
          ...currentUser,
          balance: resGet?.metadata?.Wallet?.balance,
          rank: resGet?.metadata?.rank,
        }),
      );
    }
  } catch (err) {
    console.log('Get user by id: ', err);
    toastShow(toast, err?.response?.data?.messge || 'Something error!');
  }
};

// CHANGE PASSWORD
export const SVchangePassword = async (props = {}) => {
  const {
    id,
    oldPWD,
    newPWD,
    token,
    setLoading,
    setIsProcess,
    navigation,
    dispatch,
    toast,
    setFormValue,
  } = props;
  try {
    const resPut = await userPut(`password/${id}`, {
      password: newPWD,
      oldPassword: oldPWD,
      token: token,
    });
    setLoading(true);
    setIsProcess(false);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success!', 'Change password successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate(routersMain.Login),
        },
      ]);
    }, 1000);
    dispatch(
      setFormValue({
        password: '',
        oldPwd: '',
        confirmPwd: '',
      }),
    );
    await authPost(`logout/${id}`);
    removeAsyncStore();
  } catch (err) {
    toastShow(toast, err?.response?.data?.message || 'Something error!');
    setIsProcess(false);
  }
};
// FORGOT PASSWORD
export const SVforgotPwd = async (props = {}) => {
  const {email, setLoading, setIsProcess, navigation, toast, dispatch} = props;
  try {
    const resGet = await userGet(`forgot/password/${email}`, {});
    setLoading(true);
    dispatch(
      setFormValue({
        email: '',
      }),
    );
    toastShow(
      toast,
      resGet?.message || 'Sent mail which has otp code for forgot password!',
    );
    navigation.navigate(routersMain.ResetPwd);
  } catch (err) {
    setIsProcess(false);
    toastShow(toast, err?.response?.data?.message || 'Something error!');
    dispatch(
      setFormValue({
        email: '',
      }),
    );
  }
};
// UPLOAD DOCUMENT
export const SVuploadDocument = async (props = {}) => {
  const {imageForm, id, token, setLoading, setIsProcess, navigation} = props;
  const object = {
    image1: {name: imageForm[0].fileName, base64: imageForm[0].image},
    image2: {name: imageForm[1].fileName, base64: imageForm[1].image},
    image3: {name: imageForm[2].fileName, base64: imageForm[2].image},
    image4: {name: imageForm[3].fileName, base64: imageForm[3].image},
  };
  try {
    await userPut(
      `image/${id}`,
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
      Alert.alert('Success!', 'Upload document successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate(routers.Profile),
        },
      ]);
    }, 1000);
  } catch (err) {
    setLoading(true);
    setIsProcess(false);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Error!',
        err?.response?.data?.message +
          '. If you edit you have to re-upload four pictures',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate(routersMain.UploadDoument),
          },
        ],
      );
    }, 1000);
  }
};
// RESET PASSWORD
export const SVresetPassword = async (props = {}) => {
  const {token, otp, pwd, setLoading, setIsProcess, toast, navigation} = props;
  try {
    const resPost = await userPost(`/forgot/password/${otp}`, {});
    setLoading(true);
    setIsProcess(false);
    toastShow(
      toast,
      resPost?.message || 'Change password successfully, please check email!',
    );
    navigation.navigate(routersMain.Login);
  } catch (err) {
    setLoading(true);
    setIsProcess(false);
    toastShow(toast, err?.response?.data?.message || 'Somrthing error!');
  }
};
