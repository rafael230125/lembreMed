import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { RadioButton, Provider as PaperProvider } from 'react-native-paper'; 
import CustomButton from '../components/CustomButton'; 
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../components/Navigation';
import { getAuth, deleteUser } from 'firebase/auth'; 
import { getFirestore, doc, deleteDoc } from 'firebase/firestore'; 

const { width, height } = Dimensions.get('window');

type EncerrarContaScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EncerrarConta'>;

type Props = {
  navigation: EncerrarContaScreenNavigationProp;
};

export default function EncerrarConta({ navigation }: Props) {
  const [checked, setChecked] = useState(''); 
  //const auth = getAuth();
  //const firestore = getFirestore();

  const theme = {
    colors: {
      primary: '#696868', 
    },
  };

  const handleEncerrarConta = async () => {
     {/* 
    if (!checked) {
      Alert.alert('Erro', 'Selecione um motivo para encerrar a conta.');
      return;
    }

    try {
      const user = auth.currentUser;

      if (user) {
        const userDocRef = doc(firestore, 'users', user.uid);
        await deleteDoc(userDocRef);

        await deleteUser(user);

        Alert.alert('Conta encerrada', 'Sua conta foi encerrada com sucesso.');
        navigation.navigate('Login'); 
      } else {
        Alert.alert('Erro', 'Nenhum usuário autenticado encontrado.');
      }
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível encerrar a conta. Tente novamente.');
    }
    */}

    navigation.navigate('EncerramentoConta'); 
  };

  return (
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        <Text style={styles.message}>
          Informe o motivo do encerramento da conta:
        </Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.option} onPress={() => setChecked('naoGostei')}>
            <RadioButton
              value="naoGostei"
              status={checked === 'naoGostei' ? 'checked' : 'unchecked'}
              onPress={() => setChecked('naoGostei')}
            />
            <Text style={styles.optionText}>Não gostei do aplicativo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={() => setChecked('naoEncontrei')}>
            <RadioButton
              value="naoEncontrei"
              status={checked === 'naoEncontrei' ? 'checked' : 'unchecked'}
              onPress={() => setChecked('naoEncontrei')}
            />
            <Text style={styles.optionText}>Não encontrei o que queria</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={() => setChecked('tenhoOutra')}>
            <RadioButton
              value="tenhoOutra"
              status={checked === 'tenhoOutra' ? 'checked' : 'unchecked'}
              onPress={() => setChecked('tenhoOutra')}
            />
            <Text style={styles.optionText}>Tenho outra conta</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={() => setChecked('outro')}>
            <RadioButton
              value="outro"
              status={checked === 'outro' ? 'checked' : 'unchecked'}
              onPress={() => setChecked('outro')}
            />
            <Text style={styles.optionText}>Outro</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton 
            title="Encerrar conta" 
            onPress={handleEncerrarConta}
            style={styles.customButton} />
        </View>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: width * 0.07, 
    paddingTop: height * 0.05,
    backgroundColor: '#fff',
  },
  message: {
    fontSize: width * 0.04,
    fontWeight: 'bold',
  },
  optionsContainer: {
    marginVertical: height * 0.02, 
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.02, 
  },
  optionText: {
    marginLeft: width * 0.03, 
    fontSize: width * 0.04,
  },
  buttonContainer: {
    marginBottom: height * 0.03,
  },
  customButton: {
    marginTop: height * 0.04,
    marginBottom: height * 0.1,
    alignSelf: 'center',
    backgroundColor: '#FF6363'
  },
});
