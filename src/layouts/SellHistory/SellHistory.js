/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import {View, Text, RefreshControl, FlatList} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useAppContext} from '../../utils/';
import {SVgetBuyHistory} from '../../services/bills';
import {BuySellHistoryDetail, NodataText} from '../../components';
import {routersMain} from '../../routers/Main';
import {routers} from '../../routers/Routers';
import styles from './SellHistoryCss';
import stylesGeneral from '../../styles/General';
import {setCurrentUser} from '../../app/payloads/user';
import {useToast} from 'native-base';
import requestRefreshToken from '../../utils/axios/refreshToken';
import moment from 'moment';

export default function SellHistory({navigation}) {
  const toast = useToast();
  const {state, dispatch} = useAppContext();
  const {
    currentUser,
    history: {dataBuyHistory},
  } = state;
  const [refreshing, setRefreshing] = useState(false);
  const getHistory = dataToken => {
    SVgetBuyHistory({
      toast,
      id_user: currentUser?.id,
      dispatch,
      token: dataToken?.token,
    });
  };
  useEffect(() => {
    requestRefreshToken(
      currentUser,
      getHistory,
      state,
      dispatch,
      setCurrentUser,
      toast,
      navigation,
    );
  }, []);
  const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    requestRefreshToken(
      currentUser,
      getHistory,
      state,
      dispatch,
      setCurrentUser,
      toast,
      navigation,
    );
    wait(2000).then(() => setRefreshing(false));
  }, []);
  const renderItem = ({item}) => {
    return <BuySellHistoryDetail item={item} style={{borderColor: 'red'}} />;
  };
  const DATA =
    dataBuyHistory?.sells?.sort((a, b) => {
      const momentA = moment(a.createdAt);
      const momentB = moment(b.createdAt);

      // Sort in descending order by subtracting b from a
      return momentB.diff(momentA);
    }) || [];
  return (
    <View style={[styles.container]}>
      <View style={[styles.btn_container, stylesGeneral.mb10]}>
        <View
          style={[styles.btn]}
          onTouchStart={() => {
            requestRefreshToken(
              currentUser,
              getHistory,
              state,
              dispatch,
              setCurrentUser,
              toast,
              navigation,
            );
            navigation.navigate(routers.History);
          }}>
          <Text style={[styles.btn_text, stylesGeneral.text_black]}>
            Buy History
          </Text>
        </View>
        <View
          style={[styles.btn]}
          onTouchStart={() => {
            requestRefreshToken(
              currentUser,
              getHistory,
              state,
              dispatch,
              setCurrentUser,
              toast,
              navigation,
            );
            navigation.navigate(routersMain.SellHistory);
          }}>
          <Text style={[styles.btn_text, stylesGeneral.text_black]}>
            Sell History
          </Text>
        </View>
      </View>
      <View style={[styles.listItem]}>
        {DATA?.length > 0 ? (
          <FlatList
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            data={DATA}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
          />
        ) : (
          <NodataText
            text="No History Sell Coin"
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        )}
      </View>
    </View>
  );
}
