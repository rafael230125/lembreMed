import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@typings/types';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

type ConfiguracaoScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Configuracao'>;

type Props = {
  navigation: ConfiguracaoScreenNavigationProp;
};

export default function Configuracao({ navigation }: Props) {

  return (
    <View style={styles.container}>      
      <View style={styles.optionsContainer}>        
        <View style={styles.section}>
          <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('EncerrarConta')}>
            <Ionicons name="trash" size={24} color={""} />
            <Text style={styles.optionText}>Encerrar conta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: width * 0.07, 
    paddingTop: height * 0.05, 
    backgroundColor: '#fff',
  },
  optionsContainer: {
    marginBottom: height * 0.03, 
  },
  section: {
    marginBottom: height * 0.03,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: height * 0.015, 
  },
  optionText: {
    marginLeft: width * 0.03,
    fontSize: width * 0.04,
  },
}); 
