import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Dimensions, StyleSheet, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../components/Navigation';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import { db } from '../services/firebaseConfig'; 
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const { width, height } = Dimensions.get('window');

type AdicionarMedicamentoScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AdicionarMedicamento'>;

type Props = {
  navigation: AdicionarMedicamentoScreenNavigationProp;
};

export default function Tarefa({ navigation }: Props) {
  const [titulo, setTitulo] = useState('');
  const [cor, setCor] = useState('#ffffff');
  const [data, setData] = useState(new Date());

  const predefinedColors = [
    '#FFF4E3', '#E3FFE3', '#F9E6FF',
    '#E3F9FF', '#FFFCE3', '#E3FFF4',
  ];


  const handleSave = async () => {
    try {
      const user = getAuth().currentUser;

      if (!user) {
        Alert.alert('Erro', 'Você precisa estar autenticado para salvar uma tarefa.');
        return;
      }

      // Adiciona a tarefa no Firestore
      await addDoc(collection(db, "medicamentos"), {
        titulo: titulo,
        cor: cor,
        horario: data.toLocaleTimeString(),
        userId: user.uid,
      });

      // Reseta os campos
      setTitulo('');
      setCor('#ffffff');
      setData(new Date());

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
            value={data.toLocaleTimeString()}
            onChangeText={(text) => setData(new Date(`2023-01-01T${text}:00`))}
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
