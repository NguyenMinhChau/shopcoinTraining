import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import { TextInput } from 'react-native-gesture-handler'
import LinearGradient from 'react-native-linear-gradient'

export default function Login({navigation}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  
  const Login = () => {
    // navigation.navigate('index')
    let data = `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`

    fetch('https://apishopcoin.4eve.site/authen/login', {
    method: 'POST', // or 'PUT'
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: data,
    })
    .then((response) => response.json())
    .then((result) => {
        // Alert.alert('success', "token: " + data.token)
        if(result.code === 0){
            setEmail('')
            setPassword('')
            navigation.navigate('index', result)
        }else{
            Alert.alert('Warning', result.message)
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
  }

  return (
    <View style={style.body}>
        <Text style={style.header}>Login</Text>
        <Text style={style.label}>Email: </Text>
        <TextInput 
            style={style.input} 
            placeholder='Email' 
            onChangeText={(text) => setEmail(text)}
        />
        <Text style={style.label}>Password: </Text>
        <TextInput
            style={style.input} 
            placeholder='Password' 
            onChangeText={(text) => setPassword(text)}
        />
        <LinearGradient colors={['#99CCFF', '#FF99FF']}>
            <TouchableOpacity 
                style={style.button}
                onPress={Login}
            >
                <Text style={style.textButton}>Login</Text>
            </TouchableOpacity>
        </LinearGradient>
    </View>
  )
}

const style = StyleSheet.create({
    body: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    header: {
        fontSize: 35,
        fontWeight: 'bold',
        fontStyle: 'italic',
        marginBottom: 20 
    },
    input: {
        borderWidth: 0.2,
        width: 300,
        margin: 10,
        padding: 10,
        paddingLeft: 30
    },
    button: {
        padding: 10,
        width: 300,
        alignItems: 'center',
    },
    textButton: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        fontStyle: 'italic'
    },
    label: {
        fontSize: 20,
        fontWeight: '500',
    }
})