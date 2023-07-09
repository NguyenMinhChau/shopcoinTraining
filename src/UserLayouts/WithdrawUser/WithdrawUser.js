/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import className from 'classnames/bind';
import styles from './WithdrawUser.module.css';
import { General } from '../../Layouts';
import {
	axiosUtils,
	DataWithdrawUser,
	handleUtils,
	numberUtils,
	requestRefreshToken,
	searchUtils,
	useAppContext,
	useDebounce,
} from '../../utils';
import { actions } from '../../app/';
import { handleCreate } from '../../services/withdraws';
import { ActionsTable, FormInput, Icons, Modal } from '../../components';
import { TrObjectIcon } from '../../components/TableData/TableData';
import moment from 'moment';
import { Link } from 'react-router-dom';
import routers from '../../routers/routers';
import Skeleton from 'react-loading-skeleton';

const cx = className.bind(styles);

function RenderBodyTable({ data }) {
	const { state: useStateContext } = useAppContext();
	const { currentUser } = useStateContext.set;
	const [rate, setRate] = useState(null);
	const [userById, setUserById] = useState(null);
	const getRate = async () => {
		const resGet = await axiosUtils.adminGet('rate');
		setRate(resGet.metadata[0]);
	};
	const getUser = async () => {
		const process = await axiosUtils.adminGet(`user/${currentUser?.id}`);
		setUserById(process.metadata);
	};
	useEffect(() => {
		getRate();
		getUser();
	}, []);
	const { state } = useAppContext();
	const {
		pagination: { page, show },
	} = state.set;
	return (
		<>
			{data.map((item, index) => {
				const sendReceived = {
					send: {
						icon: <Icons.SendIcon />,
						title: 'Send',
						number: numberUtils.formatUSD(item?.amount),
					},
					received: {
						icon: <Icons.ReceivedIcon />,
						title: 'Received',
						number: numberUtils.formatVND(item?.amount_vnd),
					},
				};
				return (
					<tr key={item?._id}>
						<td>{handleUtils.indexTable(page, show, index)}</td>
						<td className="item-w150">{item?.symbol}</td>
						<td>
							<TrObjectIcon item={sendReceived} />
						</td>
						<td className="item-w150">
							{numberUtils.formatVND(rate?.rate_withdraw) ||
								'---'}
						</td>
						<td className="item-w100">
							{moment(item?.createdAt).format(
								'DD/MM/YYYY HH:mm:ss',
							)}
						</td>
						<td className="item-w150">
							{userById ? (
								<>
									<div>
										{userById?.payment?.bank?.method_name}
									</div>
									<div>
										{userById?.payment?.bank?.account_name}
									</div>
									<div>{userById?.payment?.bank?.number}</div>
								</>
							) : (
								<Skeleton width={50} height={10} />
							)}
						</td>
						<td style={{ alignItems: 'center' }}>
							<span
								className={`status ${
									item?.status
										?.toLowerCase()
										.replace(/\s/g, '') + 'bgc'
								}`}
							>
								{item?.status}
							</span>
						</td>
						{item?.status?.toLowerCase().replace(/\s/g, '') !==
							'completed' &&
							item?.status?.toLowerCase().replace(/\s/g, '') !==
								'confirmed' && (
								<td>
									<ActionsTable
										view
										noDel
										verifyCode
										linkView={`${routers.withdrawUser}/${item?._id}`}
									/>
								</td>
							)}
					</tr>
				);
			})}
		</>
	);
}

