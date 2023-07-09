/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import className from 'classnames/bind';
import styles from './MyCoinUser.module.css';
import {
	axiosUtils,
	DataMyCoinsUser,
	handleUtils,
	numberUtils,
	useAppContext,
	useDebounce,
} from '../../utils';
import { General } from '../../Layouts';
import { Link } from 'react-router-dom';
import routers from '../../routers/routers';
import moment from 'moment';
import { TrObjectImage } from '../../components/TableData/TableData';
import { actions } from '../../app/';

const cx = className.bind(styles);

export default function MyCoinUser() {
	const { state, dispatch } = useAppContext();
	const {
		currentUser,
		searchValues: { settingCoin },
		pagination: { page, show },
	} = state.set;
	const [data, setData] = useState([]);
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
	const getMyCoin = async () => {
		const res = await axiosUtils.userGet(
			`coin/own/${currentUser?.id}?page=${page}&show=${show}&search=${useDebounceCoin}`,
		);
		setData(res.metadata);
	};
	useEffect(() => {
		getMyCoin();
	}, [page, show, useDebounceCoin]);
	const dataSettingFlag = data || [];
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
									item={`${URL_SERVER}${item?.coin?.logo?.replace(
										'uploads/',
										'',
									)}`}
									// item="https://avatars.githubusercontent.com/u/81848005?v=4"
								/>
							</td>
							<td className="item-w150">{item?.name}</td>
							<td className="vip item-w150">{item?.amount}</td>
							<td className="confirm item-w150">
								~{' '}
								{numberUtils
									.coinUSD(item?.amount * item?.price)
									.replace('USD', '')}
							</td>
							<td className="item-w100">
								{moment(item?.coin?.createdAt).format(
									'DD/MM/YYYY HH:mm:ss',
								)}
							</td>
							<td>
								<Link
									to={`${routers.sellCoinUser}/${item?._id}`}
									className={`${cx(
										'actions-item',
									)} cancelbgcbold fwb`}
								>
									Sell
								</Link>
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
				dataFlag={dataSettingFlag}
				dataHeaders={DataMyCoinsUser().headers}
				totalData={data?.total || data?.totalSearch}
				classNameButton="completebgc"
				isRefreshPage
			>
				<RenderBodyTable data={dataSettingFlag} />
			</General>
		</>
	);
}
