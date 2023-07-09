/* eslint-disable prettier/prettier */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/react-in-jsx-scope */
import {useCallback, useEffect, useState} from 'react';
import {Text, RefreshControl, View, FlatList} from 'react-native';
import {Header, ImageCp, NodataText} from '../../components';
import {useAppContext} from '../../utils';
import {formatUSDT} from '../../utils/format/Money';
import {getAllMyCoin} from '../../app/payloads/getAll';
import {SVgetAllMyCoin} from '../../services/coin';
import {routersMain} from '../../routers/Main';
import styles from './MyCoinCss';
import stylesGeneral from '../../styles/General';
import stylesStatus from '../../styles/Status';
import socketIO from 'socket.io-client';
import {URL_SERVER} from '@env';
import {useToast} from 'native-base';
import requestRefreshToken from '../../utils/axios/refreshToken';
import {setCurrentUser} from '../../app/payloads/user';

const MyCoin = ({navigation}) => {
  const toast = useToast();
  const {state, dispatch} = useAppContext();
  const {
    currentUser,
    data: {dataMyCoin},
  } = state;
  const [refreshing, setRefreshing] = useState(false);
  const [dataSocket, setDataSocket] = useState([]);
  const data = dataMyCoin || [];
  const getMyCoin = dataToken => {
    SVgetAllMyCoin({
      toast,
      id_user: currentUser?.id,
      dispatch,
      token: dataToken?.token,
    });
  };
  useEffect(() => {
    requestRefreshToken(
      currentUser,
      getMyCoin,
      state,
      dispatch,
      setCurrentUser,
      toast,
      navigation,
    );
  }, []);
  const refreshData = () => {
    requestRefreshToken(
      currentUser,
      getMyCoin,
      state,
      dispatch,
      setCurrentUser,
      toast,
      navigation,
    );
  };
  const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    requestRefreshToken(
      currentUser,
      getMyCoin,
      state,
      dispatch,
      setCurrentUser,
      toast,
      navigation,
    );
    wait(2000).then(() => setRefreshing(false));
  }, []);
  const renderItem = ({item}) => {
    return (
      <View style={[styles.coinItem]}>
        <View style={[stylesGeneral.flexRow, stylesGeneral.flexCenter]}>
          <View style={[styles.coinItem_Image]}>
            <ImageCp uri={item?.logo} />
          </View>
          <View style={[styles.coinItem_Info, stylesGeneral.ml12]}>
            <Text style={[styles.coinItem_Info_name, stylesGeneral.text_black]}>
              {item?.symbol?.replace('USDT', '')}
            </Text>
          </View>
        </View>
        <View style={[styles.coinItem_Price]}>
          <View>
            <Text
              style={[styles.coinItem_Price_text, stylesGeneral.text_black]}>
              Qty: {item?.amount}
            </Text>
          </View>
          <View>
            <Text
              style={[styles.coinItem_Price_text, stylesGeneral.text_black]}>
              USD: ~{' '}
              {formatUSDT(item?.amount * item?.price).replace('USD', '')}
            </Text>
          </View>
        </View>
        <View
          style={[styles.coinItem_Btn]}
          onTouchStart={() =>
            navigation.navigate({
              name: routersMain.SellCoin,
              params: {
                id: item?._id,
                item: item,
                symbol: item?.symbol,
              },
            })
          }>
          <Text style={[stylesStatus.cancelbgcbold, styles.btn]}>Sell</Text>
        </View>
      </View>
    );
  };
  return (
    <View style={[styles.container]}>
      <Header refreshData={refreshData} />
      <Text style={[styles.text_desc, stylesStatus.confirm]}>
        Note: Coin prices in the list are updated every 5 minutes.
      </Text>
      <View style={[styles.listCoin]}>
        {data?.length > 0 ? (
          <FlatList
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            data={data}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
          />
        ) : (
          <NodataText
            text="No coin"
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        )}
      </View>
    </View>
  );
};

export default MyCoin;
