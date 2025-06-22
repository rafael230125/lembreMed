import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Dimensions, StyleSheet, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import { auth, db } from '../services/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
import Modal from 'react-native-modal';
import { RootStackParamList } from '../types/types';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const { width, height } = Dimensions.get('window');

import { useRoute, RouteProp } from '@react-navigation/native';

type EditarMedicamentoNavigationProp = StackNavigationProp<RootStackParamList, 'EditarMedicamento'>;

type EditarMedicamentoRouteProp = RouteProp<RootStackParamList, 'EditarMedicamento'>;

type Props = {
  navigation: EditarMedicamentoNavigationProp;
};

export default function EditarMedicamento({ navigation }: Props) {
  const route = useRoute<EditarMedicamentoRouteProp>();
  const { medicamento } = route.params;
  const [titulo, setTitulo] = useState(medicamento?.titulo || '');
  const [cor, setCor] = useState(medicamento?.cor || '#ffffff');

  const [frequenciaTipo, setFrequenciaTipo] = useState<'diaria' | 'hora' | 'semana'>(
    (medicamento?.frequenciaTipo as 'diaria' | 'hora' | 'semana') || 'diaria'
  );


  const [diasSemanaSelecionados, setDiasSemanaSelecionados] = useState<number[]>(
    Array.isArray(medicamento?.diasSemanaSelecionados)
      ? medicamento.diasSemanaSelecionados
      : []
  );

  const [frequenciaQuantidade, setFrequenciaQuantidade] = useState<number>(
    medicamento?.frequenciaQuantidade ?? 1
  );

  const dataHora = medicamento?.dataHoraInicio
    ? new Date(medicamento.dataHoraInicio)
    : new Date();

  const [dataHoraInicio, setDataHoraInicio] = useState<Date>(dataHora);

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [imagem, setImagem] = useState<string | null>(medicamento?.imagem || null);
  const [isImageOptionsVisible, setImageOptionsVisible] = useState(false);
  const [isFreqInputVisible, setFreqInputVisible] = useState(false);
  const [freqInputText, setFreqInputText] = useState(frequenciaQuantidade.toString());

  const diasSemanaLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  const predefinedColors = [
    '#FFF4E3', '#E3FFE3', '#F9E6FF',
    '#E3F9FF', '#FFFCE3', '#E3FFF4',
  ];

  const handleChooseImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permita acesso à galeria para escolher imagens.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImagem(result.assets[0].uri);
    }
  };

  const handleTakePicture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permita acesso à câmera para tirar fotos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImagem(result.assets[0].uri);
    }
  };

  const uploadImagem = async (uri: string, userId: string, medicamentoId: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const storage = getStorage();
      const imageRef = ref(storage, `imagens_medicamentos/${userId}/${medicamentoId}`);

      await uploadBytes(imageRef, blob);
      const downloadURL = await getDownloadURL(imageRef);

      return downloadURL;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    try {
      const user = getAuth().currentUser;

      if (!user) {
        Alert.alert('Erro', 'Você precisa estar autenticado para salvar um lembrete.');
        return;
      }

      if (!titulo.trim()) {
        Alert.alert('Erro', 'Digite o nome do medicamento.');
        return;
      }

      if (frequenciaTipo === 'semana' && diasSemanaSelecionados.length === 0) {
        Alert.alert('Erro', 'Selecione pelo menos um dia da semana.');
        return;
      }

      const medicamentoDocRef = doc(db, 'medicamentos', medicamento.id);

      let imagemURL = null;

      if (imagem && !imagem.startsWith('http')) {
        // Nova imagem foi escolhida
        imagemURL = await uploadImagem(imagem, user.uid, medicamento.id);
      } else if (imagem && imagem.startsWith('http')) {
        // Mantém imagem já existente
        imagemURL = imagem;
      } else if (!imagem && medicamento.imagem) {
        // Imagem foi removida — excluir do Storage
        const storage = getStorage();
        const imageRef = ref(storage, `imagens_medicamentos/${user.uid}/${medicamento.id}`);
        try {
          await deleteObject(imageRef);
          console.log('Imagem removida');
        } catch (error) {
          console.warn('Erro ao remover imagem:', error);
        }
      }

      await updateDoc(medicamentoDocRef, {
        titulo: titulo,
        cor: cor,
        dataHoraInicio: dataHoraInicio.toISOString(),
        diasSemanaSelecionados: diasSemanaSelecionados,
        frequenciaQuantidade: frequenciaQuantidade,
        frequenciaTipo: frequenciaTipo,
        imagem: imagemURL,
      });

      Alert.alert('Sucesso', 'Lembrete salvo com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar o lembrete:', error);
      Alert.alert('Erro', 'Não foi possível salvar o lembrete.');
    }
  };

  const openFreqInput = () => {
    setFreqInputText(frequenciaQuantidade.toString());
    setFreqInputVisible(true);
  };

  const confirmarFreqInput = () => {
    const num = Number(freqInputText);
    if (!isNaN(num) && num > 0) {
      setFrequenciaQuantidade(num);
      setFreqInputVisible(false);
    } else {
      Alert.alert('Número inválido', 'Digite um número válido maior que zero.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.outerContainer}>
        <View style={styles.container}>
          <Text style={styles.label}>Nome:</Text>
          <CustomInput
            value={titulo}
            onChangeText={setTitulo}
            placeholder="Digite o nome"
            placeholderTextColor="#aaa"
          />

          <Text style={styles.label}>Data de Início:</Text>
          <TouchableOpacity
            style={styles.info}
            onPress={() => setDatePickerVisible(true)}
          >
            <Text>{dataHoraInicio.toLocaleDateString('pt-BR')}</Text>
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={datePickerVisible}
            mode="date"
            date={dataHoraInicio}
            onConfirm={(selectedDate) => {
              setDataHoraInicio(selectedDate);
              setDatePickerVisible(false);
            }}
            onCancel={() => setDatePickerVisible(false)}
          />

          <Text style={styles.label}>Horário:</Text>
          <TouchableOpacity
            style={styles.timePicker}
            onPress={() => setTimePickerVisible(true)}
          >
            <Text style={styles.timeText}>
              {dataHoraInicio.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={isTimePickerVisible}
            mode="time"
            date={dataHoraInicio}
            onConfirm={(selectedTime) => {
              setDataHoraInicio(selectedTime);
              setTimePickerVisible(false);
            }}
            onCancel={() => setTimePickerVisible(false)}
          />

          <Text style={styles.label}>Frequência:</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 }}>
            {['diaria', 'hora', 'semana'].map(tipo => (
              <TouchableOpacity
                key={tipo}
                onPress={() => setFrequenciaTipo(tipo as any)}
                style={[
                  styles.freqBtn,
                  frequenciaTipo === tipo && styles.freqBtnSelected,
                ]}
              >
                <Text style={frequenciaTipo === tipo ? { color: 'white' } : {}}>
                  {tipo === 'diaria' ? 'Diária' : tipo === 'hora' ? 'A cada X horas' : 'Semanal'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {frequenciaTipo === 'hora' && (
            <>
              <Text style={styles.label}>A cada quantas horas?</Text>
              <CustomInput
                value={freqInputText}
                onChangeText={text => {
                  setFreqInputText(text);
                  const num = Number(text);
                  if (!isNaN(num) && num > 0) {
                    setFrequenciaQuantidade(num);
                  }
                }}
                keyboardType="numeric"
                placeholder="Ex: 8" placeholderTextColor={''} />
            </>
          )}

          {frequenciaTipo === 'semana' && (
            <>
              <Text style={styles.label}>Selecione os dias da semana:</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 }}>
                {diasSemanaLabels.map((label, i) => {
                  const selecionado = diasSemanaSelecionados.includes(i);
                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => {
                        if (selecionado) {
                          setDiasSemanaSelecionados(diasSemanaSelecionados.filter(d => d !== i));
                        } else {
                          setDiasSemanaSelecionados([...diasSemanaSelecionados, i]);
                        }
                      }}
                      style={[
                        styles.dayBtn,
                        selecionado && styles.dayBtnSelected,
                      ]}
                    >
                      <Text style={selecionado ? { color: 'white' } : {}}>{label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

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

          <Text style={styles.label}>Foto do medicamento:</Text>

          <TouchableOpacity onPress={() => setImageOptionsVisible(true)} style={styles.imagePicker}>
            {imagem ? (
              <Image
                source={{ uri: imagem }}
                style={styles.imagePreview}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.imagePlaceholderText}>Toque para adicionar imagem</Text>
            )}
          </TouchableOpacity>

          <Modal
            isVisible={isImageOptionsVisible}
            onBackdropPress={() => setImageOptionsVisible(false)}
          >
            <View style={styles.modalContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={async () => {
                setImageOptionsVisible(false);
                await handleTakePicture();
              }}>
                <Text style={styles.modalButtonText}>Tirar foto</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalButton} onPress={async () => {
                setImageOptionsVisible(false);
                await handleChooseImage();
              }}>
                <Text style={styles.modalButtonText}>Escolher da galeria</Text>
              </TouchableOpacity>

              {imagem && (
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#ffcccc' }]} onPress={() => {
                  setImageOptionsVisible(false);
                  setImagem(null);
                }}>
                  <Text style={[styles.modalButtonText, { color: '#a00' }]}>Remover imagem</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setImageOptionsVisible(false)}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </Modal>

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
    marginTop: height * 0.01,
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
  imagePicker: {
    height: 200,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  imagePlaceholderText: {
    color: '#888',
    fontSize: 16,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalButton: {
    width: '100%',
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  modalCancelButton: {
    width: '100%',
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  modalButtonText: {
    fontSize: 16,
  },
  input: {
    padding: 12,
    backgroundColor: "#F8F8F8",
    borderRadius: 5,
    marginBottom: 20,
  },
  info: {
    padding: 12,
    backgroundColor: "#F8F8F8",
    borderRadius: 5,
    marginBottom: 20,
  },
  freqBtn: {
    paddingVertical: 10,
    paddingHorizontal: 15,

    borderRadius: 5,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: "#F8F8F8",
  },
  freqBtnSelected: {
    backgroundColor: "#68BAE8",
    borderColor: "#68BAE8",
  },
  dayBtn: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#ddd",
    minWidth: 40,
    alignItems: "center",
    marginRight: 8,
    marginBottom: 8,
  },
  dayBtnSelected: {
    backgroundColor: "#68BAE8",
  },
});
