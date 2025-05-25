import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import CustomButton from '../components/CustomButton'; 
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../components/Navigation';

const { width, height } = Dimensions.get('window');

type EncerramentoContaScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EncerramentoConta'>;

type Props = {
  navigation: EncerramentoContaScreenNavigationProp;
};

export default function EncerramentoConta({ navigation }: Props) {

  return (
    <View style={styles.container}>
      <Text style={styles.successMessage}>
        Conta excluída com sucesso!
      </Text>

      <Image 
        source={require('../../assets/encerramentoconta.png')} 
        style={styles.image} 
      />

      <CustomButton 
        title="Voltar" 
        onPress={() => navigation.navigate('Login')} 
        style={styles.customButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successMessage: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    marginBottom: height * 0.02,
  },
  image: {
    width: 305, 
    height: 298, 
    marginBottom: height * 0.02,
    marginTop: 20,
  },
  customButton: {
    marginTop: height * 0.04,
    marginBottom: height * 0.1,
    alignSelf: 'center',
  },
});