/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect} from 'react';
import {View, RefreshControl, FlatList, Platform} from 'react-native';
import {useAppContext} from '../../utils';
import {getAllCoins} from '../../app/payloads/getAll';
import {setSearchValue} from '../../app/payloads/search';
import {Search, Header, CoinDetail, NodataText} from '../../components';
import {SVgetAllCoins} from '../../services/coin';
import styles from './HomeCss';
import {useToast} from 'native-base';

const Home = ({navigation}) => {
  const toast = useToast();
  const {state, dispatch} = useAppContext();
  const {
    currentUser,
    search,
    data: {dataCoins},
  } = state;
  const [refreshing, setRefreshing] = React.useState(false);
  useEffect(() => {
    SVgetAllCoins({
      dispatch,
      toast,
      id_user: currentUser?.id,
    });
    dispatch(setSearchValue(''));
  }, []);
  const refreshData = () => {
    SVgetAllCoins({
      dispatch,
      toast,
      id_user: currentUser?.id,
    });
    dispatch(setSearchValue(''));
  };
  let data = dataCoins || [];
  if (search) {
    data = data.filter(item => {
      return item?.symbol?.toLowerCase().includes(search?.toLowerCase());
    });
  }
  const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    SVgetAllCoins({
      dispatch,
      toast,
      id_user: currentUser?.id,
    });
    dispatch(setSearchValue(''));
    wait(2000).then(() => {
      setRefreshing(false);
    });
  }, []);
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
            onEndReachedThreshold={0.5}
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
