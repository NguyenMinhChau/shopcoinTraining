/* eslint-disable prettier/prettier */
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import React, {useCallback, useState} from 'react';
import {FormInput, ModalLoading} from '../../components';
import {useAppContext} from '../../utils';
import requestRefreshToken from '../../utils/axios/refreshToken';
import {setFormValue} from '../../app/payloads/form';
import {setCurrentUser} from '../../app/payloads/user';
import {setMessage} from '../../app/payloads/message';
import {SVchangePassword} from '../../services/user';
import styles from './ChangePwdCss';
import stylesGeneral from '../../styles/General';
import stylesStatus from '../../styles/Status';
import {ScrollView, useToast} from 'native-base';

export default function ChangePwd({navigation}) {
  const toast = useToast();
  const {state, dispatch} = useAppContext();
  const {
    currentUser,
    form: {password, oldPwd, confirmPwd},
    message: {error},
  } = state;
  const [loading, setLoading] = useState(false);
  const [isProcess, setIsProcess] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    wait(2000).then(() => setRefreshing(false));
  }, []);
  const handleChangeInput = (name, val) => {
    dispatch(
      setFormValue({
        ...state.form,
        [name]: val,
      }),
    );
  };
  const changePwdAPI = data => {
    SVchangePassword({
      id: currentUser?.id,
      oldPWD: oldPwd,
      newPWD: password,
      setLoading,
      navigation,
      token: data?.token,
      dispatch,
      toast,
      setMessage,
      setFormValue,
      setIsProcess,
    });
  };
  const handleSubmit = async () => {
    if (!password || !confirmPwd) {
      Alert.alert('Error', 'Please fill all fields');
    } else if (password !== confirmPwd) {
      Alert.alert('Error', 'Password not match');
    } else {
      setIsProcess(true);
      requestRefreshToken(
        currentUser,
        changePwdAPI,
        state,
        dispatch,
        setCurrentUser,
        toast,
        navigation,
      );
    }
  };
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      style={[styles.container]}>
      {error && (
        <View style={[stylesGeneral.mb10, stylesGeneral.flexCenter]}>
          <Text style={[stylesStatus.cancel, stylesGeneral.fz16]}>{error}</Text>
        </View>
      )}
      <FormInput
        label="Current Password"
        placeholder="Enter your current password"
        showPwd
        color="#000"
        secureTextEntry
        onChangeText={val => handleChangeInput('oldPwd', val)}
        nameSymbol="lock"
      />
      <FormInput
        label="New Password"
        placeholder="Enter your new password"
        showPwd
        color="#000"
        secureTextEntry
        onChangeText={val => handleChangeInput('password', val)}
        nameSymbol="lock"
      />
      <FormInput
        label="Confirm Password"
        placeholder="Enter your new password again"
        showPwd
        color="#000"
        secureTextEntry
        onChangeText={val => handleChangeInput('confirmPwd', val)}
        nameSymbol="lock"
      />
      <TouchableOpacity
        activeOpacity={0.6}
        onPress={handleSubmit}
        disabled={!password || !confirmPwd || isProcess}
        style={[
          styles.btn,
          (!password || !confirmPwd || isProcess) && stylesGeneral.op6,
          stylesGeneral.flexCenter,
          stylesGeneral.mt10,
          stylesStatus.confirmbgcbold,
        ]}>
        <Text style={[stylesStatus.white, stylesGeneral.fwbold]}>
          {isProcess ? <ActivityIndicator color="white" /> : 'Change Password'}
        </Text>
      </TouchableOpacity>
      {loading && <ModalLoading />}
    </ScrollView>
  );
}
