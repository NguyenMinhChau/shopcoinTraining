/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useState } from 'react';
import className from 'classnames/bind';
import moment from 'moment';
import styles from './ProfileUser.module.css';
import { Button, Icons, Modal, SnackbarCp } from '../../components';
import {
	axiosUtils,
	dataBank,
	numberUtils,
	refreshPage,
	requestRefreshToken,
	searchUtils,
	textUtils,
	useAppContext,
} from '../../utils';
import { actions } from '../../app/';
import ChangePwdUser from '../ChangePwdUser/ChangePwdUser';
import ProfilePaymentUser from '../ProfilePaymentUser/ProfilePaymentUser';
import UploadDocumentUser from '../UploadDocumentUser/UploadDocumentUser';
import { searchBankAdminUser } from '../../services/coins';
import {
	changeBankSelect,
	changePassword,
	createProfilePayment,
	uploadDocument,
} from '../../services/users';

const cx = className.bind(styles);

export default function ProfileUser() {
	const { state, dispatch } = useAppContext();
	const {
		currentUser,
		bankValue,
		searchValues: { bank },
	} = state.set;
	const [user, setUser] = useState(null);
	const [isProcess, setIsProcess] = useState(false);
	const [stateModalBank, setStateModalBank] = useState(false);
	const [stateModalUpload, setStateModalUpload] = useState(false);
	const [stateModalChangePwd, setStateModalChangePwd] = useState(false);
	const [stateModalProfilePayment, setStateModalProfilePayment] =
		useState(false);
	const [uploadCCCDFont, setUploadCCCDFont] = useState(null);
	const [uploadCCCDBeside, setUploadCCCDBeside] = useState(null);
	const [uploadLicenseFont, setUploadLicenseFont] = useState(null);
	const [uploadLicenseBeside, setUploadLicenseBeside] = useState(null);
	const [formChangePwd, setFormChangePwd] = useState({
		currentPwd: '',
		newPwd: '',
		confirmPwd: '',
	});
	const [formProfilePayment, setFormProfilePayment] = useState({
		accountName: '',
		accountNumber: '',
	});
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
	const getUser = async () => {
		const process = await axiosUtils.adminGet(`user/${currentUser?.id}`);
		setUser(process.metadata);
	};
	useEffect(() => {
		getUser();
	}, []);
	const openModalChangePwd = useCallback((e) => {
		e.stopPropagation();
		setStateModalChangePwd(true);
	}, []);
	const closeModalChangePwd = useCallback((e) => {
		e.stopPropagation();
		setFormChangePwd({
			currentPwd: '',
			newPwd: '',
			confirmPwd: '',
		});
		setStateModalChangePwd(false);
	}, []);
	const openModalProfilePayment = useCallback((e) => {
		e.stopPropagation();
		setStateModalProfilePayment(true);
	}, []);
	const closeModalProfilePayment = useCallback((e) => {
		e.stopPropagation();
		setStateModalProfilePayment(false);
		setFormProfilePayment({
			accountName: '',
			accountNumber: '',
		});
	}, []);
	const openModalUpload = useCallback((e) => {
		e.stopPropagation();
		setStateModalUpload(true);
	}, []);
	const closeModalUpload = useCallback((e) => {
		e.stopPropagation();
		setStateModalUpload(false);
		setUploadCCCDFont(null);
		setUploadCCCDBeside(null);
		setUploadLicenseFont(null);
		setUploadLicenseBeside(null);
	}, []);
	const toogleModalBank = useCallback(
		(e) => {
			e.stopPropagation();
			setStateModalBank(!stateModalBank);
		},
		[stateModalBank],
	);
	const searchSelect = (e) => {
		return searchUtils.logicSearch(e, dispatch, state, actions);
	};
	const handleChangeBank = (bankValue) => {
		changeBankSelect({
			bankValue: bankValue,
			setStateModalProfilePayment,
			dispatch,
			state,
			actions,
		});
		setStateModalBank(false);
	};
	const handleChangeUploadCCCDFont = useCallback(
		(e) => {
			const { files } = e.target;
			setUploadCCCDFont({
				url: URL.createObjectURL(files[0]),
				file: files[0],
			});
		},
		[uploadCCCDFont],
	);
	const handleChangeUploadCCCDBeside = useCallback(
		(e) => {
			const { files } = e.target;
			setUploadCCCDBeside({
				url: URL.createObjectURL(files[0]),
				file: files[0],
			});
		},
		[uploadCCCDBeside],
	);
	const handleChangeUploadLicenseFont = useCallback(
		(e) => {
			const { files } = e.target;
			setUploadLicenseFont({
				url: URL.createObjectURL(files[0]),
				file: files[0],
			});
		},
		[uploadLicenseFont],
	);
	const handleChangeUploadLicenseBeside = useCallback(
		(e) => {
			const { files } = e.target;
			setUploadLicenseBeside({
				url: URL.createObjectURL(files[0]),
				file: files[0],
			});
		},
		[uploadLicenseBeside],
	);
	const uploadDocumentAPI = (data) => {
		uploadDocument({
			token: data?.token,
			cccdFont: uploadCCCDFont?.file,
			cccdBeside: uploadCCCDBeside?.file,
			licenseFont: uploadLicenseFont?.file,
			licenseBeside: uploadLicenseBeside?.file,
			dispatch,
			setIsProcess,
			setStateModalUpload,
			setSnackbar,
			id: currentUser?.id,
		});
	};
	const handleSubmitFormUpload = useCallback(async (e) => {
		setIsProcess(true);
		requestRefreshToken(
			currentUser,
			uploadDocumentAPI,
			state,
			dispatch,
			actions,
			currentUser?.id,
		);
	});
	const handleChangeFormPwd = useCallback(
		(e) => {
			const { name, value } = e.target;
			setFormChangePwd({ ...formChangePwd, [name]: value });
		},
		[formChangePwd],
	);
	const handleChangeFormProfilePayment = useCallback(
		(e) => {
			const { name, value } = e.target;
			setFormProfilePayment({ ...formProfilePayment, [name]: value });
		},
		[formProfilePayment],
	);
	const changePwdAPI = (data) => {
		changePassword({
			id: currentUser?.id,
			oldPWD: formChangePwd?.currentPwd,
			newPWD: formChangePwd?.newPwd,
			token: data?.token,
			dispatch,
			setIsProcess,
			setStateModalChangePwd,
			setSnackbar,
		});
	};
	const handleSubmitFormPwd = useCallback(
		(e) => {
			if (
				// !formChangePwd.currentPwd ||
				!formChangePwd.confirmPwd ||
				!formChangePwd.newPwd
			) {
				alert('Please fill all fields');
			} else if (formChangePwd.newPwd !== formChangePwd.confirmPwd) {
				alert('Password confirm not match with new password');
			} else {
				setIsProcess(true);
				requestRefreshToken(
					currentUser,
					changePwdAPI,
					state,
					dispatch,
					actions,
					currentUser?.id,
				);
			}
		},
		[formChangePwd],
	);
	const addBankInfoAPI = (data) => {
		createProfilePayment({
			id: currentUser?.id,
			bank: bankValue,
			accountName: formProfilePayment?.accountName,
			accountNumber: formProfilePayment?.accountNumber,
			token: data?.token,
			dispatch,
			actions,
			setIsProcess,
			setSnackbar,
			setStateModalProfilePayment,
		});
	};
	const handleSubmitFormProfilePayment = useCallback(
		(e) => {
			setIsProcess(true);
			requestRefreshToken(
				currentUser,
				addBankInfoAPI,
				state,
				dispatch,
				actions,
				currentUser?.id,
			);
		},
		[formProfilePayment, bankValue],
	);
	const dataBankFlag = searchBankAdminUser({
		bank,
		data: dataBank,
	});
	return (
		<>
			<Button
				className="confirmbgc mb8"
				onClick={refreshPage.refreshPage}
			>
				<div className="flex-center">
					<Icons.RefreshIcon className="fz12 mr8" />
					<span className={`${cx('general-button-text')}`}>
						Refresh Page
					</span>
				</div>
			</Button>
			{/* <AlertCp /> */}
			<SnackbarCp
				openSnackbar={snackbar.open}
				handleCloseSnackbar={handleCloseSnackbar}
				messageSnackbar={snackbar.message}
				typeSnackbar={snackbar.type}
			/>
			<div className={`${cx('info-container')}`}>
				<div className={`${cx('detail-container')}`}>
					<div className={`${cx('info-detail')}`}>
						<div className={`${cx('detail-item')}`}>
							<div className={`${cx('item-title')}`}>Rank</div>
							<div className={`${cx('item-desc')}`}>
								<span
									className={`fwb ${user?.rank.toLowerCase()}`}
								>
									{textUtils.FirstUpc(user?.rank) || '---'}
								</span>
							</div>
						</div>
						<div className={`${cx('detail-item')}`}>
							<div className={`${cx('item-title')}`}>
								Username
							</div>
							<div className={`${cx('item-desc')}`}>
								{user?.payment?.username || '---'}
							</div>
						</div>
						<div className={`${cx('detail-item')}`}>
							<div className={`${cx('item-title')}`}>Email</div>
							<div className={`${cx('item-desc')}`}>
								{user?.payment?.email || '---'}
							</div>
						</div>
						<div className={`${cx('detail-item')}`}>
							<div className={`${cx('item-title')}`}>
								Your wallet
							</div>
							<div className={`${cx('item-desc')} cancel`}>
								{numberUtils.coinUSD(user?.Wallet?.balance) ||
									'---'}
							</div>
						</div>
						<div className={`${cx('detail-item')}`}>
							<div className={`${cx('item-title')}`}>
								Created At
							</div>
							<div className={`${cx('item-desc')}`}>
								{moment(user?.createdAt).format(
									'DD/MM/YYYY HH:mm:ss',
								) || '---'}
							</div>
						</div>
					</div>
				</div>
				<div className={`${cx('detail-container')}`}>
					<div className={`${cx('info-detail', 'btn-container')}`}>
						<Button
							className="confirmbgc w100"
							onClick={openModalUpload}
						>
							Upload Document
						</Button>
						<Button
							className="completebgc w100 ml0 mt8"
							onClick={openModalChangePwd}
						>
							Change Password
						</Button>
						<Button
							className="vipbgc w100 ml0 mt8"
							onClick={openModalProfilePayment}
						>
							Profile Payment
						</Button>
					</div>
				</div>
			</div>
			{stateModalUpload && (
				<Modal
					titleHeader="Upload Document"
					actionButtonText="Upload"
					classNameButton="vipbgc"
					openModal={openModalUpload}
					closeModal={closeModalUpload}
					onClick={handleSubmitFormUpload}
					isProcess={isProcess}
				>
					<UploadDocumentUser
						user={user}
						uploadCCCDFont="uploadCCCDFont"
						urlUploadCCCDFont={uploadCCCDFont?.url}
						uploadCCCDBeside="uploadCCCDBeside"
						urlUploadCCCDBeside={uploadCCCDBeside?.url}
						uploadLicenseFont="uploadLicenseFont"
						urlUploadLicenseFont={uploadLicenseFont?.url}
						uploadLicenseBeside="uploadLicenseBeside"
						urlUploadLicenseBeside={uploadLicenseBeside?.url}
						onChangeUploadCCCDFont={handleChangeUploadCCCDFont}
						onChangeUploadCCCDBeside={handleChangeUploadCCCDBeside}
						onChangeUploadLicenseFont={
							handleChangeUploadLicenseFont
						}
						onChangeUploadLicenseBeside={
							handleChangeUploadLicenseBeside
						}
					/>
				</Modal>
			)}
			{stateModalChangePwd && (
				<Modal
					titleHeader="Change Password"
					actionButtonText="Change"
					classNameButton="vipbgc"
					openModal={openModalChangePwd}
					closeModal={closeModalChangePwd}
					onClick={handleSubmitFormPwd}
					isProcess={isProcess}
					disabled={
						// !formChangePwd.currentPwd ||
						!formChangePwd.newPwd || !formChangePwd.confirmPwd
					}
				>
					<ChangePwdUser
						onChange={handleChangeFormPwd}
						nameCr="currentPwd"
						nameNew="newPwd"
						nameConfirm="confirmPwd"
					/>
				</Modal>
			)}
			{stateModalProfilePayment && (
				<Modal
					titleHeader="Profile Payment"
					actionButtonText="Submit"
					classNameButton="vipbgc"
					openModal={openModalProfilePayment}
					closeModal={closeModalProfilePayment}
					isProcess={isProcess}
					onClick={handleSubmitFormProfilePayment}
					disabled={
						!formProfilePayment.accountName ||
						!formProfilePayment.accountNumber ||
						!bankValue
					}
				>
					<ProfilePaymentUser
						toogleModalBank={toogleModalBank}
						stateModalBank={stateModalBank}
						bankValue={bankValue}
						dataBankFlag={dataBankFlag}
						searchSelect={searchSelect}
						handleChangeBank={handleChangeBank}
						nameAcc="accountName"
						nameNum="accountNumber"
						user={user}
						onChange={handleChangeFormProfilePayment}
					/>
				</Modal>
			)}
		</>
	);
}
