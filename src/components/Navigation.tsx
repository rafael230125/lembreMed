import React from 'react';
import { Dimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../screens/Login';
import Cadastro from '../screens/Cadastro';
import Perfil from '../screens/Perfil';
import Configuracao from '../screens/Configuracao';
import MeuPerfil from '../screens/MeuPerfil';
import EncerrarConta from '../screens/EncerrarConta';
import EncerramentoConta from '../screens/EncerramentoConta';
import InformacaoConta from '../screens/InformacaoConta';
import TabNavigation from './TabNavigation';
import Home from '../screens/Home';
import Tarefa from '../screens/Tarefa';
import { Lembrete } from '.././types/types';

export type RootStackParamList = {
  Login: undefined;
  Cadastro: undefined;
  Perfil: undefined;
  Configuracao: undefined;
  MeuPerfil: undefined;
  EncerrarConta: undefined;
  EncerramentoConta: undefined;
  InformacaoConta: undefined;
  Main: undefined; 
  Home: undefined; 
  Tarefa: undefined; 
};

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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
