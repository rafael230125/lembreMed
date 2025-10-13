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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
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
  const [saveEmail, setSaveEmail] = useState<boolean>(false);

  // Função para carregar email salvo
  const loadSavedEmail = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('savedEmail');
      if (savedEmail) {
        setEmail(savedEmail);
        setSaveEmail(true);
      }
    } catch (error) {
      console.error('Erro ao carregar email salvo:', error);
    }
  };

  // Função para salvar email
  const saveEmailToStorage = async (emailToSave: string) => {
    try {
      await AsyncStorage.setItem('savedEmail', emailToSave);
    } catch (error) {
      console.error('Erro ao salvar email:', error);
    }
  };

  // Função para remover email salvo
  const removeSavedEmail = async () => {
    try {
      await AsyncStorage.removeItem('savedEmail');
    } catch (error) {
      console.error('Erro ao remover email salvo:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSavedEmail();
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

        // Salvar ou remover email baseado na opção do usuário
        if (saveEmail) {
          await saveEmailToStorage(email);
        } else {
          await removeSavedEmail();
        }

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
            source={require('../../../../assets/logo.png')}
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

          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => setSaveEmail(!saveEmail)}
          >
            <View style={[styles.checkbox, saveEmail && styles.checkboxChecked]}>
              {saveEmail && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
            <Text style={styles.checkboxText}>Salvar login</Text>
          </TouchableOpacity>

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
