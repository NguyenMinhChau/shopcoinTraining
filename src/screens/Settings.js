import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TouchableOpacity
} from 'react-native';
import { Icon } from 'react-native-paper/lib/typescript/components/Avatar/Avatar';

import Field from '../components/Field';

const Settings = ({navigation}) => {

    const onChangePage = () => {
      navigation.navigate('Home')
    }
  
    return (
      <View style={style.body}>
        <Field 
          name="Profile" 
          logo="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/User_font_awesome.svg/2048px-User_font_awesome.svg.png" 
          link=""
        />
        <Field 
          name="Logout" 
          logo="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQB03XAfgEqgz_ToQ_auJnbxeor5GJge985uZsLtHaa-QT6uxlzqdOBBkA8vRzit4yu-oc&usqp=CAU" 
          link=""
        />
      </View> 
  
    )
}

const style = StyleSheet.create({
    body: {
        flex: 1, 
        top: 40,
        left: 15
    },
    text: {
        fontSize: 25
    }
})

export default Settings