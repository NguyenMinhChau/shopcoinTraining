import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import className from 'classnames/bind';
import { Form } from '../../components';
import { useAppContext } from '../../utils';
import styles from './ForgotPwd.module.css';
import { ForgotPasswordSV } from '../../services/authen';

const cx = className.bind(styles);

function ForgotPwd() {
	const { state, dispatch } = useAppContext();
	const { email } = state.set.form;
	const [isProcess, setIsProcess] = useState(false);
	const [snackbar, setSnackbar] = useState({
		open: false,
		type: '',
		message: '',
	});
	const history = useNavigate();
	useEffect(() => {
		document.title = `Forgot Password | ${process.env.REACT_APP_TITLE_WEB}`;
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
	const handleForgot = (e) => {
		e.preventDefault();
		setIsProcess(true);
		ForgotPasswordSV({
			email,
			setIsProcess,
			setSnackbar,
			dispatch,
			history,
		});
	};
	const onEnter = (e) => {
		handleForgot(e);
	};

	return (
		<Form
			titleForm="Forgot Password"
			textBtn="Send email"
			onClick={handleForgot}
			bolEmail
			forgotPwdForm
			isProcess={isProcess}
			disabled={!email}
			className={cx('form-page-login')}
			onEnter={onEnter}
			handleCloseSnackbar={handleCloseSnackbar}
			openSnackbar={snackbar.open}
			typeSnackbar={snackbar.type}
			messageSnackbar={snackbar.message}
		/>
	);
}

export default ForgotPwd;
