/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import className from 'classnames/bind';
import moment from 'moment';
import routers from '../../routers/routers';
import { actions } from '../../app/';
import { General } from '../';
import {
	onClickEdit,
	getCoinsInactive,
	handleDeleteInactive,
} from '../../services/coins';
import {
	useAppContext,
	DataCoins,
	deleteUtils,
	requestRefreshToken,
	handleUtils,
	useDebounce,
	searchUtils,
} from '../../utils';
import { ActionsTable, Modal } from '../../components';
import styles from './CoinInactive.module.css';
import { TrObjectImage } from '../../components/TableData/TableData';

const cx = className.bind(styles);

function CoinInactive() {
	const { state, dispatch } = useAppContext();
	const {
		edit,
		currentUser,
		searchValues: { settingCoin },
		pagination: { page, show },
		data: { dataCoinInactive },
	} = state.set;
	let showPage = 10;
	const start = (page - 1) * showPage + 1;
	const end = start + showPage - 1;
	const { modalDelete } = state.toggle;
	const [snackbar, setSnackbar] = useState({
		open: false,
		type: '',
		message: '',
	});
	useEffect(() => {
		document.title = `Coins | ${process.env.REACT_APP_TITLE_WEB}`;
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
	const useDebounceCoin = useDebounce(settingCoin, 500);
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
		getCoinsInactive({
			dispatch,
			state,
			page,
			show,
			search: useDebounceCoin,
			setSnackbar,
		});
	}, [page, show, useDebounceCoin]);
	let dataCoinActiveFlag = dataCoinInactive || [];
	if (useDebounceCoin) {
		dataCoinActiveFlag = dataCoinActiveFlag.filter((item) => {
			return (
				searchUtils.searchInput(useDebounceCoin, item?.name) ||
				searchUtils.searchInput(useDebounceCoin, item?.createdAt)
			);
		});
	}
	// Modal Delete
	const modalDeleteTrue = (e, id) => {
		return deleteUtils.deleteTrue(e, id, dispatch, state, actions);
	};
	const modalDeleteFalse = (e) => {
		return deleteUtils.deleteFalse(e, dispatch, state, actions);
	};
	// Edit + Delete Coin
	const handleDeleteCoins = (data, id) => {
		handleDeleteInactive({
			data,
			id,
			dispatch,
			state,
			actions,
			page,
			show,
			search: settingCoin,
			setSnackbar,
		});
	};
	const deleteCoins = (id) => {
		requestRefreshToken(
			currentUser,
			handleDeleteCoins,
			state,
			dispatch,
			actions,
			id,
		);
	};
	const editSetting = (item) => {
		onClickEdit({ dispatch, state, item });
	};
	const URL_SERVER =
		process.env.REACT_APP_TYPE === 'development'
			? process.env.REACT_APP_URL_SERVER
			: process.env.REACT_APP_URL_SERVER_PRODUCTION;
	function RenderBodyTable({ data }) {
		return (
			<>
				{data.map((item, index) => {
					return (
						<tr key={index}>
							<td>{handleUtils.indexTable(page, show, index)}</td>
							<td>
								<TrObjectImage
									item={`${URL_SERVER}${item?.logo?.replace(
										'uploads/',
										'',
									)}`}
								/>
							</td>
							<td className="text-upc">{item?.name}</td>
							<td>
								{moment(item?.createdAt).format(
									'DD/MM/YYYY HH:mm:ss',
								)}
							</td>
							<td>
								<ActionsTable
									// edit
									// onClickEdit={() => editSetting(item)}
									linkView={`${routers.coinInactive}/${item._id}`}
									onClickDel={(e) =>
										modalDeleteTrue(e, item?._id)
									}
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
				className={cx('setting-coin')}
				valueSearch={settingCoin}
				nameSearch="settingCoin"
				// textBtnNew="New Coin Inactive"
				// linkCreate={`${routers.coinInactive}/${routers.newcoinInactive}`}
				// dataFlag={dataCoinActiveFlag}
				dataHeaders={DataCoins().headers}
				totalData={dataCoinActiveFlag?.length}
				classNameButton="completebgc"
				handleCloseSnackbar={handleCloseSnackbar}
				openSnackbar={snackbar.open}
				typeSnackbar={snackbar.type}
				messageSnackbar={snackbar.message}
				PaginationCus={true}
				startPagiCus={start}
				endPagiCus={end}
				dataPagiCus={dataCoinActiveFlag?.filter((row, index) => {
					if (index + 1 >= start && index + 1 <= end) return true;
				})}
			>
				<RenderBodyTable
					data={dataCoinActiveFlag?.filter((row, index) => {
						if (index + 1 >= start && index + 1 <= end) return true;
					})}
				/>
			</General>
			{modalDelete && (
				<Modal
					titleHeader="Delete Coin Inactive"
					actionButtonText="Delete"
					openModal={modalDeleteTrue}
					closeModal={modalDeleteFalse}
					classNameButton="cancelbgc"
					onClick={() => deleteCoins(edit.id)}
				>
					<p className="modal-delete-desc">
						Are you sure to delete this coin inactive?
					</p>
				</Modal>
			)}
		</>
	);
}

export default CoinInactive;
