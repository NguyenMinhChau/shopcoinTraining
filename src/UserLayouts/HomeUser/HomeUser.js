/* eslint-disable array-callback-return */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import className from 'classnames/bind';
import styles from './HomeUser.module.css';
import {
	DataCoinsUser,
	handleUtils,
	useAppContext,
	useDebounce,
} from '../../utils';
import { actions } from '../../app/';
import { getCoinsUser } from '../../services/coins';
import { General } from '../../Layouts';
import { TrObjectImage } from '../../components/TableData/TableData';
import moment from 'moment';
import { Link } from 'react-router-dom';

const cx = className.bind(styles);
const URL_SERVER =
	process.env.REACT_APP_TYPE === 'development'
		? process.env.REACT_APP_URL_SERVER
		: process.env.REACT_APP_URL_SERVER_PRODUCTION;
function RenderBodyTable({ data }) {
	const { state } = useAppContext();
	const {
		pagination: { page, show },
	} = state.set;
	return (
		<>
			{data.map((item, index) => {
				return (
					<tr key={item?._id}>
						<td>{handleUtils.indexTable(page, show, index)}</td>
						<td>
							<TrObjectImage
								// item={`${URL_SERVER}${item.logo?.replace(
								// 	'uploads/',
								// 	'',
								// )}`}
								item="https://avatars.githubusercontent.com/u/81848005?v=4"
							/>
						</td>
						<td className="item-w150">
							{item?.name}{' '}
							<span className="confirm">({item?.price})</span>
						</td>
						<td className="complete item-w150">{item?.high}</td>
						<td className="cancel item-w150">{item?.low}</td>
						<td className="item-w100">
							{moment(item?.createdAt).format(
								'DD/MM/YYYY HH:mm:ss',
							)}
						</td>
						<td>
							<Link
								to={`${item?._id}`}
								className={`${cx(
									'actions-item',
								)} completebgcbold fwb`}
							>
								Buy
							</Link>
						</td>
					</tr>
				);
			})}
		</>
	);
}

export default function HomeUser() {
	const { state, dispatch } = useAppContext();
	const {
		currentUser,
		searchValues: { settingCoin },
		pagination: { page, show },
		data: { dataSettingCoin },
	} = state.set;
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
	useEffect(() => {
		document.title = `Home | ${process.env.REACT_APP_TITLE_WEB}`;
	}, []);
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
		getCoinsUser({
			dispatch,
			state,
			page,
			show,
			search: useDebounceCoin,
			id: currentUser?.id,
			setSnackbar,
		});
	}, [page, show, useDebounceCoin]);
	let showPage = 10;
	const start = (page - 1) * showPage + 1;
	const end = start + showPage - 1;
	let dataSettingFlag;
	if (!useDebounceCoin) {
		dataSettingFlag = dataSettingCoin?.metadata?.filter((row, index) => {
			if (index + 1 >= start && index + 1 <= end) return true;
		});
	} else {
		dataSettingFlag = dataSettingCoin?.metadata
			?.filter((item) => {
				return item?.name
					?.toLowerCase()
					.includes(useDebounceCoin.toLowerCase());
			})
			?.filter((row, index) => {
				if (index + 1 >= start && index + 1 <= end) return true;
			});
	}
	return (
		<>
			<General
				className={cx('setting-coin')}
				valueSearch={settingCoin}
				nameSearch="settingCoin"
				dataHeaders={DataCoinsUser().headers}
				// dataFlag={dataSettingFlag}
				// totalData={dataSettingCoin?.metadata?.total}
				classNameButton="completebgc"
				isRefreshPage
				handleCloseSnackbar={handleCloseSnackbar}
				openSnackbar={snackbar.open}
				typeSnackbar={snackbar.type}
				messageSnackbar={snackbar.message}
				totalData={dataSettingCoin?.metadata?.length}
				PaginationCus={true}
				dataPagiCus={dataSettingFlag}
				startPagiCus={start}
				endPagiCus={end}
			>
				<RenderBodyTable data={dataSettingFlag} />
			</General>
		</>
	);
}
