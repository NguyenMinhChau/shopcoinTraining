/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useCallback } from 'react';
import className from 'classnames/bind';
import { useParams, useNavigate } from 'react-router-dom';
import socketIO from 'socket.io-client';
import styles from './BuyCoinUser.module.css';
import { Button, FormInput, Icons, Image } from '../../components';
import {
	axiosUtils,
	numberUtils,
	refreshPage,
	requestRefreshToken,
	useAppContext,
} from '../../utils';
import { actions } from '../../app/';
import { handleBuyCoin } from '../../services/coins';

const cx = className.bind(styles);

export default function BuyCoinUser() {
	const { state, dispatch } = useAppContext();
	const { currentUser } = state.set;
	const { idCoin } = useParams();
	const [isProcess, setIsProcess] = useState(false);
	const [coin, setCoin] = useState(null);
	const [user, setUser] = useState(null);
	const [amountBuy, setAmountBuy] = useState();
	const [priceSocket, setPriceSocket] = useState(0);
	const history = useNavigate();
	const getCoinById = async () => {
		const res = await axiosUtils.coinGet(`${idCoin}`);
		setCoin(res.metadata);
	};
	const getUser = async () => {
		const res = await axiosUtils.adminGet(`user/${currentUser?.id}`);
		setUser(res.metadata);
	};
	useEffect(() => {
		getCoinById();
		getUser();
	}, []);
	const URL_SERVER =
		process.env.REACT_APP_TYPE === 'development'
			? process.env.REACT_APP_URL_SERVER
			: process.env.REACT_APP_URL_SERVER_PRODUCTION;
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
		setAmountBuy(e.target.value);
	}, []);
	const handleBuyAPI = (data) => {
		handleBuyCoin({
			idUser: currentUser?.id,
			symbol: coin?.symbol,
			amount: parseFloat(amountBuy),
			price: parseFloat(priceSocket),
			date: new Date(),
			token: data?.token,
			setIsProcess,
			history,
		});
	};
	const handleSubmit = useCallback(async () => {
		setIsProcess(true);
		requestRefreshToken(
			currentUser,
			handleBuyAPI,
			state,
			dispatch,
			actions,
		);
	}, [
		coin?.symbol,
		parseFloat(priceSocket),
		amountBuy,
		currentUser,
		isProcess,
	]);
	const suggestMin = numberUtils.precisionRound(
		parseFloat(10 / parseFloat(priceSocket) || 0),
	);
	const suggestMax = numberUtils.precisionRound(
		parseFloat(user?.Wallet?.balance / parseFloat(priceSocket) || 0),
	);
	const isDisabled =
		amountBuy < suggestMin || amountBuy > suggestMax || !priceSocket;
	const amountUsd = numberUtils
		.coinUSD(
			numberUtils.precisionRound(amountBuy * parseFloat(priceSocket)),
		)
		.replace('USD', '');
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
						// src={`${URL_SERVER}${coin?.logo?.replace(
						// 	'uploads/',
						// 	'',
						// )}`}
						src="https://avatars.githubusercontent.com/u/81848005?v=4"
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
							<div className={`${cx('item-title')}`}>Price</div>
							<div className={`${cx('item-desc')} confirm`}>
								{parseFloat(priceSocket) || '---'}
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
								label="Amount Buy"
								placeholder="Enter amount buy"
								onChange={handleChange}
							/>
							{amountBuy && priceSocket ? (
								<>
									<div>Suggest Amount</div>
									<div className="vip">Min: {suggestMin}</div>
									<div className="cancel">
										Max: {suggestMax}
									</div>
									<div
										className={`${cx(
											'item-desc',
										)} fwb complete`}
									>
										Amount USD: {amountUsd}
									</div>{' '}
								</>
							) : (
								!priceSocket && (
									<div>Please wait for pricing...</div>
								)
							)}
						</div>
						<Button
							className="confirmbgc w100"
							disabled={!amountBuy || isDisabled || isProcess}
							isProcess={isProcess}
							onClick={handleSubmit}
						>
							Submit
						</Button>
					</div>
				</div>
			</div>
		</>
	);
}
