import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList
} from 'react-native';
import Coin from '../components/Coin';

const MyCoins = ({navigation, route}) => {
    const [data, setData] = useState([])
    const [coin, setCoin] = useState([])
    useEffect(() => {
      setData(route.params.coins)
    }, [])
    
    const renderCoin = ({ item }) => (
      <Coin 
        name={item.name}
        amount={item.amount}
      />
    );
    console.log(data)
    return (

      <View style={style.body}>
        <FlatList 
          data={data}
          renderItem={renderCoin}
        />
      </View>
  
    )
}

const style = StyleSheet.create({
    body: {
        flex: 1, 
        alignItems: 'center',
        margin: 0,
        padding: 0,
        top: 35,
        marginEnd: 10
      
    },
    text: {
        fontSize: 25
    }
})

export default MyCoins