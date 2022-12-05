/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
import React, {useCallback, useEffect, useState} from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useAppContext} from '../../utils';
import {formatUSDT} from '../../utils/format/Money';
import {userLogout} from '../../services/userAuthen';
import {SVgetUserById} from '../../services/user';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {getUserById} from '../../app/payloads/getById';
import {ImageCp, RowDetail} from '../../components';
import {routersMain} from '../../routers/Main';
import styles from './ProfileCss';
import stylesGeneral from '../../styles/General';
import stylesStatus from '../../styles/Status';

const Profile = ({navigation}) => {
  const [refreshing, setRefreshing] = useState(false);
  const {state, dispatch} = useAppContext();
  const {currentUser, userById} = state;
  useEffect(() => {
    SVgetUserById({
      id: currentUser?.id,
      dispatch,
      getUserById,
    });
  }, []);
  const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    SVgetUserById({
      id: currentUser?.id,
      dispatch,
      getUserById,
    });
    wait(2000).then(() => setRefreshing(false));
  }, []);
  const handleLogout = async () => {
    await userLogout({});
    navigation.navigate(routersMain.Login);
  };
  return (
    <ScrollView
      style={[styles.container]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={[styles.user_info]}>
        <ImageCp
          uri="https://img.capital.com/imgs/articles/1200x627x1/shutterstock_1923715325.jpg"
          style={[styles.avatar]}
        />
        <Text
          style={[
            styles.name_user,
            stylesGeneral.mt10,
            stylesGeneral.mb5,
            stylesGeneral.fz16,
            stylesGeneral.text_black,
          ]}>
          {currentUser?.username}
        </Text>
        <Text style={[styles.email_user, stylesGeneral.text_black]}>
          {currentUser?.email}
        </Text>
      </View>
      <View style={[styles.info_detail_container]}>
        <RowDetail title="Username" text={currentUser?.username} />
        <RowDetail title="Email" text={currentUser?.email} />
        <RowDetail
          title="Wallet"
          text={formatUSDT(userById?.Wallet?.balance)}
        />
        <RowDetail
          title="Rank"
          text={currentUser?.rank}
          styleDesc={[
            stylesStatus.status,
            currentUser?.rank?.toLowerCase() === 'vip'
              ? stylesStatus.vipbgc
              : currentUser?.rank?.toLowerCase() === 'pro'
              ? stylesStatus.completebgc
              : currentUser?.rank?.toLowerCase() === 'standard'
              ? stylesStatus.confirmbgc
              : stylesStatus.demobgc,
          ]}
        />
        <RowDetail
          title="Upload document"
          nameIcon="chevron-right"
          navigation={navigation}
          redirectName="Upload Document"
        />
        <RowDetail
          title="Change password"
          nameIcon="chevron-right"
          navigation={navigation}
          redirectName="Change Password"
        />
        <RowDetail
          title="Contact"
          nameIcon="chevron-right"
          navigation={navigation}
          redirectName="Contact"
        />
        <RowDetail
          title="Payment"
          nameIcon="chevron-right"
          navigation={navigation}
          redirectName="Profile Payment"
        />
        <RowDetail title="Live chat" nameIcon="chevron-right" />
      </View>
      <View style={[styles.list_actions, stylesGeneral.mt10]}>
        {/* <TouchableOpacity activeOpacity={0.6} style={[styles.actions_item]}>
          <FontAwesome5 name="cog" size={20} />
          <Text
            style={[
              stylesGeneral.fz16,
              stylesGeneral.ml10,
              stylesGeneral.fwbold,
            ]}>
            Setting
          </Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.6}
          style={[styles.actions_item]}>
          <FontAwesome5 name="sign-out-alt" size={20} color={'red'} />
          <Text
            style={[
              styles.actions_text,
              stylesGeneral.fz16,
              stylesGeneral.ml10,
              stylesGeneral.fwbold,
            ]}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Profile;
