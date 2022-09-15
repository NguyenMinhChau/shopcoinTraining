/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import className from 'classnames/bind';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { FormInput, Button, Icons } from '../../components';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import {
    handleUpdateRankFeeUser,
    checkErrorUsers,
    getUserById,
} from '../../services/users';
import { useAppContext, requestRefreshToken } from '../../utils';
import { actions } from '../../app/';
import styles from './UserDetail.module.css';

const cx = className.bind(styles);

function UserDetail() {
    const { idUser } = useParams();
    const { state, dispatch } = useAppContext();
    const {
        edit,
        currentUser,
        pagination: { page, show },
    } = state.set;
    const [feeValue, setFeeValue] = useState(
        edit?.itemData && edit.itemData.fee
    );
    useEffect(() => {
        document.title = 'Detail | Shop Coin';
        getUserById({ idUser, dispatch, state, actions });
    }, []);
    const changeFee = (e) => {
        setFeeValue(e.target.value);
    };
    const handleUpdateFee = async (data, id) => {
        await handleUpdateRankFeeUser({
            data,
            id,
            dispatch,
            state,
            actions,
            page,
            show,
            fee: parseFloat(feeValue),
        });
    };
    const updateFee = async (id) => {
        try {
            console.log(parseFloat(feeValue));
            requestRefreshToken(
                currentUser,
                handleUpdateFee,
                state,
                dispatch,
                actions,
                id
            );
        } catch (err) {
            checkErrorUsers(err, dispatch, state, actions);
        }
    };
    function ItemRender({ title, info, feeCustom }) {
        return (
            <div className={`${cx('detail-item')}`}>
                <div className={`${cx('detail-title')}`}>{title}</div>
                <div className={`${cx('detail-status')}`}>
                    <span className={`${cx('info')}`}>
                        {info ? info : 0.15}
                    </span>
                </div>
            </div>
        );
    }
    return (
        <div className={`${cx('buySellDetail-container')}`}>
            <div className={`${cx('detail-container')}`}>
                <div className={`${cx('detail-item')}`}>
                    <div className={`${cx('detail-title')}`}>Rank</div>
                    <div className={`${cx('detail-status')}`}>
                        {edit?.itemData ? (
                            <>
                                <span
                                    className={`status fwb ${edit.itemData.rank
                                        .toLowerCase()
                                        .replace(' ', '')}`}
                                >
                                    {edit.itemData.rank}
                                </span>
                            </>
                        ) : (
                            <Skeleton width={50} />
                        )}
                    </div>
                </div>
                <ItemRender
                    title='Username'
                    info={edit?.itemData && edit.itemData.payment.username}
                />
                <ItemRender
                    title='Email'
                    info={edit?.itemData && edit.itemData.payment.email}
                />
                <ItemRender
                    title='Rule'
                    info={edit?.itemData && edit.itemData.payment.rule}
                />
                <ItemRender
                    title='Bank Name'
                    info={edit?.itemData && edit.itemData.payment.bank.bankName}
                />
                <ItemRender
                    feeCustom
                    title='Fee'
                    info={edit?.itemData && edit.itemData.fee}
                />
                <ItemRender
                    title='Created At'
                    info={
                        edit?.itemData &&
                        moment(edit.itemData.createAt).format('DD/MM/YYYY')
                    }
                />
            </div>
            <div className={`${cx('detail-container')}`}>
                <div className={`${cx('detail-item', 'center')}`}>
                        <FormInput
                            type='text'
                            name='fee'
                            placeholder='Fee'
                            classNameInput={`${cx('fee-input')}`}
                            label='Change Fee'
                            value={feeValue}
                            onChange={changeFee}
                        />
                    <Button onClick={() => updateFee(idUser)} className={`${cx('btn')}`}>Update</Button>
                </div>
                <div className={`${cx('detail-item', 'custom')}`}>
                    <label className={`${cx('label')}`}>Change Coin</label>
                    <div className={`${cx('detail-coins-list')}`}>
                        <div className={`${cx('coins-list-container')}`}>
                            <div className={`${cx('coins-value')}`}>
                                BTC
                            </div>
                            <Icons.SelectOptionArrowIcon />
                            <div className={`${cx('coins-list')}`}>
                                <div className={`${cx('coins-item')}`}>ETC</div>
                                <div className={`${cx('coins-item')}`}>ABC</div>
                                <div className={`${cx('coins-item')}`}>DEF</div>
                                <div className={`${cx('coins-item')}`}>USDT</div>
                            </div>
                        </div>
                        <FormInput
                            type='text'
                            name='Gift'
                            placeholder='Quantity'
                            classNameInput={`${cx('fee-input')} mb0 mt0`}
                            classNameField={`${cx('fee-field')}`}
                            // value={feeValue}
                            // onChange={changeFee}
                        />
                    </div>
                </div>
                <div className={`${cx('detail-item', 'left')}`}>
                    <Button>Change</Button>
                </div>
            </div>
            <div>
                <Button className={`${cx('block')}`}>Block User</Button>
                <Button className={`${cx('refresh')}`}>Refresh Password</Button>
            </div>
        </div>
    );
}

export default UserDetail;
