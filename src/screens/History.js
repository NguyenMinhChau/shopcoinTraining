import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

const History = ({navigation}) => {

  
    return (

      <View style={style.body}>
        <Text style={style.text}>My history page</Text>
      </View>
  
    )
}

const style = StyleSheet.create({
    body: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center'
    },
    text: {
        fontSize: 25
    }
})

export default History