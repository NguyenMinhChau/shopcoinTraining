/* eslint-disable prettier/prettier */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable prettier/prettier */
import {useRef} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useAppContext} from '../../utils';
import {setFormValue} from '../../app/payloads/form';
import {setMessage} from '../../app/payloads/message';
import {userLogin} from '../../services/userAuthen';
import {Form} from '../../components';
import styles from './LoginCss';
import stylesGeneral from '../../styles/General';
import stylesStatus from '../../styles/Status';

const Login = ({navigation}) => {
  const {state, dispatch} = useAppContext();
  const {
    form: {email, password},
  } = state;
  const refEmail = useRef();
  const refPwd = useRef();
  const handleLogin = () => {
    userLogin({
      email,
      password,
      dispatch,
      state,
      setFormValue,
      setMessage,
      redirect: () => navigation.navigate('Main'),
    });
  };
  return (
    <Form
      titleForm="Login Form"
      textBtn="Login"
      bolEmail
      bolPwd
      refEmail={refEmail}
      refPwd={refPwd}
      onPress={handleLogin}>
      <View style={[styles.desc, stylesGeneral.flexRow]}>
        <Text style={[styles.desc_text]}>You don't have an acount?</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Register')}>
          <Text
            style={[stylesGeneral.ml4, styles.register, stylesStatus.confirm]}>
            Register
          </Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.desc, stylesGeneral.flexRow, stylesGeneral.mt10]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('ForgotPassword')}>
          <Text
            style={[stylesGeneral.ml4, styles.register, stylesStatus.confirm]}>
            Forgot Password?
          </Text>
        </TouchableOpacity>
      </View>
    </Form>
  );
};

export default Login;