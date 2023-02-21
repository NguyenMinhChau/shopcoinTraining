/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {View, RefreshControl, FlatList, Platform, Text} from 'react-native';
import {useAppContext} from '../../utils';
import {getAllCoins} from '../../app/payloads/getAll';
import {setSearchValue} from '../../app/payloads/search';
import {Search, Header, CoinDetail, NodataText} from '../../components';
import {SVgetAllCoins} from '../../services/coin';
import styles from './HomeCss';
import DeviceInfo from 'react-native-device-info';

const Home = ({navigation}) => {
  // const VERSION_NUMBER_OLD = DeviceInfo.getVersion();
  // const VERSION_CODE_OLD = DeviceInfo.getBuildNumber();
  const {state, dispatch} = useAppContext();
  const {
    currentUser,
    search,
    data: {dataCoins},
  } = state;
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = useState(1);
  const [show, setShow] = useState(dataCoins?.data?.total || 10);
  // get version build on PlayStore of app
  useEffect(() => {
    dispatch(setSearchValue(''));
  }, []);
  useEffect(() => {
    SVgetAllCoins({
      page,
      show: dataCoins?.data?.total,
      dispatch,
      getAllCoins,
      email: currentUser?.email,
    });
  }, [page, show]);
  const refreshData = () => {
    SVgetAllCoins({
      page,
      show: dataCoins?.data?.total,
      dispatch,
      getAllCoins,
    });
    dispatch(setSearchValue(''));
  };
  let data = dataCoins?.data?.coins || [];
  if (search) {
    data = data.filter(item => {
      return item?.symbol?.toLowerCase().includes(search?.toLowerCase());
    });
  }
  let stopLoadingData = true;
  const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    SVgetAllCoins({
      page,
      show: dataCoins?.total,
      dispatch,
      getAllCoins,
    });
    dispatch(setSearchValue(''));
    wait(2000).then(() => {
      setRefreshing(false);
    });
  }, []);
  const handleEndReached = async () => {
    setLoading(true);
    if (!stopLoadingData) {
      await 1;
      setShow(dataCoins?.total);
      SVgetAllCoins({
        page,
        show: dataCoins?.total,
        dispatch,
        getAllCoins,
      });
      stopLoadingData = true;
    }
    setLoading(false);
  };
  const renderItem = ({item}) => {
    return <CoinDetail item={item} navigation={navigation} />;
  };
  const handleChangeSearch = (name, val) => {
    dispatch(setSearchValue(val));
  };
  return (
    <View style={[styles.container]}>
      <Header refreshData={refreshData} />
      <View>
        <Search name="search" value={search} onChange={handleChangeSearch} />
      </View>
      <View
        style={
          ([styles.listCoin], {marginBottom: Platform.OS === 'ios' ? 130 : 145})
        }>
        {data.length > 0 ? (
          <FlatList
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            onEndReached={handleEndReached}
            onScroll={handleEndReached}
            onEndReachedThreshold={0.5}
            onScrollBeginDrag={() => (stopLoadingData = false)}
            // contentContainerStyle={{flex: 1}}
            data={data}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
          />
        ) : (
          <NodataText text="No data" />
        )}
      </View>
    </View>
  );
};

export default Home;
