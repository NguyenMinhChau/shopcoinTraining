/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/react-in-jsx-scope */
import {useCallback, useEffect, useState} from 'react';
import {Text, RefreshControl, View, FlatList} from 'react-native';
import {useAppContext} from '../../utils/';
import {SVgetBuyHistory, SVgetSellHistory} from '../../services/bills';
import {getHistoryBuy, getHistorySell} from '../../app/payloads/history';
import {routersMain} from '../../routers/Main';
import {routers} from '../../routers/Routers';
import styles from './BuyHistoryCss';
import stylesGeneral from '../../styles/General';
import {BuySellHistoryDetail, NodataText} from '../../components';
import {useToast} from 'native-base';
import requestRefreshToken from '../../utils/axios/refreshToken';
import {setCurrentUser} from '../../app/payloads/user';

const History = ({navigation}) => {
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
  const onRefresh = useCallback(() => {
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
    return <BuySellHistoryDetail item={item} />;
  };
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
        {dataBuyHistory?.buys?.length > 0 ? (
          <FlatList
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
            data={dataBuyHistory?.buys}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
          />
        ) : (
          <NodataText
            text="No History Buy Coin"
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        )}
      </View>
    </View>
  );
};

export default History;
