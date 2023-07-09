/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useState } from 'react';
import className from 'classnames/bind';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './SellCoinUser.module.css';
import socketIO from 'socket.io-client';
import { Button, FormInput, Icons, Image } from '../../components';
import {
	axiosUtils,
	numberUtils,
	refreshPage,
	requestRefreshToken,
	useAppContext,
} from '../../utils';
import { actions } from '../../app/';
import { handleSellCoin } from '../../services/coins';

const cx = className.bind(styles);

export default function SellCoinUser() {
	const { state, dispatch } = useAppContext();
	const { currentUser } = state.set;
	const { idCoin } = useParams();
	const history = useNavigate();
	const [isProcess, setIsProcess] = useState(null);
	const [isProcessAll, setIsProcessAll] = useState(null);
	const [coin, setCoin] = useState([]);
	const [coinById, setCoinById] = useState(null);
	const [amountSell, setAmountSell] = useState();
	const [priceSocket, setPriceSocket] = useState(0);
	const getCoinBySymbol = async () => {
		const resGet = await axiosUtils.coinGet(`${idCoin}`);
		setCoin(resGet.metadata);
		const resGetAllCoin = await axiosUtils.userGet(
			`coin/own/${currentUser?.id}`,
		);
		const coinById = resGetAllCoin?.metadata?.find(
			(item) => item?._id === resGet.metadata._id,
		);
		setCoinById(coinById);
	};
	useEffect(() => {
		getCoinBySymbol();
	}, []);
	useEffect(() => {
		const socket = socketIO(`${process.env.REACT_APP_URL_SOCKET}`, {
			jsonp: false,
		});
		socket.on(`send-data-${coin?.symbol}`, (data) => {
			setPriceSocket(data);
		});
		return () => {
			socket.disconnect();
			socket.close();
		};
	}, [coin?.symbol]);
	const handleChange = useCallback((e) => {
		setAmountSell(e.target.value);
	}, []);
	const sellCoinAPI = (data) => {
		handleSellCoin({
			id_user: currentUser?.id,
			amount: amountSell ? amountSell : coinById?.amount,
			amountUsd:
				priceSocket * (amountSell ? amountSell : coinById?.amount),
			symbol: coin?.symbol,
			price: priceSocket,
			token: data?.token,
			dispatch,
			actions,
			history,
			setIsProcess,
			setIsProcessAll,
			setAmountSell,
		});
	};
	const handleSubmit = useCallback(async () => {
		if (amountSell) {
			setIsProcess(true);
		} else {
			setIsProcessAll(true);
		}
		requestRefreshToken(currentUser, sellCoinAPI, state, dispatch, actions);
	}, [amountSell, coin, coinById, currentUser, dispatch, state]);
	const isDisabled = amountSell < 0.1 || amountSell > coinById?.amount;
	const URL_SERVER =
		process.env.REACT_APP_TYPE === 'development'
			? process.env.REACT_APP_URL_SERVER
			: process.env.REACT_APP_URL_SERVER_PRODUCTION;
	return (
		<>
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
					<Image
						src={`${URL_SERVER}${coin?.logo?.replace(
							'uploads/',
							'',
						)}`}
						alt=""
						className={`${cx('image-coin')}`}
					/>
					<div className={`${cx('info-detail')}`}>
						<div className={`${cx('detail-item')}`}>
							<div className={`${cx('item-title')}`}>Symbol</div>
							<div className={`${cx('item-desc')}`}>
								{coin?.name}
							</div>
						</div>
						<div className={`${cx('detail-item')}`}>
							<div className={`${cx('item-title')}`}>
								Full name
							</div>
							<div className={`${cx('item-desc')}`}>
								{coin?.fullName}
							</div>
						</div>
						<div className={`${cx('detail-item')}`}>
							<div className={`${cx('item-title')}`}>
								Quantity
							</div>
							<div className={`${cx('item-desc')} confirm`}>
								{coinById?.amount || '---'}
							</div>
						</div>
						<div className={`${cx('detail-item')}`}>
							<div className={`${cx('item-title')}`}>USD</div>
							<div className={`${cx('item-desc')} complete`}>
								{priceSocket
									? '~ ' +
											numberUtils
												.coinUSD(
													coinById?.amount *
														priceSocket,
												)
												.replace('USD', '') || '---'
									: 'Processing price...'}
							</div>
						</div>
						<div className={`${cx('detail-item')}`}>
							<div className={`${cx('item-title')}`}>
								Coin price
							</div>
							<div className={`${cx('item-desc')} vip`}>
								{priceSocket || 'Processing price...'}
							</div>
						</div>
						<div
							className={`${cx(
								'detail-item',
								'detail-item-custom',
							)}`}
						>
							<FormInput
								type="text"
								label="Amount Sell"
								placeholder="Enter amount sell"
								onChange={handleChange}
							/>
							{amountSell && priceSocket ? (
								<>
									<div>Suggest Amount</div>
									<div className="vip">Min: 0.1</div>
									<div className="cancel">
										Max: {coinById?.amount}
									</div>
									<div
										className={`${cx(
											'item-desc',
										)} fwb complete`}
									>
										Receive:{' '}
										{numberUtils.coinUSD(
											amountSell * priceSocket,
										)}
									</div>{' '}
								</>
							) : (
								!priceSocket && (
									<div>Please wait for pricing...</div>
								)
							)}
						</div>
						<div className={`${cx('btn-container')}`}>
							<Button
								className="confirmbgc w100"
								disabled={
									!amountSell ||
									isDisabled ||
									isProcess ||
									!priceSocket
								}
								isProcess={isProcess}
								onClick={handleSubmit}
							>
								Submit
							</Button>
							<Button
								className="vipbgc w100"
								disabled={isProcessAll || !priceSocket}
								onClick={handleSubmit}
								isProcess={isProcessAll}
							>
								Sell All
							</Button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
