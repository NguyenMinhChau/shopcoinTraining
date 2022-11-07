/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
import React, {useEffect, useState} from 'react';
import {View, RefreshControl, FlatList} from 'react-native';
import {useAppContext} from '../../utils';
import {getAllCoins} from '../../app/payloads/getAll';
import {setSearchValue} from '../../app/payloads/search';
import {Search, Header, CoinDetail, NodataText} from '../../components';
import {SVgetAllCoins} from '../../services/coin';
import styles from './HomeCss';
import {getAsyncStore} from '../../utils/localStore/localStore';

const Home = ({navigation}) => {
  const {state, dispatch} = useAppContext();
  const {
    search,
    data: {dataCoins},
  } = state;
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = useState(1);
  const [show, setShow] = useState(dataCoins?.total || 10);
  useEffect(() => {
    getAsyncStore(dispatch);
  }, []);
  useEffect(() => {
    SVgetAllCoins({
      page,
      show: dataCoins?.total,
      dispatch,
      getAllCoins,
    });
  }, [page, show]);
  let data = dataCoins?.data || [];
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
      <Header />
      <View>
        <Search
          name="search"
          // value={search}
          onChange={handleChangeSearch}
        />
      </View>
      <View style={[styles.listCoin]}>
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
            contentContainerStyle={{flex: 1}}
            data={data}
            keyExtractor={(item, index) => item.symbol}
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
