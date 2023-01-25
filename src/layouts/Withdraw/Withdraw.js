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

const Withdraw = ({navigation}) => {
  const {state, dispatch} = useAppContext();
  const {
    currentUser,
    data: {dataWithdraws},
  } = state;
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    SVgetWithdrawByEmailUser({
      email: currentUser?.email,
      dispatch,
      getAllWithdraws,
    });
  }, []);
  const refreshData = () => {
    SVgetWithdrawByEmailUser({
      email: currentUser?.email,
      dispatch,
      getAllWithdraws,
    });
  };
  const data =
    dataWithdraws?.withdraws?.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    ) || [];
  const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    SVgetWithdrawByEmailUser({
      email: currentUser?.email,
      dispatch,
      getAllWithdraws,
    });
    wait(2000).then(() => setRefreshing(false));
  }, []);
  const renderItem = ({item}) => {
    console.log('item', item);
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
            {formatUSDT(item?.amountUsd)}
          </Text>
        </DataTable.Cell>
        <DataTable.Cell numeric style={[styles.title_table]}>
          <Text style={[stylesGeneral.text_black]}>
            {formatVND(item?.amountVnd)}
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
