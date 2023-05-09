/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import className from 'classnames/bind';
import styles from './BuyHistoryUser.module.css';
import {
    axiosUtils,
    DataBuyHistoryUser,
    handleUtils,
    numberUtils,
    textUtils,
    useAppContext,
    useDebounce,
} from '../../utils';
import { General } from '../../Layouts';
import moment from 'moment';
import { actions } from '../../app/';

const cx = className.bind(styles);

export default function BuyHistoryUser() {
    const { state, dispatch } = useAppContext();
    const {
        currentUser,
        searchValues: { buyHistory },
        pagination: { page, show },
    } = state.set;
    const [data, setData] = useState([]);
    const debounceValue = useDebounce(buyHistory, 500);
    useEffect(() => {
        if (debounceValue) {
            setTimeout(() => {
                dispatch(
                    actions.setData({
                        pagination: { page: 1, show: 10 },
                    })
                );
            }, 500);
        }
    }, [debounceValue]);
    const getDataBuyHistory = async () => {
        const resGet = await axiosUtils.userGet(
            buyHistory
                ? `/getAllBuy/${currentUser?.id}?page=${page}&show=${show}&search=${buyHistory}`
                : `/getAllBuy/${currentUser?.id}?page=${page}&show=${show}`
        );
        setData(resGet.data);
    };
    useEffect(() => {
        getDataBuyHistory();
    }, [page, show, debounceValue]);
    function RenderBodyTable({ data }) {
        return (
            <>
                {data.map((item, index) => {
                    return (
                        <tr key={index}>
                            <td>{handleUtils.indexTable(page, show, index)}</td>
                            <td className='item-w150'>{item?.symbol.replace('USDT', '')}</td>
                            <td className='vip item-w150'>{item?.amount}</td>
                            <td className='confirm item-w100'>
                                {item?.price?.toFixed(5) || '---'}
                            </td>
                            <td className='complete item-w150'>
                                {'~ ' + numberUtils.coinUSD(item?.amountUsd).replace('USD', '')}
                            </td>
                            <td className='item-w100'>
                                {moment(item?.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                            </td>
                            <td className='flex-center'>
                                <span className={`status ${item?.status?.toLowerCase() + 'bgc'}`}>
                                    {textUtils.FirstUpc(item?.status)}
                                </span>
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
                valueSearch={buyHistory}
                nameSearch='buyHistory'
                dataFlag={data?.buys || []}
                dataHeaders={DataBuyHistoryUser().headers}
                totalData={data?.total || data?.totalSearch}
                classNameButton='completebgc'
                isRefreshPage
                noActions>
                <RenderBodyTable data={data?.buys || []} />
            </General>
        </>
    );
}
