import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, ScrollView, Alert, ActivityIndicator } from 'react-native';
import CustomButton from '@components/CustomButton';
import CustomInput from '@components/CustomInput';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@typings/types';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@services/firebaseConfig';
import { useUserContext } from '@context/UserContext';
import { doc, getDoc } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import styles from '@screens/Auth/styles';

const { width, height } = Dimensions.get('window');

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

export default function Login({ navigation }: Props) {
  const { setUserData } = useUserContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useFocusEffect(
    useCallback(() => {
      setEmail('');
      setPassword('');
    }, [])
  );

  const handleLogin = async () => {
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
            <ActivityIndicator size="large" color="#68BAE8" />
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
