/* eslint-disable no-lone-blocks */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import className from 'classnames/bind';
import moment from 'moment';
import {
	useAppContext,
	DataChangeCoins,
	deleteUtils,
	handleUtils,
	requestRefreshToken,
	useDebounce,
	searchUtils,
} from '../../utils';
import { Icons, ActionsTable, Modal, SelectValue } from '../../components';
import { actions } from '../../app/';
import { General } from '../';
import { TrObjectNoIcon } from '../../components/TableData/TableData';
import styles from './ChangeCoin.module.css';
import Skeleton from 'react-loading-skeleton';
import {
	changeCoinGiftsSUB,
	deleteChangeCoin,
	getChangeCoin,
	getChangeCoinById,
} from '../../services/changeCoin';
import { changeCoinGifts, searchCoinGift } from '../../services/users';
import { FirstUpc } from '../../utils/format/LetterFirstUpc';

const cx = className.bind(styles);

function ChangeCoin() {
	const { state, dispatch } = useAppContext();
	const {
		currentUser,
		changeCoin,
		quantityCoin,
		searchValues: { changeCoinSearch, coin },
		pagination: { page, show },
		data: { dataChangeCoins, dataUser, dataSettingCoin },
	} = state.set;
	const { modalDelete, selectStatus } = state.toggle;
	const [isProcess, setIsProcess] = useState(false);
	const [modalDelete1, setModalDelete1] = useState(false);
	const [id, setId] = useState('');
	const [changeCoinById, setChangeCoinById] = useState(null);
	const [email, setEmail] = useState('');
	const [snackbar, setSnackbar] = useState({
		open: false,
		type: '',
		message: '',
	});
	let showPage = 10;
	const start = (page - 1) * showPage + 1;
	const end = start + showPage - 1;
	useEffect(() => {
		document.title = `Change Coin | ${process.env.REACT_APP_TITLE_WEB}`;
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
	const useDebounceCoin = useDebounce(changeCoinSearch, 500);
	useEffect(() => {
		if (useDebounceCoin) {
			setTimeout(() => {
				dispatch(
					actions.setData({
						pagination: { page: 1, show: 10 },
					}),
				);
			}, 500);
		}
	}, [useDebounceCoin]);
	useEffect(() => {
		getChangeCoin({
			page,
			show,
			dispatch,
			state,
			search: useDebounceCoin || '',
			dataSettingCoin,
			setSnackbar,
		});
	}, [page, show, useDebounceCoin]);
	let dataCoinFlag = dataChangeCoins || [];
	if (useDebounceCoin) {
		dataCoinFlag = dataCoinFlag.filter((item) => {
			return (
				searchUtils.searchInput(useDebounceCoin, item.status) ||
				searchUtils.searchInput(useDebounceCoin, item.type) ||
				searchUtils.searchInput(useDebounceCoin, item.createdAt) ||
				searchUtils.searchInput(useDebounceCoin, item.amount)
			);
		});
	}
	// Modal
	const modalDeleteTrue = (e, id) => {
		deleteUtils.deleteTrue(e, id, dispatch, state, actions);
		getChangeCoinById({
			id_coin: id,
			setSnackbar,
			setChangeCoinById,
		});
	};
	const modalDeleteFalse = async (e) => {
		deleteUtils.deleteFalse(e, dispatch, state, actions);
		setIsProcess(false);
		dispatch(
			actions.setData({
				quantityCoin: '',
				changeCoin: '',
			}),
		);
	};
	const modalDeleteTrue1 = (e, id) => {
		dispatch(
			actions.setData({
				edit: { ...state.set.edit, id },
			}),
		);
		setModalDelete1(true);
	};
	const modalDeleteFalse1 = async (e) => {
		setIsProcess(false);
		setModalDelete1(false);
	};
	const toggleListCoin = (e) => {
		e.stopPropagation();
		dispatch(
			actions.toggleModal({
				selectStatus: !selectStatus,
			}),
		);
		dispatch(
			actions.setData({
				pagination: {
					page: 1,
					show: dataSettingCoin?.total,
				},
			}),
		);
	};
	const searchSelect = (e) => {
		return searchUtils.logicSearch(e, dispatch, state, actions);
	};
	const handleChangeCoinModal = (e, coin) => {
		e.stopPropagation();
		changeCoinGifts({ coin, selectStatus, dispatch, state });
	};
	const changeQuantity = (e) => {
		dispatch(
			actions.setData({
				quantityCoin: e.target.value,
			}),
		);
	};
	// Edit + Delete Deposits
	const changeCoinAPI = (data) => {
		changeCoinGiftsSUB({
			data,
			email: email,
			coin: changeCoin || changeCoinById?.symbol,
			quantityCoin: parseFloat(quantityCoin || changeCoinById?.amount),
			createBy: `web_${currentUser?.email}`,
			time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
			dispatch,
			state,
			page,
			show,
			search: changeCoinSearch || '',
			setIsProcess,
			setSnackbar,
		});
	};
	const handleChangeCoin = (email) => {
		setIsProcess(true);
		requestRefreshToken(
			currentUser,
			changeCoinAPI,
			state,
			dispatch,
			actions,
			email,
		);
	};
	const deleteAPI = (data) => {
		deleteChangeCoin({
			data,
			state,
			dispatch,
			id,
			page,
			show,
			search: changeCoinSearch || '',
			setSnackbar,
		});
	};
	const handleDel = (id) => {
		setIsProcess(true);
		requestRefreshToken(
			currentUser,
			deleteAPI,
			state,
			dispatch,
			actions,
			id,
		);
	};
	function RenderBodyTable({ data }) {
		return (
			<>
				{data.map((item, index) => {
					const username = dataUser.find(
						(x) => x?.payment.email === item.user,
					)?.payment.username;
					const infoUser = {
						name: username,
						email: item.user,
						path: `@${username?.replace(' ', '-')}`,
					};
					return (
						<tr key={index}>
							<td>{handleUtils.indexTable(page, show, index)}</td>
							<td className="item-w50">{item?.symbol}</td>
							<td>
								{(item?.amount < 0
									? item?.amount * -1
									: item?.amount) || '---'}
							</td>
							<td className="item-w150">
								<TrObjectNoIcon item={infoUser} />
							</td>
							<td className="item-w100">
								{moment(item.createdAt).format(
									'DD/MM/YYYY HH:mm:ss',
								)}
							</td>
							<td className="item-w100">
								{item?.create_by ? (
									item?.create_by
								) : (
									<Skeleton width={50} />
								)}
							</td>
							<td className="item-w100">{item?.type}</td>
							<td>
								<span
									className={`${
										item.status.toLowerCase() + 'bgc'
									} status`}
								>
									{FirstUpc(item.status)}
								</span>
							</td>

							<td>
								<ActionsTable
									// edit
									// onClickEdit={(e) => {
									// 	modalDeleteTrue(e, item?._id);
									// 	setEmail(item.user);
									// }}
									onClickDel={(e) => {
										modalDeleteTrue1(e, item?._id);
										setId(item._id);
									}}
								></ActionsTable>
							</td>
						</tr>
					);
				})}
			</>
		);
	}
	const DATA_COINS =
		(dataSettingCoin?.data?.coins || dataSettingCoin?.data)?.map((coin) => {
			return {
				name: coin?.symbol,
			};
		}) || [];
	DATA_COINS.unshift({ name: 'USDT' });
	const uniqueDataCoins = DATA_COINS.filter(
		(v, i, a) => a.findIndex((t) => t.name === v.name) === i,
	);
	let DataCoinModalFlag = searchCoinGift({
		coin,
		dataCoins: uniqueDataCoins,
	});
	return (
		<>
			<General
				className={cx('changeCoin')}
				valueSearch={changeCoinSearch}
				nameSearch="changeCoinSearch"
				// dataFlag={dataCoinFlag}
				dataHeaders={DataChangeCoins(Icons).headers}
				totalData={dataCoinFlag?.length}
				handleCloseSnackbar={handleCloseSnackbar}
				openSnackbar={snackbar.open}
				typeSnackbar={snackbar.type}
				messageSnackbar={snackbar.message}
				PaginationCus={true}
				startPagiCus={start}
				endPagiCus={end}
				dataPagiCus={dataCoinFlag?.filter((row, index) => {
					if (index + 1 >= start && index + 1 <= end) return true;
				})}
			>
				<RenderBodyTable
					data={dataCoinFlag?.filter((row, index) => {
						if (index + 1 >= start && index + 1 <= end) return true;
					})}
				/>
			</General>
			{modalDelete && (
				<Modal
					titleHeader="Change Coin"
					actionButtonText="Submit"
					openModal={modalDeleteTrue}
					closeModal={modalDeleteFalse}
					classNameButton="vipbgc"
					onClick={() => handleChangeCoin(email)}
					isProcess={isProcess}
				>
					<div className="w100">
						<SelectValue
							isFormInput
							label="Change Coin"
							nameSearch="coin"
							toggleModal={toggleListCoin}
							stateModal={selectStatus}
							valueSelect={changeCoin || changeCoinById?.symbol}
							onChangeSearch={searchSelect}
							dataFlag={DataCoinModalFlag}
							onClick={handleChangeCoinModal}
							valueFormInput={
								quantityCoin || changeCoinById?.amount
							}
							onChangeFormInput={changeQuantity}
						/>
					</div>
				</Modal>
			)}
			{modalDelete1 && (
				<Modal
					titleHeader="Delete Change Coin"
					actionButtonText="Delete"
					openModal={modalDeleteTrue1}
					closeModal={modalDeleteFalse1}
					classNameButton="cancelbgc"
					onClick={() => handleDel(id)}
					isProcess={isProcess}
				>
					<p className="modal-delete-desc">
						Are you sure to delete this change coin?
					</p>
				</Modal>
			)}
		</>
	);
}

export default ChangeCoin;
