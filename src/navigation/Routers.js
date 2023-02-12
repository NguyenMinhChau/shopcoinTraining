/* eslint-disable prettier/prettier */
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import React from 'react';
import RouterObject, {routers} from '../routers/Routers';
import {Text, View} from 'react-native';
import stylesGeneral from '../styles/General';

const Tab = createBottomTabNavigator();
const headerStyle = {
  headerStyle: {
    shadowColor: 'rgba(0,0,0, .4)', // IOS
    shadowOffset: {height: 1, width: 1}, // IOS
    shadowOpacity: 1, // IOS
    shadowRadius: 1, //IOS
    elevation: 2, // Android
    backgroundColor: '#fff',
  },
};

export default function Routers() {
  return (
    <Tab.Navigator
      initialRouteName={routers.Home}
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;
          RouterObject.map(item => {
            if (item.name === route.name) {
              iconName = item.icon;
            }
          });
          return (
            <FontAwesome5
              name={iconName}
              size={focused ? 25 : 20}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: '#007aff',
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: 'bold',
        },
        tabBarStyle: [
          {
            display: 'flex',
          },
          null,
        ],
      })}>
      {RouterObject.map((item, index) => {
        return (
          <Tab.Screen
            key={index}
            name={item.name}
            component={item.component}
            // options={headerStyle}
            // thêm icon vào header title
            options={{
              headerTitle:
                item.name === routers.Home
                  ? () => (
                      <View
                        style={[
                          stylesGeneral.flexRow,
                          stylesGeneral.flexCenter,
                        ]}>
                        <FontAwesome5
                          name={item.icon}
                          size={20}
                          color={'#000'}
                        />
                        <Text
                          style={[
                            stylesGeneral.fw500,
                            stylesGeneral.ml10,
                            stylesGeneral.fz20,
                            stylesGeneral.text_black,
                          ]}>
                          Home
                        </Text>
                      </View>
                    )
                  : null,
              ...headerStyle,
            }}
          />
        );
      })}
    </Tab.Navigator>
  );
}
