/* eslint-disable prettier/prettier */
import {View} from 'react-native';
import React from 'react';
import {dateFormat} from '../../utils/format/Date';
import stylesStatus from '../../styles/Status';
import {formatUSDT} from '../../utils/format/Money';
import styles from './BuySellHistoryDetailCss';
import {removeUSDT} from '../../utils/format/removeUSDT';
import {textLower} from '../../utils/format/textLowercase';
import RowDetail from '../RowDetail/RowDetail';

export default function BuySellHistoryDetail({item, style}) {
  return (
    <View style={[styles.item, {...style}]}>
      <RowDetail
        title={removeUSDT(item?.symbol)}
        text={dateFormat(item?.createdAt, 'DD/MM/YYYY HH:mm:ss')}
        noneBorderBottom
      />
      <RowDetail
        noneBorderBottom
        title="Status"
        text={item?.status}
        styleDesc={[
          stylesStatus.status,
          textLower(item?.status) === 'onhold'
            ? stylesStatus.vipbgc
            : textLower(item?.status) === 'completed' ||
              textLower(item?.status) === 'complete'
            ? stylesStatus.completebgc
            : textLower(item?.status) === 'canceled' ||
              textLower(item?.status) === 'cancel'
            ? stylesStatus.cancelbgc
            : textLower(item?.status) === 'confirmed' ||
              textLower(item?.status) === 'confirm'
            ? stylesStatus.confirmbgc
            : stylesStatus.demobgc,
        ]}
      />
      <RowDetail title="Amount" text={item?.amount} noneBorderBottom />
      <RowDetail
        noneBorderBottom
        title="USDT"
        text={`~ ${removeUSDT(formatUSDT(item?.amount_usd))}`}
      />
    </View>
  );
}
