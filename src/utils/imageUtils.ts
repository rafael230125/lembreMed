import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Escolher imagem da galeria
export const handleChooseImage = async (
  setImagem: (uri: string) => void
) => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Permissão necessária", "Permita acesso à galeria para escolher imagens.");
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

// Tirar foto com a câmera
export const handleTakePicture = async (
  setImagem: (uri: string) => void
) => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Permissão necessária", "Permita acesso à câmera para tirar fotos.");
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

// Upload da imagem para Firebase Storage
export const uploadImagem = async (uri: string, userId: string): Promise<string> => {
  const storage = getStorage();

  const uriToBlob = (uri: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => resolve(xhr.response);
      xhr.onerror = () => reject(new Error("Erro ao converter imagem em blob"));
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });
  };

  const blob = await uriToBlob(uri);
  const imageName = `medicamentos/${userId}/${Date.now()}.jpg`;
  const imageRef = ref(storage, imageName);

  await uploadBytes(imageRef, blob);
  return await getDownloadURL(imageRef);
};

// Escolher imagem + processar com OCR
export const escolherImagemComOCR = async (
  setImagem: (uri: string) => void,
  setTitulo: (titulo: string) => void,
  setFrequenciaTipo: (tipo: 'diaria' | 'horas' | 'semana') => void,
  setFrequenciaQuantidade: (qtd: number) => void,
  setFreqInputText: (text: string) => void,
  handleSave: () => void,
  processarImagem: (uri: string) => Promise<{ medicamento: string, frequencia: string, duracao: string }>
) => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.5,
  });

  if (!result.canceled) {
    const uri = result.assets[0].uri;
    setImagem(uri);

    try {
      const dados = await processarImagem(uri);

      if (dados.medicamento) setTitulo(dados.medicamento);

      if (dados.frequencia) {
        setFrequenciaTipo("horas");
        setFrequenciaQuantidade(Number(dados.frequencia));
        setFreqInputText(String(dados.frequencia));
      }

      Alert.alert(
        "Confirme os dados",
        `Medicamento: ${dados.medicamento}\nFrequência: ${dados.frequencia}h\nDuração: ${dados.duracao} dias`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Confirmar", onPress: () => handleSave() }
        ]
      );
    } catch {
      Alert.alert("Erro", "Não foi possível processar a prescrição.");
    }
  }
};
