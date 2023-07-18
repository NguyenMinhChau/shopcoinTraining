/* eslint-disable prettier/prettier */
import {authPost} from '../utils/axios/axiosInstance';
import {
  setAsyncStore,
  removeAsyncStore,
  getAsyncStore,
} from '../utils/localStore/localStore';
import {routersMain} from '../routers/Main';
import {setFormValue} from '../app/payloads/form';
import {setMessage} from '../app/payloads/message';
import {toastShow} from '../utils/toast';
import {routers} from '../routers/Routers';

// USER LOGIN
export const userLogin = async (props = {}) => {
  const {email, password, dispatch, setIsProcess, toast, navigation} = props;
  try {
    const resPost = await authPost('login', {
      email: email,
      password: password,
    });
    await setAsyncStore({
      token: resPost?.metadata?.accessToken,
      username: resPost?.metadata?.user?.payment?.username,
      email: resPost?.metadata?.user?.payment?.email,
      rule: resPost?.metadata?.user?.payment.rule,
      rank: resPost?.metadata?.user?.rank,
      id: resPost?.metadata?.user?._id,
      balance: resPost?.metadata?.user?.Wallet?.balance,
    });
    await getAsyncStore(dispatch);
    dispatch(
      setFormValue({
        username: '',
        email: '',
        password: '',
      }),
    );
    setIsProcess(false);
    navigation.navigate(routersMain.MainPage);
    toastShow(toast, resPost?.message || 'Login successfully!');
  } catch (err) {
    console.log(err);
    toastShow(toast, err?.response?.data?.message || 'Something error!');
    setIsProcess(false);
  }
};
// USER LOGOUT
export const userLogout = async (props = {}) => {
  const {toast, navigation, id_user, dispatch} = props;
  try {
    const resPost = await authPost(`logout/${id_user}`);
    await removeAsyncStore();
    await getAsyncStore(dispatch);
    navigation.navigate(routersMain.Login);
    toastShow(toast, resPost?.message || 'Logout successfully!');
  } catch (err) {
    toastShow(toast, err?.response?.data?.message || 'Something error!');
  }
};
// USER REGISTER
export const userRegister = async (props = {}) => {
  const {
    username,
    email,
    password,
    toast,
    dispatch,
    setIsProcess,
    state,
    navigation,
  } = props;
  try {
    const resPost = await authPost('register', {
      username: username,
      email: email,
      password: password,
    });
    dispatch(
      setFormValue({
        username: '',
        email: '',
        password: '',
      }),
    );
    dispatch(
      setMessage({
        ...state.message,
        error: '',
      }),
    );
    setIsProcess(false);
    toastShow(toast, resPost?.message || 'Register successfully!');
    navigation.navigate(routersMain.Login);
  } catch (err) {
    setIsProcess(false);
    toastShow(toast, err?.response?.data?.message || 'Something error!');
  }
};
