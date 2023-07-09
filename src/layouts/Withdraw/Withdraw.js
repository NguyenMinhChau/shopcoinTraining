/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/self-closing-comp */
/* eslint-disable react/react-in-jsx-scope */
import {useCallback, useEffect, useState} from 'react';
import {
  Text,
  RefreshControl,
  View,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {DataTable} from 'react-native-paper';
import {useAppContext} from '../../utils';
import {formatUSDT, formatVND} from '../../utils/format/Money';
import {Header, NodataText} from '../../components';
import stylesGeneral from '../../styles/General';
import stylesStatus from '../../styles/Status';
import {getAllWithdraws} from '../../app/payloads/getAll';
import {SVgetWithdrawByEmailUser} from '../../services/withdraw';
import {dateFormat} from '../../utils/format/Date';
import {textLower} from '../../utils/format/textLowercase';
import {routersMain} from '../../routers/Main';
import styles from './WithdrawCss';
import {useToast} from 'native-base';
import requestRefreshToken from '../../utils/axios/refreshToken';
import {setCurrentUser} from '../../app/payloads/user';

const Withdraw = ({navigation}) => {
  const toast = useToast();
  const {state, dispatch} = useAppContext();
  const {
    currentUser,
    data: {dataWithdraws},
  } = state;
  const [refreshing, setRefreshing] = useState(false);
  const getWRByEmail = dataToken => {
    SVgetWithdrawByEmailUser({
      email_user: currentUser?.email,
      id_user: currentUser?.id,
      dispatch,
      toast,
      token: dataToken?.token,
    });
  };
  useEffect(() => {
    requestRefreshToken(
      currentUser,
      getWRByEmail,
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
      getWRByEmail,
      state,
      dispatch,
      setCurrentUser,
      toast,
      navigation,
    );
  };
  const data =
    dataWithdraws?.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    ) || [];
  const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    requestRefreshToken(
      currentUser,
      getWRByEmail,
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
      <DataTable.Row
        onPress={
          item?.status === 'On hold'
            ? () => {
                navigation.navigate({
                  name: routersMain.SingleWithdraw,
                  params: {
                    data: item,
                  },
                });
              }
            : () => {}
        }>
        <DataTable.Cell numeric style={[styles.title_table]}>
          <Text style={[stylesGeneral.text_black]}>
            {formatUSDT(item?.amount)}
          </Text>
        </DataTable.Cell>
        <DataTable.Cell numeric style={[styles.title_table]}>
          <Text style={[stylesGeneral.text_black]}>
            {formatVND(item?.amount_vnd)}
          </Text>
        </DataTable.Cell>
        <DataTable.Cell numeric style={[styles.title_table]}>
          <Text style={[stylesGeneral.text_black]}>
            {dateFormat(item?.createAt, 'DD/MM/YYYY HH:mm:ss')}
          </Text>
        </DataTable.Cell>
        <DataTable.Cell numeric style={[styles.title_table]}>
          <Text
            style={[
              textLower(item?.status) === 'onhold'
                ? stylesStatus.vip
                : textLower(item?.status) === 'completed' ||
                  textLower(item?.status) === 'complete'
                ? stylesStatus.complete
                : textLower(item?.status) === 'canceled' ||
                  textLower(item?.status) === 'cancel'
                ? stylesStatus.cancel
                : textLower(item?.status) === 'confirmed' ||
                  textLower(item?.status) === 'confirm'
                ? stylesStatus.confirm
                : stylesStatus.demo,
            ]}>
            {item?.status}
          </Text>
        </DataTable.Cell>
      </DataTable.Row>
    );
  };
  return (
    <View style={[styles.container]}>
      <View style={[styles.content]}>
        <Header refreshData={refreshData} />
        <TouchableOpacity
          style={[styles.container_btn, stylesStatus.vipbgcbold]}
          onPress={() => navigation.navigate(routersMain.CreateWithdraw)}>
          <Text style={[styles.btn, stylesStatus.white]}>Create</Text>
        </TouchableOpacity>
        <View style={[styles.listWithdraw, stylesGeneral.mt10]}></View>
      </View>
      {data.length > 0 ? (
        <DataTable style={{flex: 1, marginBottom: 40}}>
          <DataTable.Header>
            <DataTable.Title style={[styles.title_table]} numeric>
              <Text style={[styles.title_table]}>Send</Text>
            </DataTable.Title>
            <DataTable.Title style={[styles.title_table]} numeric>
              <Text style={[styles.title_table]}>Receied</Text>
            </DataTable.Title>
            <DataTable.Title style={[styles.title_table]} numeric>
              <Text style={[styles.title_table]}>Date</Text>
            </DataTable.Title>
            <DataTable.Title style={[styles.title_table]} numeric>
              <Text style={[styles.title_table]}>Status</Text>
            </DataTable.Title>
          </DataTable.Header>
          <View style={[styles.listWithdraw]}>
            <FlatList
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              data={data}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
            />
          </View>
        </DataTable>
      ) : (
        <NodataText
          text="No Data Withdraw"
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
    </View>
  );
};

export default Withdraw;
