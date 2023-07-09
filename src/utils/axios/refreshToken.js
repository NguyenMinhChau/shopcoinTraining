/* eslint-disable prettier/prettier */
import jwt_decode from 'jwt-decode';
import {Alert} from 'react-native';
import {refreshToken} from '../../utils/axios/axiosInstance';
import {getAsyncStore, setAsyncStore} from '../localStore/localStore';
import {toastShow} from '../toast';
import {userLogout} from '../../services/userAuthen';
import {routersMain} from '../../routers/Main';

const requestRefreshToken = async (
  currentUser,
  handleFunc,
  state,
  dispatch,
  setCurrentUser,
  toast,
  navigation,
  id,
) => {
  try {
    const accessToken = currentUser?.token;
    if (accessToken) {
      const decodedToken = await jwt_decode(accessToken);
      const date = new Date();
      if (decodedToken.exp < date.getTime() / 1000) {
        const res = await refreshToken(`refreshToken/${currentUser?.id}`);
        if (res.status !== 200) {
          await setAsyncStore(null);
          Alert.alert(
            'Invalid token',
            'Refresh token has expired, please login again',
            [
              {
                text: 'OK',
                onPress: () => {
                  userLogout({navigation, toast, id_user: currentUser?.id});
                },
              },
            ],
          );
        } else {
          const refreshUser = {
            ...currentUser,
            token: res.metadata.toString(),
          };
          await setAsyncStore(refreshUser);
          dispatch(
            setCurrentUser({
              ...state.set,
              currentUser: getAsyncStore(dispatch),
            }),
          );
          currentUser.token = `${res.metadata}`;
          handleFunc(refreshUser, id ? id : '');
          return refreshUser;
        }
      } else {
        handleFunc(currentUser, id ? id : '');
        return currentUser;
      }
    }
  } catch (err) {
    toastShow(
      toast,
      err?.response?.data?.message || 'Refresh token is vali, Login again!',
    );
    userLogout({navigation, toast, id_user: currentUser?.id});
  }
};
export default requestRefreshToken;
