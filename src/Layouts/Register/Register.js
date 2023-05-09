import React, { useState, useEffect } from 'react';
import className from 'classnames/bind';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../utils';
import { Form } from '../../components';
import styles from './Register.module.css';
import { RegisterSV } from '../../services/authen';

const cx = className.bind(styles);

function Register() {
	const { state, dispatch } = useAppContext();
	const { email, password, username } = state.set.form;
	const [isProcess, setIsProcess] = useState(false);
	const [snackbar, setSnackbar] = useState({
		open: false,
		type: '',
		message: '',
	});
	const history = useNavigate();
	useEffect(() => {
		document.title = `Register | ${process.env.REACT_APP_TITLE_WEB}`;
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
	const handleRegister = (e) => {
		e.preventDefault();
		setIsProcess(true);
		RegisterSV({
			username,
			email,
			password,
			setIsProcess,
			setSnackbar,
			dispatch,
			history,
		});
	};
	const onEnter = (e) => {
		handleRegister(e);
	};
	return (
		<Form
			titleForm="Register account"
			textBtn="Register"
			onClick={handleRegister}
			bolUsername
			bolEmail
			bolPassword
			registerForm
			className={cx('form-page-login')}
			isProcess={isProcess}
			disabled={!username || !email || !password}
			onEnter={onEnter}
			handleCloseSnackbar={handleCloseSnackbar}
			openSnackbar={snackbar.open}
			typeSnackbar={snackbar.type}
			messageSnackbar={snackbar.message}
		/>
	);
}

export default Register;
