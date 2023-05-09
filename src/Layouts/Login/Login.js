import React, { useState, useEffect } from 'react';
import className from 'classnames/bind';
import { Link, useNavigate } from 'react-router-dom';
import { Form } from '../../components';
import { useAppContext } from '../../utils';
import routers from '../../routers/routers';
import styles from './Login.module.css';
import { LoginSV } from '../../services/authen';

const cx = className.bind(styles);

function Login() {
	const { state, dispatch } = useAppContext();
	const { email, password } = state.set.form;
	const [isProcess, setIsProcess] = useState(false);
	const [snackbar, setSnackbar] = useState({
		open: false,
		type: '',
		message: '',
	});
	const history = useNavigate();
	useEffect(() => {
		document.title = `Login | ${process.env.REACT_APP_TITLE_WEB}`;
	}, []);
	const handleCloseSnackbar = (event, reason) => {
		if (reason === 'clickaway') {
			return;
		}
		setSnackbar({
			...snackbar,
			open: false,
		});
	};
	const handleLogin = (e) => {
		e.preventDefault();
		setIsProcess(true);
		LoginSV({
			email,
			password,
			setIsProcess,
			setSnackbar,
			dispatch,
			history,
		});
	};
	const onEnter = (e) => {
		handleLogin(e);
	};
	return (
		<Form
			titleForm="Log in your account"
			textBtn="Log in"
			onClick={handleLogin}
			bolEmail
			bolPassword
			loginForm
			className={cx('form-page-login')}
			isProcess={isProcess}
			disabled={!email || !password}
			onEnter={onEnter}
			handleCloseSnackbar={handleCloseSnackbar}
			openSnackbar={snackbar.open}
			typeSnackbar={snackbar.type}
			messageSnackbar={snackbar.message}
		>
			<Link
				to={routers.forgotPwd}
				className={`${cx('login-forgotpwd-link')}`}
			>
				Forgot your password?
			</Link>
		</Form>
	);
}

export default Login;
