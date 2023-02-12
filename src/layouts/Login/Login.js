/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/react-in-jsx-scope */
import {useRef, useState, useEffect} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useAppContext} from '../../utils';
import {setFormValue} from '../../app/payloads/form';
import {setMessage} from '../../app/payloads/message';
import {userLogin} from '../../services/userAuthen';
import {Form} from '../../components';
import {routersMain} from '../../routers/Main';
import styles from './LoginCss';
import stylesGeneral from '../../styles/General';
import stylesStatus from '../../styles/Status';

const Login = ({navigation}) => {
  const {state, dispatch} = useAppContext();
  const {
    currentUser,
    form: {email, password},
  } = state;
  const [isProcess, setIsProcess] = useState(false);
  const refEmail = useRef();
  const refPwd = useRef();
  useEffect(() => {
    if (currentUser) {
      navigation.navigate(routersMain.MainPage);
    }
  }, [currentUser]);
  const handleLogin = async () => {
    await 1;
    setIsProcess(true);
    userLogin({
      email,
      password,
      dispatch,
      state,
      setFormValue,
      setMessage,
      setIsProcess,
      redirect: () => navigation.navigate(routersMain.MainPage),
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
      isProcess={isProcess}
      onPress={handleLogin}>
      <View style={[styles.desc, stylesGeneral.flexRow]}>
        <Text style={[styles.desc_text, stylesGeneral.text_black]}>
          You don't have an acount?
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate(routersMain.Register)}>
          <Text
            style={[stylesGeneral.ml4, styles.register, stylesStatus.confirm]}>
            Register
          </Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.desc, stylesGeneral.flexRow, stylesGeneral.mt10]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate(routersMain.ForgotPassword)}>
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
