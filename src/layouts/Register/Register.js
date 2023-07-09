/* eslint-disable prettier/prettier */
/* eslint-disable react/react-in-jsx-scope */
import {View, Text, TouchableOpacity} from 'react-native';
import {userRegister} from '../../services/userAuthen';
import {setFormValue} from '../../app/payloads/form';
import {setMessage} from '../../app/payloads/message';
import {useAppContext} from '../../utils/';
import {Form} from '../../components';
import {routersMain} from '../../routers/Main';
import styles from './RegisterCss';
import stylesGeneral from '../../styles/General';
import stylesStatus from '../../styles/Status';
import {useState} from 'react';
import { useToast } from 'native-base';

const Register = ({navigation}) => {
  const toast = useToast()
  const {state, dispatch} = useAppContext();
  const {
    form: {username, email, password},
  } = state;
  const [isProcess, setIsProcess] = useState(false);
  const handleRegister = () => {
    setIsProcess(true);
    userRegister({
      username,
      email,
      password,
      dispatch,
      state,
      navigation,
      toast,
      setMessage,
      setFormValue,
      setIsProcess,
    });
  };
  return (
    <Form
      titleForm="Register Form"
      textBtn="Register"
      bolUsername
      bolEmail
      bolPwd
      isProcess={isProcess}
      onPress={handleRegister}>
      <View style={[styles.desc, stylesGeneral.flexRow]}>
        <Text style={[styles.desc_text, stylesGeneral.text_black]}>
          You have an acount?
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate(routersMain.Login)}>
          <Text
            style={[stylesGeneral.ml4, styles.register, stylesStatus.confirm]}>
            Login
          </Text>
        </TouchableOpacity>
      </View>
    </Form>
  );
};

export default Register;
