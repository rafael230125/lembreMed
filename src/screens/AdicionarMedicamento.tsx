import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Dimensions, StyleSheet, ScrollView } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Lembrete } from '../types/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../components/Navigation';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';

const { width, height } = Dimensions.get('window');

type AdicionarMedicamentoScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AdicionarMedicamento'>;

type Props = {
  navigation: AdicionarMedicamentoScreenNavigationProp;
};

export default function Tarefa({ navigation}: Props) {
  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [titulo, setTitulo] = useState('');
  const [icone, setIcone] = useState('');
  const [cor, setCor] = useState('#ffffff');
  const [data, setData] = useState(new Date());

  const predefinedColors = [
    '#FFF4E3', '#E3FFE3', '#F9E6FF', 
    '#E3F9FF', '#FFFCE3', '#E3FFF4',
  ];
  

  const handleSave = async () => {
    try {

      Alert.alert('Sucesso', 'Lembrete salvo com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar o lembrete:', error);
      Alert.alert('Erro', 'Não foi possível salvar o lembrete.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.outerContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Adicionar medicamento</Text> 

          <Text style={styles.label}>Nome:</Text>
          <CustomInput 
            value={titulo} 
            onChangeText={setTitulo} 
            placeholder="Digite o nome"
            placeholderTextColor="#aaa"
          />

          <Text style={styles.label}>Horário:</Text>
          <CustomInput 
            value={icone}
            onChangeText={setIcone}
            placeholder="Digite o horário"
            placeholderTextColor="#aaa"
            keyboardType="default"
          />

          <Text style={styles.label}>Cor:</Text>
          <View style={styles.colorPalette}>
            {predefinedColors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color, borderWidth: cor === color ? 3 : 0 },
                ]}
                onPress={() => setCor(color)}
              />
            ))}
          </View>

          <CustomButton title="Salvar" style={styles.saveButton} onPress={handleSave} />

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
    backgroundColor: '#fff',
    marginTop: height * 0.07,
  },
  title: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    marginBottom: height * 0.04, 
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  colorPalette: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 5,
    borderColor: "#c7c7c7",
  },
  timePicker: {
    padding: 15,
    backgroundColor: "#F8F8F8",
    alignItems: "center",
    borderRadius: 5,
    marginBottom: 20,
  },
  timeText: {
    fontSize: 14,
    color: "#555",
  },
  pickerContainer: {
    backgroundColor: "#F8F8F8",
    borderRadius: 5,
    marginBottom: 20,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
    color: "#555",
  },
  saveButton: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  deleteButton: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    backgroundColor: '#FF6363',
  },
});
