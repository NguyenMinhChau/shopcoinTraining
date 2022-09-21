import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Alert,
  SafeAreaView,
  FlatList
} from 'react-native';

import Coin from '../components/Coin';

const HomeScreen = ({navigation}) => {

  const [data, setData] = useState([])

  const getData = async () => {
    fetch('https://apishopcoin.4eve.site/coins/getAllCoin', {
      method: 'GET'
    })
    .then((response) => response.json())
    .then((result) => {
        if(result.code === 0){
            setData(result.data)
        }else{
            Alert.alert('Warning', result.message)
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
  }

  useEffect(() => {
    getData()
  }, [])
  
  const renderItem = ({ item }) => (
    <Coin 
      name={item.fullName}
      image={item.logo}
    />
  );
  
    return (

      <SafeAreaView style={style.body}>
        <FlatList 
            data={data}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
  
    )
}

const style = StyleSheet.create({
    body: {
        flex: 1,
        marginTop: 40,
        marginRight: 20
    },
    text: {
        fontSize: 25
    }
})

export default HomeScreen