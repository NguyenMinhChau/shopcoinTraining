/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import className from 'classnames/bind';
import { useLocation, useParams } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import moment from 'moment';
import { Button, Icons, SnackbarCp } from '../../components';
import { getBuySellById } from '../../services/buy';
import 'react-loading-skeleton/dist/skeleton.css';
import {
	useAppContext,
	textUtils,
	refreshPage,
	numberUtils,
} from '../../utils';
import styles from './BuySellDetail.module.css';

const cx = className.bind(styles);

function BuySellDetail() {
	const { idBuy, idSell } = useParams();
	const { pathname } = useLocation();
	const { state, dispatch } = useAppContext();
	const { edit } = state.set;
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
		document.title = `Detail | ${process.env.REACT_APP_TITLE_WEB}`;
		getBuySellById({ idBuy, idSell, dispatch, state, setSnackbar });
	}, []);
	function ItemRender({ title, info, feeCustom }) {
		return (
			<div className="detail-item">
				<div className="detail-title">{title}</div>
				<div className={`${cx('detail-status')}`}>
					<span className="info">
						{info || info === 0 ? info : <Skeleton width={30} />}
					</span>
				</div>
			</div>
		);
	}
	const x = edit?.itemData;
	return (
		<>
			<SnackbarCp
				openSnackbar={snackbar.open}
				handleCloseSnackbar={handleCloseSnackbar}
				messageSnackbar={snackbar.message}
				typeSnackbar={snackbar.type}
			/>
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
			<div className="detail-container">
				<div className="detail-item">
					<div className="detail-title">Status</div>
					<div className={`${cx('detail-status')}`}>
						{x ? (
							<>
								<span
									className={`status fwb ${
										x.status
											.toLowerCase()
											.replace(' ', '') + 'bgc'
									}`}
								>
									{textUtils.FirstUpc(x.status)}
								</span>
							</>
						) : (
							<Skeleton width={50} />
						)}
					</div>
				</div>
				<ItemRender title="Email" info={x && x.buyer.gmailUSer} />
				<ItemRender
					title="Created"
					info={
						x && moment(x.createdAt).format('DD/MM/YYYY HH:mm:ss')
					}
				/>
				<ItemRender title="Symbol" info={x && x.symbol} />
				<ItemRender
					title="Sent"
					info={
						x && pathname.includes('sell')
							? x?.amount
							: numberUtils.formatUSD(x?.amountUsd)
					}
				/>
				<ItemRender
					title={`${
						pathname.includes('sell') ? 'Sell' : 'Buy'
					} price`}
					info={x && numberUtils.formatUSD(x.price)}
				/>
				<ItemRender
					title="Received"
					info={
						x && pathname.includes('buy')
							? x?.amount
							: numberUtils.formatUSD(x?.amountUsd)
					}
				/>
				<ItemRender title="Fee" info={x && x.fee} feeCustom />
			</div>
		</>
	);
}

export default BuySellDetail;
