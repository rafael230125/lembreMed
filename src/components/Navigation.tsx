import React from 'react';
import { Dimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../screens/Login';
import Cadastro from '../screens/Cadastro';
import Configuracao from '../screens/Configuracao';
import MeuPerfil from '../screens/MeuPerfil';
import EncerrarConta from '../screens/EncerrarConta';
import EncerramentoConta from '../screens/EncerramentoConta';
import InformacaoConta from '../screens/InformacaoConta';
import EditarMedicamento from '../screens/EditarMedicamento';
import TabNavigation from './TabNavigation';
import { RootStackParamList } from '../types/types';

const Stack = createStackNavigator<RootStackParamList>();

const { width } = Dimensions.get('window');

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Cadastro"
          component={Cadastro}
          options={{
            headerShown: false,
            headerTitle: '',
          }}
        />
        <Stack.Screen
          name="InformacaoConta"
          component={InformacaoConta}
          options={{
            headerShown: true,
            headerStyle: {
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 0,
            },
            headerTitle: 'Informações conta',
            headerTitleAlign: 'center',
            headerTitleStyle: {
              fontSize: width * 0.05,
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen
          name="Main"
          component={TabNavigation}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Configuracao"
          component={Configuracao}
          options={{
            headerShown: true,
            headerStyle: {
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 0,
            },
            headerTitle: 'Configuração',
            headerTitleAlign: 'center',
            headerTitleStyle: {
              fontSize: width * 0.05,
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen
          name="MeuPerfil"
          component={MeuPerfil}
          options={{
            headerShown: true,
            headerStyle: {
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 0,
            },
            headerTitle: 'Meu perfil',
            headerTitleAlign: 'center',
            headerTitleStyle: {
              fontSize: width * 0.05,
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen
          name="EncerrarConta"
          component={EncerrarConta}
          options={{
            headerShown: true,
            headerStyle: {
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 0,
            },
            headerTitle: 'Encerrar conta',
            headerTitleAlign: 'center',
            headerTitleStyle: {
              fontSize: width * 0.05,
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen
          name="EncerramentoConta"
          component={EncerramentoConta}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditarMedicamento"
          component={EditarMedicamento}
          options={{
            headerShown: true,
            headerStyle: {
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 0,
            },
            headerTitle: '',
            headerTitleAlign: 'center',
            headerTitleStyle: {
              fontSize: width * 0.05,
              fontWeight: 'bold',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
