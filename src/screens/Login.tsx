import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, ScrollView, Alert, ActivityIndicator } from 'react-native';
import CustomButton from '../components/CustomButton'; 
import CustomInput from '../components/CustomInput';  
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../components/Navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../services/firebaseConfig'; 
import { useUserContext } from '../context/UserContext'; 
import { doc, getDoc } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

export default function Login({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    {/*
    try {
      setIsLoading(true);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, `users/${user.uid}`));

      if (userDoc.exists()) {
        const userData = userDoc.data();

        setUserData({
          uid: user.uid,
          email: user.email || '',
          name: userData.name || '',
          phone: userData.phone || '',
          birthDate: userData.birthDate || '',
          gender: userData.gender || '',
          role: userData.role || '',
          profileImage: userData.profileImage || '',
        });
  
        navigation.navigate('Main');
      } else {
        console.error('Documento não encontrado no Firestore.');
      }
    } catch (error) {
      Alert.alert('Erro ao fazer login', 'Verifique suas credenciais e tente novamente.');
    } finally {
      setIsLoading(false);
    }
      */}

      navigation.navigate('Main');
  };
  
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.outerContainer}> 
        <View style={styles.container}>         
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logo} 
            resizeMode="contain" 
          />       
          <Text style={styles.subtitle}>Faça o login em sua conta</Text> 
          <CustomInput 
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
          />
          <CustomInput 
            value={password}
            onChangeText={setPassword}
            placeholder="Senha"
            placeholderTextColor="#aaa"
            secureTextEntry
          />

          {isLoading ? (
            <ActivityIndicator size="large" color="#ACBC89" />
          ) : (
            <CustomButton title="Entrar" onPress={handleLogin} />
          )}

          <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
            <Text style={styles.registerText}>
              Não tem conta? <Text style={styles.link}>Cadastre</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  outerContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: width * 0.1, 
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: height * 0.1,
    backgroundColor: '#fff',
    alignItems: 'center', 
  },
  logo: {
    width: width * 1,  
    height: height * 0.3
  },
  title: {
    color:'#ACBC89',
    fontSize: width * 0.06, 
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: '#000',
    fontSize: width * 0.04, 
    fontWeight: 'bold',
    marginBottom: 28,
    width: '100%',
    textAlign: 'left',
  },
  registerText: {
    marginTop: 20,
    color: '#858585',
    fontSize: width * 0.04, 
    textAlign: 'center',
  },
  link: {
    color: '#70C4E8',
    fontWeight: 'bold',
  },
  footerContainer: {
    marginTop: height * 0.15, 
  },
  linkSobre: {
    color: '#ACBC89',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  nomeText: {
    marginTop: 20,
    color: '#858585',
    fontSize: width * 0.04, 
    textAlign: 'center',
  },
});
