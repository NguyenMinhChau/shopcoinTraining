import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'


const Field = (props) => {

    const {name, logo} = props

    return (
        <TouchableOpacity style={style.body}>
            <Image 
                source={{
                    uri: logo,
                }}
                style={style.logo}
            />
            <Text style={style.nameField}>{name}</Text>
        </TouchableOpacity>
    )
}

const style = StyleSheet.create({
    body: {
        marginEnd: 35,
        padding: 15,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        shadowOffset: {width: -2, height: 4},  
        shadowColor: '#cccccc', 
        backgroundColor: '#fff', 
        shadowOpacity: 0.2,  
        shadowRadius: 3,
        marginTop: 10
    },
    nameField: {
        fontSize: 18,
        fontWeight: '300',
    },
    logo: {
        width: 30,
        height: 30,
        color: 'black'
    }
})

export default Field