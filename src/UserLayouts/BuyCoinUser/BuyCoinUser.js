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
        const res = await axiosUtils.coinGet(`/getCoin/${idCoin}`);
        setCoin(res.data);
    };
    const getUser = async () => {
        const process = await axiosUtils.adminGet(
            `/getUser/${currentUser?.id}`
        );
        setUser(process.data);
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
        const socket = socketIO(`${URL_SERVER}`, {
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
            gmailUser: currentUser?.email,
            amount: parseFloat(amountBuy),
            amountUsd: parseFloat(amountBuy) * parseFloat(priceSocket?.price),
            symbol: coin?.symbol,
            price: parseFloat(priceSocket?.price),
            token: data?.token,
            actions,
            dispatch,
            setIsProcess,
            history,
        });
    };
    const handleSubmit = useCallback(async () => {
        await 1;
        setIsProcess(true);
        setTimeout(() => {
            requestRefreshToken(
                currentUser,
                handleBuyAPI,
                state,
                dispatch,
                actions
            );
        }, 3000);
    }, [coin?.symbol, priceSocket?.price, amountBuy, currentUser, isProcess]);
    const suggestMin = numberUtils.precisionRound(
        parseFloat(10 / priceSocket?.price || 0)
    );
    const suggestMax = numberUtils.precisionRound(
        parseFloat(user?.Wallet?.balance / priceSocket?.price || 0)
    );
    const isDisabled = amountBuy < suggestMin || amountBuy > suggestMax;
    const amountUsd = numberUtils
        .coinUSD(numberUtils.precisionRound(amountBuy * coin?.price))
        .replace('USD', '');
    return (
        <>
            <Button
                className='confirmbgc mb8'
                onClick={refreshPage.refreshPage}
            >
                <div className='flex-center'>
                    <Icons.RefreshIcon className='fz12 mr8' />
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
                            ''
                        )}`}
                        alt=''
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
                                {priceSocket?.price || '---'}
                            </div>
                        </div>
                        <div
                            className={`${cx(
                                'detail-item',
                                'detail-item-custom'
                            )}`}
                        >
                            <FormInput
                                type='text'
                                label='Amount Buy'
                                placeholder='Enter amount buy'
                                onChange={handleChange}
                            />
                            {amountBuy && (
                                <>
                                    <div>Suggest Amount</div>
                                    <div className='vip'>Min: {suggestMin}</div>
                                    <div className='cancel'>
                                        Max: {suggestMax}
                                    </div>
                                    <div
                                        className={`${cx(
                                            'item-desc'
                                        )} fwb complete`}
                                    >
                                        Amount USD: {amountUsd}
                                    </div>{' '}
                                </>
                            )}
                        </div>
                        <Button
                            className='confirmbgc w100'
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
