import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import CustomButton from '@components/CustomButton'; 
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@typings/types';
import styles from './styles';

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

