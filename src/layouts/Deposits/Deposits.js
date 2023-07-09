/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/react-in-jsx-scope */
import {
  View,
  Text,
  RefreshControl,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {useCallback, useEffect, useState} from 'react';
import {useAppContext} from '../../utils';
import {formatUSDT, formatVND} from '../../utils/format/Money';
import {getAllDeposits} from '../../app/payloads/getAll';
import {Header, NodataText, RowDetail} from '../../components';
import {SVgetDepositsByEmailUser} from '../../services/deposits';
import {dateFormat} from '../../utils/format/Date';
import {textLower} from '../../utils/format/textLowercase';
import {routersMain} from '../../routers/Main';
import styles from './DepositsCss';
import stylesStatus from '../../styles/Status';
import stylesGeneral from '../../styles/General';
import {useToast} from 'native-base';
import requestRefreshToken from '../../utils/axios/refreshToken';
import {setCurrentUser} from '../../app/payloads/user';

const Deposits = ({navigation}) => {
  const toast = useToast();
  const {state, dispatch} = useAppContext();
  const {
    currentUser,
    data: {dataDeposits},
  } = state;
  const [refreshing, setRefreshing] = useState(false);
  const getDP = dataToken => {
    SVgetDepositsByEmailUser({
      toast,
      email_user: currentUser?.email,
      dispatch,
      token: dataToken?.token,
    });
  };
  useEffect(() => {
    requestRefreshToken(
      currentUser,
      getDP,
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
      getDP,
      state,
      dispatch,
      setCurrentUser,
      toast,
      navigation,
    );
  };
  const data =
    (dataDeposits || [])?.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    ) || [];
  const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    requestRefreshToken(
      currentUser,
      getDP,
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
      <TouchableOpacity
        activeOpacity={0.6}
        style={[styles.item]}
        onPress={() =>
          navigation.navigate({
            name: routersMain.SingleDeposits,
            params: {
              data: item,
            },
          })
        }>
        <RowDetail
          noneBorderBottom
          title="Created At"
          text={dateFormat(item?.createdAt, 'DD/MM/YYYY HH:mm:ss')}
        />
        <RowDetail
          noneBorderBottom
          title="Status"
          text={item?.status}
          styleDesc={[
            styles.row_desc,
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
        <RowDetail
          title="Amount USD"
          text={formatUSDT(item?.amount)}
          noneBorderBottom
        />
        <RowDetail
          title="Amount VND"
          text={formatVND(item?.amount_vnd)}
          noneBorderBottom
        />
      </TouchableOpacity>
    );
  };
  return (
    <View style={[styles.container]}>
      <Header refreshData={refreshData} />
      <View
        style={[styles.container_btn, stylesStatus.vipbgcbold]}
        onTouchStart={() => navigation.navigate(routersMain.CreateDeposits)}>
        <Text style={[styles.btn, stylesStatus.white]}>Create</Text>
      </View>
      <View style={[styles.listDeposits, stylesGeneral.mt10]}>
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
          <NodataText
            text=" No Deposits"
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        )}
      </View>
    </View>
  );
};

export default Deposits;
