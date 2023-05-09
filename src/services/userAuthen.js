/* eslint-disable prettier/prettier */
import {authPost} from '../utils/axios/axiosInstance';
import {setAsyncStore, removeAsyncStore} from '../utils/localStore/localStore';
import {routersMain} from '../routers/Main';
import {setFormValue} from '../app/payloads/form';
import {setMessage} from '../app/payloads/message';

// USER LOGIN
export const userLogin = async (props = {}) => {
  const {email, password, dispatch, setIsProcess, redirect, state} = props;
  try {
    const resPost = await authPost('login', {
      email: email,
      password: password,
    });
    await setAsyncStore({
      token: resPost?.token,
      username: resPost?.userInfo?.payment?.username,
      email: resPost?.userInfo?.payment?.email,
      rule: resPost?.userInfo?.payment.rule,
      rank: resPost?.userInfo?.rank,
      id: resPost?.userInfo?._id,
      balance: resPost?.userInfo?.Wallet?.balance,
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
    redirect();
  } catch (err) {
    dispatch(
      setMessage({
        ...state.message,
        error: err?.response?.data?.message,
      }),
    );
    setIsProcess(false);
  }
};
// USER LOGOUT
export const userLogout = async (props = {}) => {
  await removeAsyncStore();
  await authPost('logout');
};
// USER REGISTER
export const userRegister = async (props = {}) => {
  const {username, email, password, dispatch, setIsProcess, state, navigation} =
    props;
  try {
    await authPost('register', {
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
    navigation.navigate(routersMain.Login);
  } catch (err) {
    dispatch(
      setMessage({
        ...state.message,
        error: err?.response?.data?.message,
      }),
    );
    setIsProcess(false);
  }
};
