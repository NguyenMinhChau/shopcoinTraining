/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import className from 'classnames/bind';
import { useParams, useLocation } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Button, Icons, Image, SnackbarCp } from '../../components';
import moment from 'moment';
import { getDepositsWithdrawById } from '../../services/deposits';
import {
	useAppContext,
	textUtils,
	refreshPage,
	numberUtils,
} from '../../utils';
import styles from './DepositsWithdrawDetail.module.css';
import { getUserByIdNoCoin } from '../../services/users';

const cx = className.bind(styles);

function DepositsWithdrawDetail() {
	const { idDeposits, idWithdraw } = useParams();
	const { state, dispatch } = useAppContext();
	const location = useLocation();
	const {
		edit,
		userById,
		data: { dataUser },
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
				<div className="detail-title">{title}</div>
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
	const x = edit?.itemData;
	useEffect(() => {
		document.title = `Detail | ${process.env.REACT_APP_TITLE_WEB}`;
		getDepositsWithdrawById({
			idDeposits,
			idWithdraw,
			dispatch,
			state,
			setSnackbar,
		});
		if (x?.method && typeof x?.method === 'string') {
			getUserByIdNoCoin({
				idUser: x?.method,
				dispatch,
				setSnackbar,
			});
		}
	}, [x?.method]);
	const username = dataUser.find((item) => item?.payment?.email === x?.user)
		?.payment?.username;
	const URL_SERVER =
		process.env.REACT_APP_TYPE === 'development'
			? process.env.REACT_APP_URL_SERVER
			: process.env.REACT_APP_URL_SERVER_PRODUCTION;
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
			<div className={`${cx('info-container')}`}>
				<div className={`${cx('detail-container')}`}>
					<div className="detail-item">
						<div className="detail-title">Status</div>
						<div className={`${cx('detail-status')}`}>
							{x ? (
								<>
									<span
										className={`status fwb ${
											x?.status
												.toLowerCase()
												.replace(' ', '') + 'bgc'
										}`}
									>
										{textUtils.FirstUpc(x?.status)}
									</span>
								</>
							) : (
								<Skeleton width={50} />
							)}
						</div>
					</div>
					<ItemRender title="Username" info={username} />
					<ItemRender title="Email" info={x && x?.user} />
					<ItemRender title="Code" info={x && x?._id} />
					<ItemRender
						title="Created"
						info={
							x &&
							moment(x?.createdAt).format('DD/MM/YYYY HH:mm:ss')
						}
					/>
					<ItemRender
						title="Amount USDT"
						info={x && numberUtils.formatUSD(x?.amount || 0)}
					/>
					<ItemRender
						title="Amount VND"
						info={x && numberUtils.formatVND(x?.amount_vnd || 0)}
					/>
					<ItemRender title="Symbol" info={(x && x?.symbol) || 0} />
					<ItemRender
						title="Payment method"
						bankInfo
						methodBank={
							x && location.pathname.includes('withdraw')
								? x?.method &&
								  userById?.payment?.bank?.method_name
								: x?.method?.method_name
						}
						nameAccount={
							x && location.pathname.includes('withdraw')
								? x?.method &&
								  userById?.payment?.bank.account_name
								: x?.method?.account_name
						}
						numberAccount={
							x && location.pathname.includes('withdraw')
								? x?.method && userById?.payment?.bank?.number
								: x?.method?.number
						}
					/>
					{idDeposits && (
						<ItemRender
							title="Document"
							info={
								x && (
									<a
										href={`${URL_SERVER}${x?.statement}`}
										target="_blank"
									>
										{x.statement ? (
											x.statement.replace('/images/', '')
										) : (
											<Skeleton width="30px" />
										)}
									</a>
								)
							}
						/>
					)}
				</div>
				{idDeposits && (
					<div className={`${cx('detail-container')}`}>
						<div className={`${cx('document-review-container')}`}>
							<div className={`${cx('document-review-title')}`}>
								Document Review
							</div>
							{x?.statement ? (
								<div className={`${cx('document-container')}`}>
									<Image
										src={`${URL_SERVER}/${x?.statement}`}
										alt={x?.statement.replace(
											'/images/',
											'',
										)}
										className={`${cx(
											'document-review-image',
										)}`}
									/>
								</div>
							) : (
								<Skeleton width="100%" height="200px" />
							)}
						</div>
					</div>
				)}
			</div>
		</>
	);
}

export default DepositsWithdrawDetail;
