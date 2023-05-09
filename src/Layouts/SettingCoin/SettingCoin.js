/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import className from 'classnames/bind';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import routers from '../../routers/routers';
import { actions } from '../../app/';
import { General } from '../';
import {
	getCoins,
	onClickEdit,
	handleDelete,
	handleCreateCoinInactive,
} from '../../services/coins';
import {
	useAppContext,
	DataCoins,
	deleteUtils,
	requestRefreshToken,
	handleUtils,
	useDebounce,
} from '../../utils';
import { ActionsTable, Modal } from '../../components';
import styles from './SettingCoin.module.css';
import { TrObjectImage } from '../../components/TableData/TableData';

const cx = className.bind(styles);

function SettingCoin() {
	const { state, dispatch } = useAppContext();
	const {
		edit,
		currentUser,
		searchValues: { settingCoin },
		pagination: { page, show },
		data: { dataSettingCoin, dataCoinInactive },
	} = state.set;
	const { modalDelete } = state.toggle;
	const [snackbar, setSnackbar] = useState({
		open: false,
		type: '',
		message: '',
	});
	const history = useNavigate();
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
		getCoins({
			dispatch,
			state,
			page,
			show,
			search: useDebounceCoin,
			setSnackbar,
		});
	}, [page, show, useDebounceCoin]);
	const dataSettingFlag =
		dataSettingCoin?.data?.coins || dataSettingCoin?.data;
	// Modal Delete
	const modalDeleteTrue = (e, id) => {
		return deleteUtils.deleteTrue(e, id, dispatch, state, actions);
	};
	const modalDeleteFalse = (e) => {
		return deleteUtils.deleteFalse(e, dispatch, state, actions);
	};
	// Edit + Delete Coin
	const handleDeleteCoins = (data, id) => {
		handleDelete({
			data,
			id,
			dispatch,
			state,
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
	const handleBlock = (data, item) => {
		handleCreateCoinInactive({
			data,
			dispatch,
			state,
			actions,
			nameCoin: item?.name,
			symbolCoin: item?.symbol,
			fullName: item?.fullName,
			logo_sub: item?.logo,
			history,
			page,
			show,
			setSnackbar,
		});
	};
	const onClickBlock = async (item) => {
		const check = dataCoinInactive?.data?.find(
			(itemCoin) => itemCoin.symbol === item.symbol,
		);
		if (check) {
			setSnackbar({
				open: true,
				type: 'error',
				message: 'This coin is already blocked',
			});
		} else {
			requestRefreshToken(
				currentUser,
				handleBlock,
				state,
				dispatch,
				actions,
				item,
			);
		}
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
									item={`${URL_SERVER}${item.logo?.replace(
										'uploads/',
										'',
									)}`}
								/>
							</td>
							<td>{item.name}</td>
							<td>
								{moment(item.createdAt).format(
									'DD/MM/YYYY HH:mm:ss',
								)}
							</td>
							<td>
								<ActionsTable
									edit
									block
									linkView={`${routers.settingCoin}/${item._id}`}
									onClickDel={(e) =>
										modalDeleteTrue(e, item._id)
									}
									onClickEdit={() => editSetting(item)}
									onClickBlock={() => onClickBlock(item)}
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
				textBtnNew="New Coin"
				linkCreate={`${routers.settingCoin}/${routers.newcoin}`}
				dataFlag={dataSettingFlag}
				dataHeaders={DataCoins().headers}
				totalData={
					dataSettingCoin?.total || dataSettingCoin?.data?.totalSearch
				}
				classNameButton="completebgc"
				handleCloseSnackbar={handleCloseSnackbar}
				openSnackbar={snackbar.open}
				typeSnackbar={snackbar.type}
				messageSnackbar={snackbar.message}
			>
				<RenderBodyTable data={dataSettingFlag} />
			</General>
			{modalDelete && (
				<Modal
					titleHeader="Delete Setting Coin"
					actionButtonText="Delete"
					openModal={modalDeleteTrue}
					closeModal={modalDeleteFalse}
					classNameButton="cancelbgc"
					onClick={() => deleteCoins(edit.id)}
				>
					<p className="modal-delete-desc">
						Are you sure to delete this coin?
					</p>
				</Modal>
			)}
		</>
	);
}

export default SettingCoin;
