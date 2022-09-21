import React from 'react'
import { View, Text, StyleSheet, Image, SafeAreaView } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import LinearGradient from 'react-native-linear-gradient'

const Coin = (props) => {
  return (
    <TouchableOpacity style={style.body}>
        <View style={{flexDirection: 'row'}}>
            {props.image ? 
            <View style={{justifyContent: 'center', padding: 10}}>
                <Image 
                    style={style.logo}
                    source={{
                        uri: `https://apishopcoin.4eve.site${props.image}`
                    }}
                />
            </View>
            : ''}
            <View>
                <Text style={style.name}>{props.name}</Text>
            </View>
        </View>
        {props.amount ?

            <Text style={{fontSize: 18, fontWeight: '700'}}>Số lượng: {props.amount}</Text> 
        : ''}
        <View style={{marginRight: 20}}>
            <LinearGradient colors={['#99CCFF', '#FF99FF']}>
                <TouchableOpacity 
                    style={style.button}
                >
                    <Text style={style.textButton}>
                        Buy
                    </Text>
                </TouchableOpacity>
            </LinearGradient>
        </View>
    </TouchableOpacity>
  )
}

const style = StyleSheet.create({
    body: {
        width: "100%",
        height: 70,
        margin: 10,
        borderRadius: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        shadowOffset: {width: -2, height: 4},  
        shadowColor: '#cccccc', 
        backgroundColor: '#fff', 
        shadowOpacity: 0.2,  
        shadowRadius: 3,  
        alignItems: 'center'
    },
    button: {
        padding: 10,
    },
    logo:{
        width: 30,
        height: 30,
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    price: {
        fontSize: 15,
        fontWeight: '500'
    }
})

export default Coin