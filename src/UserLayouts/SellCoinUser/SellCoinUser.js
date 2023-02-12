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
        const resGet = await axiosUtils.coinGet(`/getCoinSymbol/${idCoin}`);
        setCoin(resGet.data);
        const resGetAllCoin = await axiosUtils.userGet(
            `/getAllCoinOfUser/${currentUser?.id}`
        );

        const coinById = resGetAllCoin?.data?.coins?.find(
            (item) => item?.coin?._id === resGet.data._id
        );
        setCoinById(coinById);
    };
    useEffect(() => {
        getCoinBySymbol();
    }, []);
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
        setAmountSell(e.target.value);
    }, []);
    const sellCoinAPI = (data) => {
        handleSellCoin({
            gmailUser: currentUser?.email,
            amount: amountSell ? amountSell : coinById?.amount,
            amountUsd:
                priceSocket?.price *
                (amountSell ? amountSell : coinById?.amount),
            symbol: coin?.symbol,
            price: priceSocket?.price,
            token: data?.token,
            dispatch,
            actions,
            history,
            setIsProcess,
            setIsProcessAll,
        });
    };
    const handleSubmit = useCallback(async () => {
        try {
            await 1;
            if (amountSell) {
                setIsProcess(true);
            } else {
                setIsProcessAll(true);
            }
            setTimeout(() => {
                requestRefreshToken(
                    currentUser,
                    sellCoinAPI,
                    state,
                    dispatch,
                    actions
                );
                dispatch(setAmountSell(''));
            }, 3000);
        } catch (err) {
            console.log(err);
        }
    }, [amountSell, coin, coinById, currentUser, dispatch, state]);
    const isDisabled = amountSell < 0.1 || amountSell > coinById?.amount;
    const URL_SERVER =
        process.env.REACT_APP_TYPE === 'development'
            ? process.env.REACT_APP_URL_SERVER
            : process.env.REACT_APP_URL_SERVER_PRODUCTION;
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
                                {'~ ' +
                                    numberUtils
                                        .coinUSD(
                                            coinById?.amount *
                                                priceSocket?.price
                                        )
                                        .replace('USD', '') || '---'}
                            </div>
                        </div>
                        <div className={`${cx('detail-item')}`}>
                            <div className={`${cx('item-title')}`}>
                                Coin price
                            </div>
                            <div className={`${cx('item-desc')} vip`}>
                                {priceSocket?.price}
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
                                label='Amount Sell'
                                placeholder='Enter amount sell'
                                onChange={handleChange}
                            />
                            {amountSell && (
                                <>
                                    <div>Suggest Amount</div>
                                    <div className='vip'>Min: 0.1</div>
                                    <div className='cancel'>
                                        Max: {coinById?.amount}
                                    </div>
                                    <div
                                        className={`${cx(
                                            'item-desc'
                                        )} fwb complete`}
                                    >
                                        Receive:{' '}
                                        {numberUtils.coinUSD(
                                            amountSell * priceSocket?.price
                                        )}
                                    </div>{' '}
                                </>
                            )}
                        </div>
                        <div className={`${cx('btn-container')}`}>
                            <Button
                                className='confirmbgc w100'
                                disabled={
                                    !amountSell || isDisabled || isProcess
                                }
                                isProcess={isProcess}
                                onClick={handleSubmit}
                            >
                                Submit
                            </Button>
                            <Button
                                className='vipbgc w100'
                                disabled={isProcessAll}
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
