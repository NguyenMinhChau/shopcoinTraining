import { actions } from '../app/';
import routers from '../routers/routers';
import { axiosUtils, localStoreUtils } from '../utils';

export const LoginSV = async (props = {}) => {
	const { email, password, setIsProcess, setSnackbar, dispatch, history } =
		props;
	try {
		const res = await axiosUtils.authPost('login', {
			email,
			password,
		});
		setIsProcess(false);
		await localStoreUtils.setStore({
			username: res.metadata.user.payment.username,
			rule: res.metadata.user.payment.rule,
			email: res.metadata.user.payment.email,
			createdAt: res.metadata.user.createAt,
			token: res.metadata.accessToken,
			id: res.metadata.user._id,
		});
		dispatch(
			actions.setData({
				currentUser: localStoreUtils.getStore(),
				form: {
					username: '',
					email: '',
					password: '',
				},
			}),
		);
		history(
			res.metadata.user.payment.rule === 'user'
				? routers.homeUser
				: routers.dashboard,
		);
	} catch (err) {
		setIsProcess(false);
		setSnackbar({
			open: true,
			message: err?.response?.data?.message || 'Something error!',
			type: 'error',
		});
	}
};
export const RegisterSV = async (props = {}) => {
	const {
		username,
		email,
		password,
		setIsProcess,
		setSnackbar,
		dispatch,
		history,
	} = props;
	try {
		const res = await axiosUtils.authPost('register', {
			username,
			email,
			password,
		});
		setIsProcess(false);
		alert(res?.message || 'Create successfully');
		dispatch(
			actions.setData({
				form: {
					username: '',
					email: '',
					password: '',
				},
			}),
		);
		history(`${routers.login}`);
	} catch (err) {
		setIsProcess(false);
		setSnackbar({
			open: true,
			message: err?.response?.data?.message || 'Something error',
			type: 'error',
		});
	}
};
export const LogoutSV = async (props = {}) => {
	const { id, dispatch, history, setSnackbar } = props;
	try {
		await axiosUtils.authPost(`logout/${id}`);
		await localStoreUtils.removeStore();
		dispatch(
			actions.setData({
				currentUser: null,
				accountMenu: null,
			}),
		);
		history(`${routers.login}`);
	} catch (err) {
		setSnackbar({
			open: true,
			message: err?.response?.data?.message || 'Something error!',
			type: 'error',
		});
	}
};
export const ForgotPasswordSV = async (props = {}) => {
	const { email, setIsProcess, setSnackbar, dispatch, history } = props;
	try {
		const res = await axiosUtils.userGet(`forgot/password/${email}`, {});
		alert(res?.message || 'Send OTP successfully');
		setIsProcess(false);
		dispatch(
			actions.setData({
				form: {
					username: '',
					email: '',
					password: '',
				},
			}),
		);
		history(routers.resetPwdUser);
	} catch (err) {
		setIsProcess(false);
		setSnackbar({
			open: true,
			message: err?.response?.data?.message || 'Something error!',
			type: 'error',
		});
	}
};
export const ForgotPasswordOTP = async (props = {}) => {
	const { otpCode, dispatch, history, setIsProcess, setSnackbar } = props;
	try {
		setIsProcess(true);
		const res = await axiosUtils.userPost(`forgot/password/${otpCode}`, {});
		alert(
			res?.message ||
				'Reset password successfully, please check your email new password!',
		);
		dispatch(
			actions.setData({
				form: {
					username: '',
					email: '',
					password: '',
				},
			}),
		);
		history(routers.login);
	} catch (err) {
		setIsProcess(false);
		setSnackbar({
			open: true,
			message: err?.response?.data?.message || 'Something error!',
			type: 'error',
		});
	}
};
