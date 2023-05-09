/* eslint-disable prettier/prettier */
import {Alert} from 'react-native';
import {
  adminGet,
  authPost,
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

// GET USER BY ID
export const SVgetUserById = async (props = {}) => {
  const {id, dispatch, setBalance, currentUser, setCurrentUser} = props;
  const resGet = await adminGet(`/getUser/${id}`);
  dispatch(getUserById(resGet?.data));
  if (setBalance && currentUser && setCurrentUser) {
    setBalance(resGet?.data?.Wallet?.balance);
    setAsyncStore({
      ...currentUser,
      balance: resGet?.data?.Wallet?.balance,
    });
    dispatch(
      setCurrentUser({
        ...currentUser,
        balance: resGet?.data?.Wallet?.balance,
      }),
    );
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
  } = props;
  try {
    await userPut(`/changePWD/${id}`, {
      oldPWD: oldPWD,
      newPWD: newPWD,
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
    }, 3000);
    dispatch(
      setFormValue({
        password: '',
        oldPwd: '',
        confirmPwd: '',
      }),
    );
    await authPost('logout');
    removeAsyncStore();
  } catch (err) {
    dispatch(setMessage({error: err?.response?.data?.message}));
    setIsProcess(false);
  }
};
// FORGOT PASSWORD
export const SVforgotPwd = async (props = {}) => {
  const {email, setLoading, setIsProcess, navigation, dispatch} = props;
  try {
    const resPost = await userPost('/forgotPassword', {
      email: email,
    });
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsProcess(false);
      Alert.alert('Success!', 'Please check email with new password!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate(routersMain.ResetPwd),
        },
      ]);
    }, 3000);
    dispatch(getTokenForgotPwd(resPost?.data));
    dispatch(
      setFormValue({
        email: '',
      }),
    );
  } catch (err) {
    dispatch(
      setMessage({
        success: '',
        error: err?.response?.data?.message,
      }),
    );
    setIsProcess(false);
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
    imagePersonNationalityFont: imageForm[0],
    imagePersonNationalityBeside: imageForm[1],
    imageLicenseFont: imageForm[2],
    imageLicenseBeside: imageForm[3],
  };
  try {
    await userPut(
      `/additionImages/${id}`,
      {
        ...object,
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
      Alert.alert('Success!', 'Upload document successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate(routers.Profile),
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
        err?.response?.data?.message +
          '. If you edit you have to re-upload four pictures',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate(routersMain.UploadDoument),
          },
        ],
      );
    }, 3000);
  }
};
// RESET PASSWORD
export const SVresetPassword = async (props = {}) => {
  const {token, otp, pwd, setLoading, setIsProcess, navigation} = props;
  try {
    await userPut(`/getOTP/${token}`, {
      otp: otp,
      pwd: pwd,
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
    }, 3000);
  } catch (err) {
    setLoading(true);
    setIsProcess(false);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Error!', err?.response?.data?.message, [
        {
          text: 'OK',
          onPress: () => navigation.navigate(routersMain.ResetPwd),
        },
      ]);
    }, 3000);
  }
};
