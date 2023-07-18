import jwt_decode from 'jwt-decode';
import { localStoreUtils, axiosUtils } from '../../utils';
import routers from '../../routers/routers';

const requestRefreshToken = async (
	currentUser,
	handleFunc,
	state,
	dispatch,
	actions,
	id,
) => {
	try {
		const accessToken = currentUser?.token;
		if (accessToken) {
			const decodedToken = await jwt_decode(accessToken);
			// const date = new Date();
			const currentTimeInSeconds = Math.floor(Date.now() / 1000);
			if (decodedToken.exp < currentTimeInSeconds) {
				const res = await axiosUtils.refreshToken(
					`refreshToken/${currentUser?.id}`,
				);
				const refreshUser = {
					...currentUser,
					token: res.metadata.toString(),
				};
				await localStoreUtils.setStore(refreshUser);
				dispatch(
					actions.setData({
						currentUser: localStoreUtils.getStore(),
					}),
				);
				currentUser.token = `${res.metadata}`;
				handleFunc(refreshUser, id ? id : '');
				return refreshUser;
			} else {
				handleFunc(currentUser, id ? id : '');
				return currentUser;
			}
		}
	} catch (err) {
		alert('Refresh token has expired, please login again');
		await localStoreUtils.setStore(null);
		window.location.href = routers.login;
	}
};
export default requestRefreshToken;
