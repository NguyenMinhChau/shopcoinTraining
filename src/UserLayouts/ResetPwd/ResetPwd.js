import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import className from 'classnames/bind';
import { Form } from '../../components';
import styles from './ResetPwd.module.css';
import { axiosUtils, useAppContext } from '../../utils';
import routers from '../../routers/routers';
import { actions } from '../../app/';
import { ForgotPasswordOTP } from '../../services/authen';

const cx = className.bind(styles);

export default function ResetPwd() {
	const { state, dispatch } = useAppContext();
	const { otpCode } = state.set.form;
	const [isProcess, setIsProcess] = useState(false);
	const [snackbar, setSnackbar] = useState({
		open: false,
		type: '',
		message: '',
	});
	const handleCloseSnackbar = (event, reason) => {
		if (reason === 'clickaway') {
			return;
		}
		setSnackbar({
			...snackbar,
			open: false,
		});
	};
	const history = useNavigate();
	useEffect(() => {
		document.title = `Reset Password | ${process.env.REACT_APP_TITLE_WEB}`;
	}, []);
	const handleReset = (e) => {
		e.preventDefault();
		setIsProcess(true);
		ForgotPasswordOTP({
			otpCode,
			dispatch,
			history,
			setIsProcess,
			setSnackbar,
		});
	};
	const onEnter = (e) => {
		handleReset(e);
	};
	return (
		<Form
			titleForm="Reset Password"
			textBtn="Submit"
			onClick={handleReset}
			bolOtpCode
			resetPwdForm
			className={cx('form-page-login')}
			isProcess={isProcess}
			disabled={!otpCode}
			onEnter={onEnter}
			handleCloseSnackbar={handleCloseSnackbar}
			openSnackbar={snackbar.open}
			typeSnackbar={snackbar.type}
			messageSnackbar={snackbar.message}
		></Form>
	);
}
