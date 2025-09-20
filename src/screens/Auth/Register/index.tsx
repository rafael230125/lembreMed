import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, ScrollView, Alert, ActivityIndicator } from 'react-native';
import CustomButton from '@components/CustomButton';
import CustomInput from '@components/CustomInput';
import { StackNavigationProp } from '@react-navigation/stack';
import { useUserContext } from '@context/UserContext';
import { auth } from '@services/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { RootStackParamList } from '@typings/types';
import styles from '@screens/Auth/styles';

const { width, height } = Dimensions.get('window');

type CadastroScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Cadastro'>;

type Props = {
  navigation: CadastroScreenNavigationProp;
};

export default function Cadastro({ navigation }: Props) {
  const { setUserData } = useUserContext();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');


  const validarCampos = (): boolean => {
    let valido = true
    setEmailError('');
    setPasswordError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setEmailError('Digite um email válido.');
      valido = false;
    }

    if (password.length < 6) {
      setPasswordError('A senha deve conter pelo menos 6 caracteres.');
      valido = false;
    }

    return valido;
  }

  const handleCadastro = async () => {
    if (!validarCampos()) return;

    try {
      setIsLoading(true);

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      setUserData((prevData) => ({
        ...prevData,
        uid: userId,
        email,
      }));

      navigation.navigate('InformacaoConta');
    } catch (error: any) {
      console.error('Erro ao criar conta:', error.message);
      
          if (error.code === 'auth/email-already-in-use') {
          setEmailError('Este email já está em uso.');
        } else {
          Alert.alert('Erro', 'Não foi possível criar a conta. Tente novamente.');
        }
        }   
      finally {
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
          <Text style={styles.subtitle}>Crie uma conta</Text>
          <View style={styles.inputWrapper}>
            <CustomInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor="#aaa"
              keyboardType="email-address"
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>
          <View style={styles.inputWrapper}>
            <CustomInput
              value={password}
              onChangeText={setPassword}
              placeholder="Senha"
              placeholderTextColor="#aaa"
              secureTextEntry
            />

            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color="#68BAE8" />
          ) : (
            <CustomButton title="Criar" onPress={handleCadastro} />
          )}

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.registerText}>
              Já tem uma conta? <Text style={styles.link}>Faça o login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}