/* eslint-disable prettier/prettier */
import {View, Text, Alert, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
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

export default function ChangePwd({navigation}) {
  const {state, dispatch} = useAppContext();
  const {
    currentUser,
    form: {password, oldPwd, confirmPwd},
    message: {error},
  } = state;

  const [loading, setLoading] = useState(false);
  const handleChangeInput = (name, val) => {
    dispatch(
      setFormValue({
        ...state.form,
        [name]: val,
      }),
    );
  };
  const changePwd = data => {
    SVchangePassword({
      id: currentUser?.id,
      oldPWD: oldPwd,
      newPWD: password,
      setLoading,
      navigation,
      token: data?.token,
      dispatch,
      setMessage,
      setFormValue,
    });
  };
  const handleSubmit = async () => {
    try {
      if (!oldPwd || !password || !confirmPwd) {
        Alert.alert('Error', 'Please fill all fields');
      } else if (password !== confirmPwd) {
        Alert.alert('Error', 'Password not match');
      } else {
        await 1;
        requestRefreshToken(
          currentUser,
          changePwd,
          state,
          dispatch,
          setCurrentUser,
          currentUser?.id,
        );
      }
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <View style={[styles.container]}>
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
        disabled={!password || !oldPwd || !confirmPwd}
        style={[
          styles.btn,
          (!password || !oldPwd || !confirmPwd) && stylesGeneral.op6,
          stylesGeneral.flexCenter,
          stylesGeneral.mt10,
          stylesStatus.confirmbgcbold,
        ]}>
        <Text style={[stylesStatus.white, stylesGeneral.fwbold]}>
          Change Password
        </Text>
      </TouchableOpacity>
      {/* Modal Loading */}
      {loading && <ModalLoading />}
    </View>
  );
}
