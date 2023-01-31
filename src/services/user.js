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

// GET USER BY ID
export const SVgetUserById = async (props = {}) => {
  const resGet = await adminGet(`/getUser/${props.id}`);
  props.dispatch(props.getUserById(resGet?.data));
  if (props.setBalance && props.currentUser && props.setCurrentUser) {
    props.setBalance(resGet?.data?.Wallet?.balance);
    setAsyncStore({
      ...props.currentUser,
      balance: resGet?.data?.Wallet?.balance,
    });
    props.dispatch(
      props.setCurrentUser({
        ...props.currentUser,
        balance: resGet?.data?.Wallet?.balance,
      }),
    );
  }
};

// CHANGE PASSWORD
export const SVchangePassword = async (props = {}) => {
  const resPut = await userPut(`/changePWD/${props.id}`, {
    oldPWD: props.oldPWD,
    newPWD: props.newPWD,
    token: props.token,
  });
  switch (resPut.code) {
    case 0:
      props.setLoading(true);
      props.setIsProcess(false);
      setTimeout(() => {
        props.setLoading(false);
        Alert.alert('Success!', 'Change password successfully!', [
          {
            text: 'OK',
            onPress: () => props.navigation.navigate(routersMain.Login),
          },
        ]);
      }, 3000);
      props.dispatch(
        props.setFormValue({
          password: '',
          oldPwd: '',
          confirmPwd: '',
        }),
      );
      await authPost('logout');
      removeAsyncStore();
      break;
    case 1:
    case 2:
      props.dispatch(props.setMessage({error: resPut.message}));
      props.setIsProcess(false);
      break;
    default:
      break;
  }
};
// FORGOT PASSWORD
export const SVforgotPwd = async (props = {}) => {
  const resPost = await userPost('/forgotPassword', {
    email: props.email,
  });
  switch (resPost.code) {
    case 0:
      props.setLoading(true);
      setTimeout(() => {
        props.setLoading(false);
        props.setIsProcess(false);
        Alert.alert('Success!', 'Please check email with new password!', [
          {
            text: 'OK',
            onPress: () => props.navigation.navigate(routersMain.ResetPwd),
          },
        ]);
      }, 3000);
      props.dispatch(props.getTokenForgotPwd(resPost?.data));
      props.dispatch(
        props.setFormValue({
          email: '',
        }),
      );
      break;
    case 1:
    case 2:
      props.dispatch(
        props.setMessage({
          success: '',
          error: resPost.message,
        }),
      );
      props.setIsProcess(false);
      props.dispatch(
        props.setFormValue({
          email: '',
        }),
      );
      break;
    default:
      break;
  }
};
// UPLOAD DOCUMENT
export const SVuploadDocument = async (props = {}) => {
  const object = {
    imagePersonNationalityFont: props?.imageForm[0],
    imagePersonNationalityBeside: props?.imageForm[1],
    imageLicenseFont: props?.imageForm[2],
    imageLicenseBeside: props?.imageForm[3],
  };
  const resPut = await userPut(
    `/additionImages/${props.id}`,
    {
      ...object,
    },
    {
      headers: {
        // 'Content-Type': 'multipart/form-data',
        token: props?.token,
      },
    },
  );
  // console.log(resPut);
  switch (resPut.code) {
    case 0:
      props.setLoading(true);
      props.setIsProcess(false);
      setTimeout(() => {
        props.setLoading(false);
        Alert.alert('Success!', 'Upload document successfully!', [
          {
            text: 'OK',
            onPress: () => props.navigation.navigate(routers.Profile),
          },
        ]);
      }, 3000);
      break;
    case 1:
    case 2:
    case 3:
    case 4:
      props.setLoading(true);
      props.setIsProcess(false);
      setTimeout(() => {
        props.setLoading(false);
        Alert.alert(
          'Error!',
          resPut?.message + '. If you edit you have to re-upload four pictures',
          [
            {
              text: 'OK',
              onPress: () =>
                props.navigation.navigate(routersMain.UploadDoument),
            },
          ],
        );
      }, 3000);
      break;
    default:
      break;
  }
};
// RESET PASSWORD
export const SVresetPassword = async (props = {}) => {
  const resPut = await userPut(`/getOTP/${props.token}`, {
    otp: props?.otp,
    pwd: props?.pwd,
  });
  switch (resPut.code) {
    case 0:
      props.setLoading(true);
      props.setIsProcess(false);
      setTimeout(() => {
        props.setLoading(false);
        Alert.alert('Success!', 'Change password successfully!', [
          {
            text: 'OK',
            onPress: () => props.navigation.navigate(routersMain.Login),
          },
        ]);
      }, 3000);
      break;
    case 1:
    case 2:
      props.setLoading(true);
      props.setIsProcess(false);
      setTimeout(() => {
        props.setLoading(false);
        Alert.alert('Error!', resPut?.message, [
          {
            text: 'OK',
            onPress: () => props.navigation.navigate(routersMain.ResetPwd),
          },
        ]);
      }, 3000);
      break;
    default:
      break;
  }
};
