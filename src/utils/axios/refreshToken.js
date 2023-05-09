/* eslint-disable prettier/prettier */
import jwt_decode from 'jwt-decode';
import {Alert} from 'react-native';
import {refreshToken} from '../../utils/axios/axiosInstance';
import {getAsyncStore, setAsyncStore} from '../localStore/localStore';

const requestRefreshToken = async (
  currentUser,
  handleFunc,
  state,
  dispatch,
  setCurrentUser,
  setMessage,
  id,
) => {
  try {
    const accessToken = currentUser?.token;
    if (accessToken) {
      const decodedToken = await jwt_decode(accessToken);
      const date = new Date();
      if (decodedToken.exp < date.getTime() / 1000) {
        const res = await refreshToken(`refreshToken/${currentUser?.id}`);
        if (res === 'No jwt' || res === 'Invalid token') {
          await setAsyncStore(null);
          Alert.alert(
            'Invalid token',
            'Refresh token has expired, please login again',
            [
              {
                text: 'OK',
                onPress: () => {},
              },
            ],
          );
        } else if (res.code === 0) {
          const refreshUser = {
            ...currentUser,
            token: res.newtoken.toString(),
          };
          await setAsyncStore(refreshUser);
          dispatch(
            setCurrentUser({
              ...state.set,
              currentUser: getAsyncStore(dispatch),
            }),
          );
          currentUser.token = `${res.newtoken}`;
          handleFunc(refreshUser, id ? id : '');
          return refreshUser;
        } else {
          await setAsyncStore(null);
          Alert.alert(
            'Invalid token',
            'RefreshToken not found - Please login again',
            [
              {
                text: 'OK',
                onPress: () => {},
              },
            ],
          );
        }
      } else {
        handleFunc(currentUser, id ? id : '');
        return currentUser;
      }
    }
  } catch (err) {
    console.log(err);
  }
};
export default requestRefreshToken;
