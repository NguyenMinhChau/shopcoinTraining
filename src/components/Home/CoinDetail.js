/* eslint-disable prettier/prettier */
import {View, Text} from 'react-native';
import React from 'react';
import ImageCp from '../Image/Image';
import Skeleton from '../Skeleton/Skeleton';
import {removeUSDT} from '../../utils/format/removeUSDT';
import styles from './CoinDetailCss';
import stylesGeneral from '../../styles/General';
import stylesStatus from '../../styles/Status';
import {setPriceCoinSocket} from '../../app/payloads/socket';
import {useAppContext} from '../../utils';

export default function CoinDetail({item, navigation}) {
  const {dispatch} = useAppContext();
  return (
    <View style={[styles.coinItem]}>
      <View style={[stylesGeneral.flexRow]}>
        <View style={[styles.coinItem_Image]}>
          <ImageCp uri={item?.logo} />
        </View>
        <View style={[styles.coinItem_Info, stylesGeneral.ml12]}>
          <Text style={[styles.coinItem_Info_name, stylesGeneral.text_black]}>
            {removeUSDT(item?.symbol)}
          </Text>
          <Text style={[styles.coinItem_Info_quantity]}>
            {item?.price ? item?.price : 0}
          </Text>
        </View>
      </View>
      <View style={[styles.coinItem_Price]}>
        <View style={[styles.coinItem_Price_text, stylesGeneral.flexCenter]}>
          <Text
            style={[
              stylesGeneral.mw50,
              stylesGeneral.fwbold,
              stylesGeneral.text_black,
            ]}>
            High:{' '}
          </Text>
          {item?.high ? (
            <Text style={[stylesGeneral.fwbold, stylesStatus.complete]}>
              {item?.high}
            </Text>
          ) : (
            <Skeleton />
          )}
        </View>
        <View style={[styles.coinItem_Price_text, stylesGeneral.flexCenter]}>
          <Text
            style={[
              stylesGeneral.mw50,
              stylesGeneral.fwbold,
              stylesGeneral.text_black,
            ]}>
            Low:{' '}
          </Text>
          {item?.low ? (
            <Text style={[stylesGeneral.fwbold, stylesStatus.cancel]}>
              {item?.low}
            </Text>
          ) : (
            <Skeleton />
          )}
        </View>
      </View>
      <View
        style={[styles.coinItem_Btn]}
        onTouchStart={() => {
          dispatch(setPriceCoinSocket(null));
          navigation.navigate({
            name: 'Buy Coin',
            params: {
              id: item?._id,
            },
          });
        }}>
        <Text style={[stylesStatus.completebgcbold, styles.btn]}>Buy</Text>
      </View>
    </View>
  );
}
