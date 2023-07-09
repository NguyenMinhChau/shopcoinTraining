/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/react-in-jsx-scope */
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {FormInput} from '../../components';
import {useAppContext} from '../../utils';
import {setFormValue} from '../../app/payloads/form';
import styles from './FormCss';
import stylesGeneral from '../../styles/General';
import stylesStatus from '../../styles/Status';

const Form = ({
  uriBgc = require('../../assets/images/bg-login.png'),
  uriLogo = require('../../assets/images/header-logo.png'),
  titleForm,
  textBtn,
  bolUsername,
  bolEmail,
  bolPwd,
  bolOTP,
  refEmail,
  refPwd,
  refUsername,
  refOtp,
  children,
  onPress,
  isProcess,
}) => {
  const {state, dispatch} = useAppContext();
  const {
    form: {username, email, password, otpCode},
    message: {error, success},
  } = state;
  const handleChange = (name, value) => {
    dispatch(
      setFormValue({
        ...state.form,
        [name]: value,
      }),
    );
  };
  return (
    <ImageBackground
      style={[styles.container]}
      resizeMode="cover"
      source={uriBgc}>
      <ScrollView
        style={[styles.scrollview]}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          flexDirection: 'column',
        }}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.content]}>
          <View style={[stylesGeneral.flexCenter, stylesGeneral.mb10]}>
            <Image
              style={[styles.image_form]}
              source={uriLogo}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.title_form, stylesGeneral.text_black]}>
            {titleForm}
          </Text>
          {bolUsername && (
            <FormInput
              label="Username"
              ref={refUsername}
              placeholder="Enter your username"
              onChangeText={value => handleChange('username', value)}
              value={username}
              nameSymbol="user"
            />
          )}
          {bolEmail && (
            <FormInput
              label="Email"
              ref={refEmail}
              placeholder="Enter your email"
              onChangeText={value => handleChange('email', value)}
              value={email}
              nameSymbol="envelope"
            />
          )}
          {bolOTP && (
            <FormInput
              label="OTP"
              ref={refOtp}
              placeholder="Enter your OTP"
              onChangeText={value => handleChange('otpCode', value)}
              value={otpCode}
              nameSymbol="shield-alt"
            />
          )}
          {bolPwd && (
            <FormInput
              label="Password"
              placeholder="Enter your password"
              secureTextEntry={true}
              ref={refPwd}
              onChangeText={value => handleChange('password', value)}
              value={password}
              color="#000"
              showPwd
              nameSymbol="lock"
            />
          )}
          <TouchableOpacity
            activeOpacity={0.6}
            style={[styles.input_item, isProcess && stylesGeneral.op6]}
            onPress={onPress}
            disabled={isProcess}>
            <Text
              style={[
                styles.input_btn,
                stylesStatus.confirmbgcbold,
                stylesGeneral.fz16,
              ]}>
              {!isProcess ? textBtn : <ActivityIndicator color="white" />}
            </Text>
          </TouchableOpacity>
          {children}
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default Form;
