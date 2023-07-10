/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import className from 'classnames/bind';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import {
	FormInput,
	Button,
	Icons,
	Modal,
	Image,
	SelectValue,
	ModalViewImage,
	SnackbarCp,
} from '../../components';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import {
	handleUpdateRankFeeUser,
	getUserById,
	changeCoinGifts,
	searchCoinGift,
	updateCoinGift,
	changePasswordUser,
	refreshPasswordUser,
	blockUser,
	unblockUser,
	blockAndUnblockUser,
} from '../../services/users';
import {
	useAppContext,
	requestRefreshToken,
	textUtils,
	deleteUtils,
	formUtils,
	searchUtils,
	refreshPage,
	axiosUtils,
	numberUtils,
} from '../../utils';
import { actions } from '../../app/';
import styles from './UserDetail.module.css';

const cx = className.bind(styles);

function UserDetail() {
	const { idUser } = useParams();
	const { state, dispatch } = useAppContext();
	const {
		edit,
		currentUser,
		pagination: { page, show },
		form: { password },
		searchValues: { coin },
		data: { dataSettingCoin },
		changeCoin,
		quantityCoin,
	} = state.set;
	const { modalDelete, selectStatus } = state.toggle;
	const [isProcessFee, setIsProcessFee] = useState(false);
	const [isModalImage, setIsModalImage] = useState(false);
	const [indexImage, setIndexImage] = useState(0);
	const [isProcessCoin, setIsProcessCoin] = useState(false);
	const [isProcessChangePwd, setIsProcessChangePwd] = useState(false);
	const [isProcessBlockUser, setIsProcessBlockUser] = useState(false);
	const [isProcessRefreshPwd, setIsProcessRefreshPwd] = useState(false);
	const [feeValue, setFeeValue] = useState(
		edit?.itemData && edit.itemData.fee,
	);
	const [dataCoin, setDataCoin] = useState([]);
	const [snackbar, setSnackbar] = useState({
		open: false,
		type: '',
		message: '',
	});
	const x = edit?.itemData;
	const getAllCoin = async () => {
		const res = await axiosUtils.adminGet(
			`coins/paging?page=${page}&show=${dataCoin?.total || 10}`,
		);
		setDataCoin(res.metadata);
	};
	useEffect(() => {
		document.title = `Detail | ${process.env.REACT_APP_TITLE_WEB}`;
		getUserById({ idUser, dispatch, state, setSnackbar });
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
	useEffect(() => {
		getAllCoin();
	}, [page, show]);
	const changeFee = (e) => {
		setFeeValue(e.target.value);
	};
	const changeQuantity = (e) => {
		dispatch(
			actions.setData({
				quantityCoin: e.target.value,
			}),
		);
	};
	const handleChangeCoin = (coin) => {
		changeCoinGifts({ coin, selectStatus, dispatch, state });
	};
	const toggleListCoin = () => {
		dispatch(
			actions.toggleModal({
				selectStatus: !selectStatus,
			}),
		);
		dispatch(
			actions.setData({
				pagination: {
					...state.set.pagination,
					page: 1,
					show: dataCoin?.total,
				},
			}),
		);
	};
	const changeInput = (e) => {
		return formUtils.changeForm(e, dispatch, state, actions);
	};
	const searchSelect = (e) => {
		return searchUtils.logicSearch(e, dispatch, state, actions);
	};
	const modalChangePwdTrue = (e, id) => {
		return deleteUtils.deleteTrue(e, id, dispatch, state, actions);
	};
	const modalChangePwdFalse = (e) => {
		return deleteUtils.deleteFalse(e, dispatch, state, actions);
	};
	const DATA_IMAGE_MODAL = [
		x?.uploadCCCDFont?.replace('uploads/', ''),
		x?.uploadCCCDBeside?.replace('uploads/', ''),
		x?.uploadLicenseFont?.replace('uploads/', ''),
		x?.uploadLicenseBeside?.replace('uploads/', ''),
	];
	const modalImageTrue = (e) => {
		e.stopPropagation();
		setIsModalImage(true);
	};
	const modalImageFalse = (e) => {
		e.stopPropagation();
		setIsModalImage(false);
		setIndexImage(0);
	};
	const handleUpdateFee = (data, id) => {
		handleUpdateRankFeeUser({
			data,
			id,
			dispatch,
			state,
			page,
			show,
			fee: parseFloat(feeValue),
			setIsProcessFee,
			setFeeValue,
			setSnackbar,
		});
	};
	const updateFee = (id) => {
		setIsProcessFee(true);
		requestRefreshToken(
			currentUser,
			handleUpdateFee,
			state,
			dispatch,
			actions,
			id,
		);
	};
	const handleUpdateCoin = (data, id) => {
		updateCoinGift({
			token: data?.token,
			id,
			changeCoin,
			quantityCoin,
			date: new Date(),
			createBy: currentUser?.email,
			dispatch,
			state,
			setIsProcessCoin,
			setSnackbar,
			setSnackbar,
		});
	};
	const updateCoin = (id) => {
		setIsProcessCoin(true);
		requestRefreshToken(
			currentUser,
			handleUpdateCoin,
			state,
			dispatch,
			actions,
			id,
		);
	};
	const handleChangePwd = (data, id) => {
		changePasswordUser({
			data,
			id,
			dispatch,
			state,
			password,
			setSnackbar,
			setIsProcessChangePwd,
		});
	};
	const changePwd = (id) => {
		setIsProcessChangePwd(true);
		requestRefreshToken(
			currentUser,
			handleChangePwd,
			state,
			dispatch,
			actions,
			id,
		);
	};
	const handleRefreshPwd = (data, id) => {
		refreshPasswordUser({
			data,
			id,
			dispatch,
			state,
			setIsProcessRefreshPwd,
			setSnackbar,
		});
	};
	const refreshPwd = async (id) => {
		setIsProcessRefreshPwd(true);
		requestRefreshToken(
			currentUser,
			handleRefreshPwd,
			state,
			dispatch,
			actions,
			id,
		);
	};
	const handleBlockAndUnblockUser = (data) => {
		blockAndUnblockUser({
			token: data?.token,
			id: x?._id,
			dispatch,
			state,
			blockUser: !x?.lock,
			setIsProcessBlockUser,
			setSnackbar,
		});
	};
	const onBlockAndUnblockUser = () => {
		setIsProcessBlockUser(true);
		requestRefreshToken(
			currentUser,
			handleBlockAndUnblockUser,
			state,
			dispatch,
			actions,
		);
	};
	const DATA_COINS =
		dataCoin?.data?.map((coin) => {
			return {
				name: coin.symbol,
			};
		}) || [];
	DATA_COINS.unshift({ name: 'USDT' });
	const uniqueDataCoins = DATA_COINS.filter(
		(v, i, a) => a.findIndex((t) => t.name === v.name) === i,
	);
	let DataCoinFlag = searchCoinGift({
		coin,
		dataCoins: uniqueDataCoins,
	});
	const URL_SERVER =
		process.env.REACT_APP_TYPE === 'development'
			? process.env.REACT_APP_URL_SERVER
			: process.env.REACT_APP_URL_SERVER_PRODUCTION;
	function ItemRender({
		title,
		info,
		bankInfo,
		methodBank,
		nameAccount,
		numberAccount,
	}) {
		return (
			<div className="detail-item">
				<div className="detail-title" style={{ minWidth: '120px' }}>
					{title}
				</div>
				<div className={`${cx('detail-status')}`}>
					{bankInfo ? (
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'flex-end',
							}}
						>
							<span className="info">
								{methodBank ? (
									methodBank
								) : (
									<Skeleton width={30} />
								)}
							</span>
							<span className="info">
								{nameAccount ? (
									nameAccount
								) : (
									<Skeleton width={30} />
								)}
							</span>
							<span className="info">
								{numberAccount ? (
									numberAccount
								) : (
									<Skeleton width={30} />
								)}
							</span>
						</div>
					) : (
						<span className="info">
							{info || info === 0 ? (
								info
							) : (
								<Skeleton width={30} />
							)}
						</span>
					)}
				</div>
			</div>
		);
	}
	function ImageDocumentRender({
		label,
		isCheck,
		imageFrontUrl,
		imageBesideUrl,
	}) {
		return (
			<div className={`${cx('document-container')}`}>
				<div className={`${cx('document-user-title')}`}>{label}</div>
				{isCheck ? (
					<div className={`${cx('document-user-item')}`}>
						<Image
							src={`${URL_SERVER}/${imageFrontUrl?.replace(
								'uploads/',
								'',
							)}`}
							alt=""
							className={`${cx('document-user-item-image-view')}`}
							onClick={(e) => {
								modalImageTrue(e);
								const index = DATA_IMAGE_MODAL.findIndex(
									(item) =>
										item ===
										imageFrontUrl?.replace('uploads/', ''),
								);
								setIndexImage(index);
							}}
						/>
						<Image
							src={`${URL_SERVER}/${imageBesideUrl?.replace(
								'uploads/',
								'',
							)}`}
							alt=""
							className={`${cx('document-user-item-image-view')}`}
							onClick={(e) => {
								modalImageTrue(e);
								const index = DATA_IMAGE_MODAL.findIndex(
									(item) =>
										item ===
										imageBesideUrl?.replace('uploads/', ''),
								);
								setIndexImage(index);
							}}
						/>
					</div>
				) : (
					<Skeleton width="100%" height="200px" />
				)}
			</div>
		);
	}
	return (
		<>
			<div className={`${cx('buySellDetail-container')}`}>
				<SnackbarCp
					openSnackbar={snackbar.open}
					handleCloseSnackbar={handleCloseSnackbar}
					messageSnackbar={snackbar.message}
					typeSnackbar={snackbar.type}
				/>
				<div className={`${cx('detail-container')}`}>
					<div className="detail-item">
						<div className="detail-title">Rank</div>
						<div className={`${cx('detail-status')}`}>
							{x ? (
								<>
									<span
										className={`status fwb ${
											x?.rank
												.toLowerCase()
												.replace(' ', '') + 'bgc'
										}`}
									>
										{textUtils.FirstUpc(x?.rank)}
									</span>
								</>
							) : (
								<Skeleton width={50} />
							)}
						</div>
					</div>
					<ItemRender
						title="Username"
						info={x && x.payment?.username}
					/>
					<ItemRender title="Email" info={x && x.payment?.email} />
					<ItemRender title="Rule" info={x && x.payment?.rule} />
					{console.log(x)}
					<ItemRender
						bankInfo
						title="Bank Name"
						methodBank={x && x.payment.bank?.method_name}
						nameAccount={x && x.payment.bank?.account_name}
						numberAccount={x && x.payment.bank?.number}
					/>
					<ItemRender feeCustom title="Fee" info={x && x?.fee} />
					<ItemRender
						title="Deposits"
						info={
							x && numberUtils.formatUSD(x?.Wallet?.deposit || 0)
						}
					/>
					<ItemRender
						title="Withdraw"
						info={
							x && numberUtils.formatUSD(x?.Wallet?.withdraw || 0)
						}
					/>
					<ItemRender
						title="Balance"
						info={
							x && numberUtils.formatUSD(x?.Wallet?.balance || 0)
						}
					/>
					<ItemRender
						title="Commision"
						info={
							x &&
							numberUtils.formatUSD(x?.Wallet?.commission || 0)
						}
					/>
					<ItemRender
						title="Created At"
						info={
							x &&
							moment(x?.createdAt).format('DD/MM/YYYY HH:mm:ss')
						}
					/>
				</div>
				<div className={`${cx('detail-container')}`}>
					<div className="detail-item align-flex-end p0">
						<FormInput
							type="text"
							name="fee"
							placeholder="Fee"
							classNameInput={`${cx('fee-input')}`}
							label="Change Fee"
							value={feeValue}
							onChange={changeFee}
						/>
						<Button
							onClick={() => updateFee(idUser)}
							className={`${cx('btn')} vipbgc`}
							disabled={!feeValue || isProcessFee}
							isProcess={isProcessFee}
						>
							Update
						</Button>
					</div>
					<div className="w100">
						<SelectValue
							isFormInput
							label="Change Coin"
							nameSearch="coin"
							toggleModal={toggleListCoin}
							stateModal={selectStatus}
							valueSelect={changeCoin}
							onChangeSearch={searchSelect}
							dataFlag={DataCoinFlag}
							onClick={handleChangeCoin}
							valueFormInput={quantityCoin}
							onChangeFormInput={changeQuantity}
						/>
						<div className="detail-item justify-flex-end">
							<Button
								onClick={() => updateCoin(idUser)}
								className="vipbgc"
								disabled={
									(!coin && !quantityCoin) || isProcessCoin
								}
								isProcess={isProcessCoin}
							>
								Change
							</Button>
						</div>
					</div>
					<div className={`${cx('document-user-container')} w100`}>
						<ImageDocumentRender
							label="1. Citizen Identification"
							isCheck={x?.uploadCCCDFont && x?.uploadCCCDBeside}
							imageFrontUrl={x?.uploadCCCDFont}
							imageBesideUrl={x?.uploadCCCDBeside}
						/>
						<ImageDocumentRender
							label="2. License"
							isCheck={
								x?.uploadLicenseFont && x?.uploadLicenseBeside
							}
							imageFrontUrl={x?.uploadLicenseFont}
							imageBesideUrl={x?.uploadLicenseBeside}
						/>
					</div>
				</div>
				<div className={`${cx('list-btn-container')}`}>
					<Button
						className={`${cx('btn')} confirmbgc`}
						onClick={refreshPage.refreshPage}
					>
						<div className="flex-center">
							<Icons.RefreshIcon className="fz12 mr8" />
							<span className={`${cx('general-button-text')}`}>
								Refresh Page
							</span>
						</div>
					</Button>
					<Button
						className={`${cx('btn')} cancelbgc`}
						onClick={onBlockAndUnblockUser}
						isProcess={isProcessBlockUser}
						disabled={isProcessBlockUser}
					>
						<div className="flex-center">
							{!x?.lock ? (
								<Icons.BlockUserIcon />
							) : (
								<Icons.UnBlockUserIcon />
							)}{' '}
							<span className="ml8">
								{!x?.lock ? 'Block User' : 'Unblock User'}
							</span>
						</div>
					</Button>
					<Button
						className={`${cx('btn')} confirmbgc`}
						onClick={() => refreshPwd(idUser)}
						isProcess={isProcessRefreshPwd}
						disabled={isProcessRefreshPwd}
					>
						<div className="flex-center">
							<Icons.RefreshPageIcon />{' '}
							<span className="ml8">Refresh Password</span>
						</div>
					</Button>
					<Button
						className={`${cx('btn')} completebgc`}
						onClick={(e) => modalChangePwdTrue(e, idUser)}
					>
						<div className="flex-center">
							<Icons.EditIcon />{' '}
							<span className="ml8">Change Password</span>
						</div>
					</Button>
				</div>
			</div>
			<ModalViewImage
				stateModal={isModalImage}
				closeModal={modalImageFalse}
				uniqueData={DATA_IMAGE_MODAL}
				indexImage={indexImage}
				setIndexImage={setIndexImage}
			/>
			{modalDelete && (
				<Modal
					titleHeader="Change Password"
					actionButtonText="Change"
					closeModal={modalChangePwdFalse}
					openModal={modalChangePwdTrue}
					classNameButton="vipbgc"
					onClick={() => changePwd(idUser)}
					isProcess={isProcessChangePwd}
				>
					<FormInput
						type="password"
						name="password"
						placeholder="Enter new password..."
						label="Password"
						showPwd
						onChange={changeInput}
					/>
				</Modal>
			)}
		</>
	);
}

export default UserDetail;
