import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '@screens/App/Home';
import AdicionarMedicamento from '../screens/App/AdicionarMedicamento';
import Perfil from '@screens/App/Perfil';
import { Ionicons } from '@expo/vector-icons';
import { TabParamList } from '@typings/types';

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigation = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: '#70C4E8',
        tabBarInactiveTintColor: '#e0e0e0',
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AdicionarMedicamento"
        component={AdicionarMedicamento}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={Perfil}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigation;
