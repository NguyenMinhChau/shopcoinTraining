/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react';
import className from 'classnames/bind';
import styles from './DepositUser.module.css';
import { General } from '../../Layouts';
import {
	axiosUtils,
	DataDepositUser,
	handleUtils,
	numberUtils,
	requestRefreshToken,
	searchUtils,
	useAppContext,
	useDebounce,
} from '../../utils';
import { actions } from '../../app/';
import { searchBankAdminUser } from '../../services/coins';
import { changeBankSelect } from '../../services/users';
import {
	ActionsTable,
	FormInput,
	Icons,
	Modal,
	SelectValue,
} from '../../components';
import { TrObjectIcon } from '../../components/TableData/TableData';
import moment from 'moment';
import routers from '../../routers/routers';
import { handleCreate } from '../../services/deposits';
import { adminGet, adminPost, userGet } from '../../utils/Axios/axiosInstance';
import Skeleton from 'react-loading-skeleton';

const cx = className.bind(styles);

function RenderBodyTable({ data }) {
	const [rate, setRate] = useState(null);
	const [paymentAD, setPaymentAD] = useState([]);
	const getRate = async () => {
		const resGet = await axiosUtils.adminGet('rate');
		setRate(resGet.metadata[0]);
	};
	const getAllPaymentAD = async () => {
		const resGet = await adminPost('payment/admin', {});
		setPaymentAD(resGet.metadata);
	};
	useEffect(() => {
		getRate();
		getAllPaymentAD();
	}, []);
	const { state } = useAppContext();
	const {
		pagination: { page, show },
	} = state.set;
	return (
		<>
			{data.map((item, index) => {
				const payment = paymentAD.filter((x) => {
					return x?._id === item?.method;
				})[0];
				const sendReceived = {
					send: {
						icon: <Icons.SendIcon />,
						title: 'Send',
						number: numberUtils.formatVND(item?.amount_vnd),
					},
					received: {
						icon: <Icons.ReceivedIcon />,
						title: 'Received',
						number: numberUtils.formatUSD(item?.amount),
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
							{numberUtils.formatVND(rate?.rate_deposit) || '---'}
						</td>
						<td className="item-w100">
							{moment(item?.createdAt).format(
								'DD/MM/YYYY HH:mm:ss',
							)}
						</td>
						<td className="item-w150">
							{payment ? (
								<>
									<div>{payment?.method_name}</div>
									<div>{payment?.account_name}</div>
									<div>{payment?.number}</div>
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
						<td>
							<ActionsTable
								view
								noDel
								linkView={`${routers.depositUser}/${item?._id}`}
							/>
						</td>
					</tr>
				);
			})}
		</>
	);
}

export default function DepositUser() {
	const { state, dispatch } = useAppContext();
	const {
		currentUser,
		bankValue,
		searchValues: { depositUser, bank },
		pagination: { page, show },
	} = state.set;
	const { selectBank } = state.toggle;
	const [data, setData] = useState([]);
	const [dataPaymentAdmin, setDataPaymentAdmin] = useState([]);
	const [rate, setRate] = useState(null);
	const [amountUSD, setAmountUSD] = useState();
	const [stateModalBank, setStateModalBank] = useState(false);
	const [isProcess, setIsProcess] = useState(false);
	const [snackbar, setSnackbar] = useState({
		open: false,
		type: '',
		message: '',
	});
	const useDebounceDeposit = useDebounce(depositUser, 500);
	useEffect(() => {
		if (useDebounceDeposit) {
			setTimeout(() => {
				dispatch(
					actions.setData({
						pagination: { page: 1, show: 10 },
					}),
				);
			}, 500);
		}
	}, [useDebounceDeposit]);
	const handleCloseSnackbar = (event, reason) => {
		if (reason === 'clickaway') {
			return;
		}
		setSnackbar({
			...snackbar,
			open: false,
		});
	};
	const getDepositByEmail = async (dataToken) => {
		const resGet = await userGet(`deposit/${currentUser?.email}`, {
			token: dataToken?.token,
		});
		setData(resGet.metadata);
	};
	const getPaymentAdmin = async () => {
		const resGet = await axiosUtils.adminPost('payment/admin', {});
		setDataPaymentAdmin(resGet.metadata);
	};
	const getRate = async () => {
		const resGet = await axiosUtils.adminGet('rate');
		setRate(resGet.metadata[0]);
	};
	useEffect(() => {
		requestRefreshToken(
			currentUser,
			getDepositByEmail,
			state,
			dispatch,
			actions,
		);
		getPaymentAdmin();
		getRate();
	}, []);
	let DataDpFlag = data || [];
	if (useDebounceDeposit) {
		DataDpFlag = DataDpFlag.filter((item) => {
			return (
				searchUtils.searchInput(useDebounceDeposit, item.symbol) ||
				searchUtils.searchInput(useDebounceDeposit, item.amount) ||
				searchUtils.searchInput(useDebounceDeposit, item.createdAt) ||
				searchUtils.searchInput(useDebounceDeposit, item.price)
			);
		});
	}
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
	const toogleModalBank = useCallback(
		(e) => {
			e.stopPropagation();
			setStateModalBank(!stateModalBank);
		},
		[stateModalBank],
	);
	const searchSelect = useCallback((e) => {
		return searchUtils.logicSearch(e, dispatch, state, actions);
	}, []);
	const handleChangeAmountUSD = useCallback((e) => {
		setAmountUSD(e.target.value);
	}, []);
	const handleChangeBank = useCallback(
		(bankValue) => {
			changeBankSelect({
				bankValue,
				selectBank,
				dispatch,
				state,
			});
			setStateModalBank(false);
		},
		[bankValue, selectBank],
	);
	const createDepositsAPI = (data) => {
		handleCreate({
			amount: amountUSD,
			id_user: currentUser.id,
			email_user: currentUser.email,
			amountVnd: parseFloat(amountUSD * rate?.rateDeposit),
			token: data?.token,
			bankAdmin: bankValue[0],
			rateDeposit: rate?.rateDeposit,
			dispatch,
			setIsProcess,
			setData,
			setSnackbar,
		});
	};
	const handleSubmit = useCallback(
		(e) => {
			setIsProcess(true);
			requestRefreshToken(
				currentUser,
				createDepositsAPI,
				state,
				dispatch,
				actions,
			);
		},
		[amountUSD, bankValue, isProcess, data],
	);
	const dataBankFlag = searchBankAdminUser({
		bank,
		data: dataPaymentAdmin,
	});
	const idDisabled = amountUSD && bankValue ? true : false;
	return (
		<>
			<General
				className={cx('setting-coin')}
				valueSearch={depositUser}
				nameSearch="depositUser"
				dataHeaders={DataDepositUser().headers}
				totalData={DataDpFlag?.length}
				PaginationCus={true}
				startPagiCus={start}
				endPagiCus={end}
				dataPagiCus={DataDpFlag?.filter((row, index) => {
					if (index + 1 >= start && index + 1 <= end) return true;
				})}
				classNameButton="completebgc"
				textBtnNew="Create Deposit"
				noActions
				onCreate={openModal}
				handleCloseSnackbar={handleCloseSnackbar}
				openSnackbar={snackbar.open}
				typeSnackbar={snackbar.type}
				messageSnackbar={snackbar.message}
			>
				<RenderBodyTable
					data={DataDpFlag?.filter((row, index) => {
						if (index + 1 >= start && index + 1 <= end) return true;
					})}
				/>
			</General>
			{selectBank && (
				<Modal
					titleHeader="Create Deposit"
					actionButtonText="Submit"
					classNameButton="vipbgc"
					openModal={openModal}
					closeModal={closeModal}
					isProcess={isProcess}
					onClick={handleSubmit}
					disabled={!amountUSD || !bankValue}
				>
					<FormInput
						label="Amount USD"
						placeholder="Enter amount USD"
						type="text"
						name="amountUSD"
						onChange={handleChangeAmountUSD}
					/>
					<SelectValue
						label="Choose payment method"
						nameSearch="bank"
						toggleModal={toogleModalBank}
						stateModal={stateModalBank}
						valueSelect={bankValue?.method_name}
						onChangeSearch={searchSelect}
						dataFlag={dataBankFlag}
						onClick={handleChangeBank}
					/>
					{idDisabled && (
						<div className="fz16 complete fwb">
							Deposits (VND):{' '}
							{numberUtils.formatVND(
								amountUSD * rate?.rate_deposit || 0,
							)}
						</div>
					)}
				</Modal>
			)}
		</>
	);
}
