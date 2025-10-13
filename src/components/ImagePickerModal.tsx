import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import Modal from "react-native-modal";
import * as ImagePicker from "expo-image-picker";
import styles from "@screens/App/AdicionarMedicamento/styles";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  imagem: string | null;
  setImagem: (uri: string | null) => void;
  ocrMode: boolean;
  setOcrMode: (val: boolean) => void;
  setTitulo: (titulo: string) => void;
  setFrequenciaTipo: (tipo: 'diaria' | 'horas' | 'semana') => void;
  setFrequenciaQuantidade: (qtd: number) => void;
  setFreqInputText: (text: string) => void;
  processarImagem: (uri: string) => Promise<{ medicamento: string, frequencia: string, duracao: string }>;
  handleSave: () => void;
}

export default function ImagePickerModal({
  isVisible, onClose, imagem, setImagem, ocrMode, setOcrMode,
  setTitulo, setFrequenciaTipo, setFrequenciaQuantidade, setFreqInputText,
  processarImagem, handleSave
}: Props) {

  const handlePickImage = async (fromCamera: boolean) => {
    onClose();

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.5 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.5 });

    if (!result.canceled) {
      const uri = result.assets[0].uri;

      if (ocrMode) {
        try {
          const dados = await processarImagem(uri);
          if (dados.medicamento) setTitulo(dados.medicamento);
          if (dados.frequencia) {
            setFrequenciaTipo('horas');
            setFrequenciaQuantidade(Number(dados.frequencia));
            setFreqInputText(String(dados.frequencia));
          }

          Alert.alert(
            "Confirme os dados",
            `Medicamento: ${dados.medicamento}\nFrequência: ${dados.frequencia}h\nDuração: ${dados.duracao} dias`,
            [
              { text: "Cancelar", style: "cancel" },
              { text: "Confirmar", onPress: () => { /* só fecha o alert */ } }
            ]
          );
        } catch {
          Alert.alert("Erro", "Não foi possível processar a prescrição.");
        }
        setOcrMode(false);
      } else {
        setImagem(uri);
      }
    }
  };

  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose}>
      <View style={styles.modalContainer}>
        <TouchableOpacity style={styles.modalButton} onPress={() => handlePickImage(true)}>
          <Text style={styles.modalButtonText}>Tirar foto</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modalButton} onPress={() => handlePickImage(false)}>
          <Text style={styles.modalButtonText}>Escolher da galeria</Text>
        </TouchableOpacity>
        {imagem && !ocrMode && (
          <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#ffcccc' }]} onPress={() => setImagem(null)}>
            <Text style={[styles.modalButtonText, { color: '#a00' }]}>Remover imagem</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.modalCancelButton} onPress={onClose}>
          <Text style={styles.modalButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