export default function WithdrawUser() {
	const { state, dispatch } = useAppContext();
	const {
		currentUser,
		searchValues: { withdrawUser },
		pagination: { page, show },
	} = state.set;
	const { selectBank } = state.toggle;
	const [data, setData] = useState([]);
	const [rate, setRate] = useState(null);
	const [user, setUser] = useState([]);
	const [amountUSD, setAmountUSD] = useState();
	const [error, setError] = useState('');
	const [isProcess, setIsProcess] = useState(false);
	const useDebounceWithdraw = useDebounce(withdrawUser, 500);
	const [snackbar, setSnackbar] = useState({
		open: false,
		type: '',
		message: '',
	});
	const history = useNavigate();
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
		if (useDebounceWithdraw) {
			setTimeout(() => {
				dispatch(
					actions.setData({
						pagination: { page: 1, show: 10 },
					}),
				);
			}, 500);
		}
	}, [useDebounceWithdraw]);
	const getWithdrawByEmail = async (dataToken) => {
		const resGet = await axiosUtils.userGet(
			`withdraws/${currentUser?.id}`,
			{ token: dataToken?.token },
		);
		setData(resGet.metadata);
	};
	const getRate = async () => {
		const resGet = await axiosUtils.adminGet('rate');
		setRate(resGet.metadata[0]);
	};
	const getUser = async () => {
		const process = await axiosUtils.adminGet(`user/${currentUser?.id}`);
		setUser(process.metadata);
	};
	useEffect(() => {
		requestRefreshToken(
			currentUser,
			getWithdrawByEmail,
			state,
			dispatch,
			actions,
		);
		getRate();
		getUser();
	}, [page, show, useDebounceWithdraw]);
	let showPage = 10;
	const start = (page - 1) * showPage + 1;
	const end = start + showPage - 1;
	const openModal = useCallback((e) => {
		e.stopPropagation();
		dispatch(
			actions.toggleModal({
				selectBank: true,
			}),
		);
	}, []);
	const closeModal = useCallback((e) => {
		e.stopPropagation();
		setAmountUSD('');
		dispatch(
			actions.toggleModal({
				selectBank: false,
			}),
		);
	}, []);
	const handleChangeAmountUSD = useCallback((e) => {
		if (e.target.value) {
			if (e.target.value < 10) {
				setError('Amount USD must be greater than 10');
			} else if (isNaN(e.target.value)) {
				setError('Amount USD must be number');
			} else {
				setError('');
			}
			setAmountUSD(e.target.value);
		} else {
			setError('');
			setAmountUSD('');
		}
	}, []);
	const createWithdrawAPI = (data) => {
		handleCreate({
			amount: parseFloat(amountUSD),
			email_user: currentUser?.email,
			id_user: currentUser?.id,
			dispatch,
			state,
			token: data?.token,
			setIsProcess,
			setData,
			setSnackbar,
			history,
		});
	};
	const handleSubmit = useCallback(
		(e) => {
			setIsProcess(true);
			requestRefreshToken(
				currentUser,
				createWithdrawAPI,
				state,
				dispatch,
				actions,
			);
		},
		[amountUSD],
	);
	let dataWithdrawFlag = data || [];
	if (useDebounceWithdraw) {
		dataWithdrawFlag = dataWithdrawFlag.filter((item) => {
			return (
				searchUtils.searchInput(useDebounceWithdraw, item.symbol) ||
				searchUtils.searchInput(useDebounceWithdraw, item.amount) ||
				searchUtils.searchInput(useDebounceWithdraw, item.status) ||
				searchUtils.searchInput(useDebounceWithdraw, item.createdAt)
			);
		});
	}
	const isShowBodyModalWithdarw =
		(user?.Wallet?.balance || user?.Wallet?.balance === 0) &&
		user?.payment?.bank?.method_name &&
		user?.payment?.bank?.account_name &&
		user?.payment?.bank?.number &&
		user?.uploadCCCDBeside &&
		user?.uploadCCCDFont &&
		user?.uploadLicenseBeside &&
		user?.uploadLicenseFont;
	return (
		<>
			<General
				className={cx('setting-coin')}
				valueSearch={withdrawUser}
				nameSearch="withdrawUser"
				// dataFlag={dataWithdrawFlag}
				dataHeaders={DataWithdrawUser().headers}
				totalData={dataWithdrawFlag?.length}
				PaginationCus={true}
				startPagiCus={start}
				endPagiCus={end}
				dataPagiCus={dataWithdrawFlag?.filter((row, index) => {
					if (index + 1 >= start && index + 1 <= end) return true;
				})}
				classNameButton="completebgc"
				textBtnNew="Create Withdraw"
				noActions
				onCreate={openModal}
				handleCloseSnackbar={handleCloseSnackbar}
				openSnackbar={snackbar.open}
				typeSnackbar={snackbar.type}
				messageSnackbar={snackbar.message}
			>
				<RenderBodyTable
					data={dataWithdrawFlag?.filter((row, index) => {
						if (index + 1 >= start && index + 1 <= end) return true;
					})}
				/>
			</General>
			{selectBank && (
				<Modal
					titleHeader="Create Withdraw"
					actionButtonText="Submit"
					classNameButton="vipbgc"
					openModal={openModal}
					closeModal={closeModal}
					isProcess={isProcess}
					disabled={error || !amountUSD}
					onClick={handleSubmit}
					hideButton={!isShowBodyModalWithdarw}
				>
					{isShowBodyModalWithdarw ? (
						<>
							<div className={`${cx('info-user')}`}>
								<div className={`${cx('info-user-item')}`}>
									<div className={`${cx('info-user-title')}`}>
										Your Wallet
									</div>
									<div
										className={`${cx(
											'info-user-desc',
										)} vip`}
									>
										{numberUtils.coinUSD(
											user?.Wallet?.balance,
										)}
									</div>
								</div>
								<div className={`${cx('info-user-item')}`}>
									<div className={`${cx('info-user-title')}`}>
										Your bank account
									</div>
									<div
										className={`${cx(
											'info-user-desc',
										)} complete`}
									>
										{user ? (
											<>
												<div className="text-right">
													{
														user?.payment?.bank
															?.method_name
													}
												</div>
												<div className="text-right">
													{
														user?.payment?.bank
															?.account_name
													}
												</div>
												<div className="text-right">
													{
														user?.payment?.bank
															?.number
													}
												</div>
											</>
										) : (
											<Skeleton width={50} height={10} />
										)}
									</div>
								</div>
							</div>
							<FormInput
								label="Amount USD"
								placeholder="Enter amount USD"
								type="text"
								name="amountUSD"
								onChange={handleChangeAmountUSD}
							/>
							{error && (
								<div className="cancel fz14">{error}</div>
							)}
							{amountUSD && (
								<div className="fz16 complete fwb">
									Receive (VND):{' '}
									{numberUtils.formatVND(
										amountUSD * rate?.rate_withdraw || 0,
									)}
								</div>
							)}
						</>
					) : (
						<div className={`${cx('text-desc')}`}>
							You don't have a payment account yet or you haven't
							uploaded the document yet, please create one before
							doing so. Click{' '}
							<Link
								to={`${routers.profileUser}`}
								onClick={closeModal}
							>
								here
							</Link>{' '}
							create payment and upload documents. Thank you!
						</div>
					)}
				</Modal>
			)}
		</>
	);
}
