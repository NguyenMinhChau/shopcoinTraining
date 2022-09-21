import { View, Text } from 'react-native'
import React from 'react'

import HomeScreen from '../screens/HomeScreen'
import Settings from '../screens/Settings';
import Deposit from '../screens/Deposit'
import History from '../screens/History'
import Withdraw from '../screens/Withdraw'
import MyCoins from '../screens/MyCoins'
import Coins from '../screens/Coins';

import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs'
import Icon from 'react-native-vector-icons/FontAwesome';

const Tab = createMaterialBottomTabNavigator()

const Routes = ({navigation, route}) => {
    const {token, userInfo} = route.params

    return (
        <Tab.Navigator
            initialRouteName='Home'
        >
            <Tab.Screen 
            name='Home'
            component={HomeScreen}
            options={{
                tabBarLabel: 'Home',
                tabBarIcon: ({focused}) => (
                <Icon name="home" color={focused ? '#fff' : 'black'} size={focused ? 26: 20} />
                ),
            }}
            />
            <Tab.Screen 
            name='MyCoins'
            component={MyCoins}
            options={{
                tabBarLabel: 'MyCoins',
                tabBarIcon: ({focused}) => (
                <Icon name="btc" color={focused ? '#fff' : 'black'} size={focused ? 26: 20} />
                ),
            }}
            initialParams={userInfo}
            />
            <Tab.Screen 
            name='History'
            component={History}
            options={{
                tabBarLabel: 'History',
                tabBarIcon: ({focused}) => (
                <Icon name="table" color={focused ? '#fff' : 'black'} size={focused ? 26: 20} />
                ),
            }}
            />
            <Tab.Screen 
            name='Deposit'
            component={Deposit}
            options={{
                tabBarLabel: 'Deposit',
                tabBarIcon: ({focused}) => (
                <Icon name="google-wallet" color={focused ? '#fff' : 'black'} size={focused ? 26: 20} />
                ),
            }}
            />
            <Tab.Screen 
            name='Withdraw'
            component={Withdraw}
            options={{
                tabBarLabel: 'Withdraw',
                tabBarIcon: ({focused}) => (
                <Icon name="money" color={focused ? '#fff' : 'black'} size={focused ? 26: 20} />
                ),
            }}
            />
            <Tab.Screen 
            name='Settings'
            component={Settings}
            options={{
                tabBarLabel: 'Settings',
                tabBarIcon: ({focused}) => (
                <Icon name="gear" color={focused ? '#fff' : 'black'} size={focused ? 26: 20} />
                ),
            }}
            />

        </Tab.Navigator>
    )
}

export default Routes