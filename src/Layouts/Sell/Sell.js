/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import className from 'classnames/bind';
import {
	getSells,
	handleUpdateStatusFeeSell,
	handleDelete,
} from '../../services/sell';
import {
	useAppContext,
	DataSells,
	deleteUtils,
	handleUtils,
	requestRefreshToken,
	localStoreUtils,
	numberUtils,
	useDebounce,
} from '../../utils';
import 'react-loading-skeleton/dist/skeleton.css';
import moment from 'moment';
import { Icons, ActionsTable, SelectStatus, Modal } from '../../components';
import routers from '../../routers/routers';
import { actions } from '../../app/';
import { General } from '../';
import {
	TrObjectIcon,
	TrObjectNoIcon,
	TrStatus,
} from '../../components/TableData/TableData';
import styles from './Sell.module.css';
import Skeleton from 'react-loading-skeleton';

const cx = className.bind(styles);
const DATA_SELL = DataSells(Icons);

function Sell() {
	const { state, dispatch } = useAppContext();
	const { headers } = DATA_SELL;
	const {
		edit,
		currentUser,
		statusUpdate,
		statusCurrent,
		data: { dataSell, dataUser },
		pagination: { page, show },
		searchValues: { sell },
	} = state.set;
	const { modalStatus, modalDelete } = state.toggle;
	const [isProcess, setIsProcess] = useState(false);
	const [snackbar, setSnackbar] = useState({
		open: false,
		type: '',
		message: '',
	});
	useEffect(() => {
		document.title = `Sell | ${process.env.REACT_APP_TITLE_WEB}`;
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
	const useDebounceSell = useDebounce(sell, 500);
	useEffect(() => {
		if (useDebounceSell) {
			setTimeout(() => {
				dispatch(
					actions.setData({
						pagination: { page: 1, show: 10 },
					}),
				);
			}, 500);
		}
	}, [useDebounceSell]);
	useEffect(() => {
		getSells({
			page,
			show,
			dispatch,
			state,
			search: useDebounceSell,
			setSnackbar,
		});
	}, [page, show, useDebounceSell]);
	let dataSellFlag = dataSell?.data?.sells || dataSell?.data;
	const toggleEditTrue = async (e, status, id) => {
		await localStoreUtils.setStore({
			...currentUser,
			idUpdate: id,
		});
		deleteUtils.statusTrue(e, status, id, dispatch, state, actions);
	};
	const toggleEditFalse = (e) => {
		return deleteUtils.statusFalse(e, dispatch, state, actions);
	};
	const modalDeleteTrue = (e, id) => {
		return deleteUtils.deleteTrue(e, id, dispatch, state, actions);
	};
	const modalDeleteFalse = (e) => {
		return deleteUtils.deleteFalse(e, dispatch, state, actions);
	};

	// EDIT + DELETE
	const handleEdit = (data, id) => {
		handleUpdateStatusFeeSell({
			data,
			id,
			dispatch,
			state,
			note: `web_${currentUser?.email}`,
			page,
			show,
			statusUpdate,
			statusCurrent,
			search: sell,
			setSnackbar,
			setIsProcess,
		});
	};
	const editStatusSell = async (id) => {
		await 1;
		setIsProcess(true);
		requestRefreshToken(
			currentUser,
			handleEdit,
			state,
			dispatch,
			actions,
			id,
		);
		dispatch(
			actions.toggleModal({
				modalStatus: false,
			}),
		);
		dispatch(
			actions.setData({
				statusUpdate: '',
				statusCurrent: '',
			}),
		);
	};
	const handleDeleteSell = (data, id) => {
		handleDelete({
			data,
			id,
			dispatch,
			state,
			page,
			show,
			search: sell,
			setSnackbar,
		});
	};
	const deleteSell = async (id) => {
		await 1;
		requestRefreshToken(
			currentUser,
			handleDeleteSell,
			state,
			dispatch,
			actions,
			id,
		);
		dispatch(
			actions.toggleModal({
				modalDelete: false,
			}),
		);
	};
	const handleViewSell = (item) => {
		dispatch(
			actions.setData({
				edit: { ...state.set.edit, id: item.id, itemData: item },
			}),
		);
	};
	function RenderBodyTable({ data }) {
		return (
			<>
				{data.map((item, index) => {
					const sendReceived = {
						send: {
							icon: <Icons.SendIcon />,
							title: 'Send',
							number: item?.amount,
						},
						received: {
							icon: <Icons.ReceivedIcon />,
							title: 'Received',
							number: numberUtils.formatUSD(item?.amountUsd),
						},
					};
					const username = dataUser?.dataUser?.find(
						(x) => x?.payment?.email === item?.buyer?.gmailUSer,
					)?.payment?.username;
					const infoUser = {
						name: username,
						email: item.buyer.gmailUSer,
						path: `@${username?.replace(' ', '-')}`,
					};
					return (
						<tr key={index}>
							<td>{handleUtils.indexTable(page, show, index)}</td>
							<td className="item-w100">
								{/* <Skeleton width={50} /> */}
								{item?.symbol}
							</td>
							<td>
								<TrObjectIcon item={sendReceived} />
							</td>
							<td className="item-w100 vip">
								{item?.price?.toFixed(5) || '---'}
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
								{item?.createBy || <Skeleton width={50} />}
							</td>
							<td>
								<TrStatus
									item={item.status}
									onClick={(e) =>
										toggleEditTrue(e, item.status, item._id)
									}
								/>
							</td>
							<td>
								<ActionsTable
									view
									linkView={`${routers.sell}/${item._id}`}
									onClickDel={(e) =>
										modalDeleteTrue(e, item._id)
									}
									onClickView={() => handleViewSell(item)}
								></ActionsTable>
							</td>
						</tr>
					);
				})}
			</>
		);
	}
	return (
		<>
			<General
				className={cx('sell')}
				valueSearch={sell}
				nameSearch="sell"
				dataFlag={dataSellFlag}
				dataHeaders={headers}
				titleDelModal="Delete Sell"
				textDelModal="Are you sure to delete this sell?"
				typeDataDel={dataSell}
				nameTypeDataDel="dataSell"
				totalData={
					dataSell?.total ||
					dataSell?.data?.total ||
					dataSell?.totalSearch
				}
				handleCloseSnackbar={handleCloseSnackbar}
				openSnackbar={snackbar.open}
				typeSnackbar={snackbar.type}
				messageSnackbar={snackbar.message}
			>
				<RenderBodyTable data={dataSellFlag} />
			</General>
			{modalStatus && (
				<Modal
					titleHeader="Change Status"
					actionButtonText="Submit"
					openModal={toggleEditTrue}
					closeModal={toggleEditFalse}
					classNameButton="vipbgc"
					onClick={() =>
						editStatusSell(currentUser?.idUpdate || edit.id)
					}
					isProcess={isProcess}
				>
					<p className="modal-delete-desc">
						Are you sure change status this{' '}
						{window.location.pathname.includes(`${routers.buy}`)
							? 'buy'
							: 'sell'}
						?
					</p>
					<SelectStatus />
				</Modal>
			)}
			{modalDelete && (
				<Modal
					titleHeader="Delete Sell"
					actionButtonText="Delete"
					openModal={modalDeleteTrue}
					closeModal={modalDeleteFalse}
					classNameButton="cancelbgc"
					onClick={() => deleteSell(edit.id)}
					isProcess={isProcess}
				>
					<p className="modal-delete-desc">
						Are you sure to delete this sell?
					</p>
				</Modal>
			)}
		</>
	);
}

export default Sell;
