import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Dimensions, ScrollView, Linking } from 'react-native';
import CustomButton from '@components/CustomButton';
import CustomInputZoom from '@components/CustomInputZoom';
import CustomInput from '@components/CustomInput';
import { db } from '@services/firebaseConfig';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
import Modal from 'react-native-modal';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { TabParamList } from '@typings/types';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './styles';
import { GoogleGenerativeAI } from "@google/generative-ai";


type Props = BottomTabScreenProps<TabParamList, 'AdicionarMedicamento'>;
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as FileSystem from 'expo-file-system';


const { height } = Dimensions.get('window');

export default function AdicionarMedicamento({ navigation }: Props) {
  const [titulo, setTitulo] = useState('');
  const [cor, setCor] = useState('#ffffff');
  const [data, setData] = useState(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [imagem, setImagem] = useState<string | null>(null);
  const [isImageOptionsVisible, setImageOptionsVisible] = useState(false);
  const [frequenciaTipo, setFrequenciaTipo] = useState<'diaria' | 'horas' | 'semana'>('diaria');
  const [frequenciaQuantidade, setFrequenciaQuantidade] = useState<number>(1);
  const [diasSemanaSelecionados, setDiasSemanaSelecionados] = useState<number[]>([]);
  const [dataHoraInicio, setDataHoraInicio] = useState(new Date());
  const [isFreqInputVisible, setFreqInputVisible] = useState(false);
  const [freqInputText, setFreqInputText] = useState(frequenciaQuantidade.toString());
  const [modalVisible, setModalVisible] = useState(false);
  const [modalBuscarMedicamento, setModalBuscarMedicamento] = useState('');
  const [bulaDisponivel, setBulaDisponivel] = useState(false);
  const [bulaUrl, setBulaUrl] = useState('');
  const [medicamentosFirebase, setMedicamentosFirebase] = useState<any[]>([]);
  const [loadingOCR, setLoadingOCR] = useState(false);


  useEffect(() => {
    async function carregarMedicamentos() {
      try {
        const snapshot = await getDocs(collection(db, 'bula'));
        const lista = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMedicamentosFirebase(lista);
      } catch (error) {
        console.error('Erro ao buscar medicamentos:', error);
        Alert.alert('Erro', 'Não foi possível carregar os medicamentos.');
      }
    }

    carregarMedicamentos();
  }, []);


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

  const uploadImagem = async (uri: string, userId: string): Promise<string> => {
    const storage = getStorage();

    const uriToBlob = (uri: string): Promise<Blob> => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
          resolve(xhr.response);
        };
        xhr.onerror = () => {
          reject(new Error('Erro ao converter imagem em blob'));
        };
        xhr.responseType = 'blob';
        xhr.open('GET', uri, true);
        xhr.send(null);
      });
    };

    const blob = await uriToBlob(uri);
    const imageName = `medicamentos/${userId}/${Date.now()}.jpg`;
    const imageRef = ref(storage, imageName);

    await uploadBytes(imageRef, blob);
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  };

  async function agendarNotificacao(
    dataInicio: Date,
    titulo: string,
    frequenciaTipo: 'diaria' | 'horas' | 'semana',
    frequenciaQuantidade: number,
    diasSemanaSelecionados: number[],
    idMedicamento: string
  ) {
    console.log('Data início (hora local):', dataInicio.toLocaleString());

    {
      if (frequenciaTipo === 'diaria') {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🔔 Hora do medicamento!',
            body: `Tome seu medicamento: ${titulo}`,
            sound: 'default',
            priority: Notifications.AndroidNotificationPriority.HIGH,
            data: { medicamentoId: idMedicamento },
          },
          trigger: {
            hour: dataInicio.getHours(),
            minute: dataInicio.getMinutes(),
            repeats: true,
            channelId: 'medicamentos',
          },
        });

      } else if (frequenciaTipo === 'horas') {

        const intervalSeconds = frequenciaQuantidade * 3600;

        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🔔 Hora do medicamento!',
            body: `Tome seu medicamento: ${titulo}`,
            sound: 'default',
            priority: Notifications.AndroidNotificationPriority.HIGH,
            data: { medicamentoId: idMedicamento },
          },
          trigger: {
            seconds: intervalSeconds,
            repeats: true,
            channelId: 'medicamentos',
          },
        });

      } else if (frequenciaTipo === 'semana') {

        for (const dia of diasSemanaSelecionados) {

          const agora = new Date();
          const proximoDia = new Date(agora);

          proximoDia.setHours(dataInicio.getHours(), dataInicio.getMinutes(), 0, 0);

          const diff = (dia + 7 - proximoDia.getDay()) % 7;
          if (diff === 0 && proximoDia <= agora) {
            proximoDia.setDate(proximoDia.getDate() + 7);
          } else {
            proximoDia.setDate(proximoDia.getDate() + diff);
          }

          await Notifications.scheduleNotificationAsync({
            content: {
              title: '🔔 Hora do medicamento!',
              body: `Tome seu medicamento: ${titulo}`,
              sound: 'default',
              priority: Notifications.AndroidNotificationPriority.HIGH,
              data: { medicamentoId: idMedicamento },
            },
            trigger: {
              weekday: dia + 1,
              hour: dataInicio.getHours(),
              minute: dataInicio.getMinutes(),
              repeats: true,
              channelId: 'medicamentos',
            },
          });
        }
      }
    }
  }

  const handleSave = async () => {
    try {
      const user = getAuth().currentUser;

      if (!user) {
        Alert.alert('Erro', 'Você precisa estar autenticado para salvar uma tarefa.');
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

      const dataInicio = new Date(dataHoraInicio);
      dataInicio.setHours(data.getHours());
      dataInicio.setMinutes(data.getMinutes());
      dataInicio.setSeconds(0);
      dataInicio.setMilliseconds(0);

      let imageUrl = null;
      if (imagem) {
        imageUrl = await uploadImagem(imagem, user.uid);
      }

      const docRef = await addDoc(collection(db, "medicamentos"), {
        titulo: titulo,
        dataHoraInicio: dataInicio.toISOString(),
        frequenciaTipo,
        frequenciaQuantidade,
        diasSemanaSelecionados,
        cor: cor,
        imagem: imageUrl,
        userId: user.uid,
      });

      const json = await AsyncStorage.getItem('lembretes');
      const lembretes = json ? JSON.parse(json) : [];

      const novoLembrete = {
        titulo,
        dataHoraInicio: dataInicio.toISOString(),
        frequenciaTipo,
        frequenciaQuantidade,
        diasSemanaSelecionados
      };

      lembretes.push(novoLembrete);
      await AsyncStorage.setItem('lembretes', JSON.stringify(lembretes));

      setTitulo('');
      setFrequenciaTipo('diaria');
      setFrequenciaQuantidade(1);
      setDiasSemanaSelecionados([]);
      setCor('#ffffff');
      setData(new Date());
      setImagem(null);
      setDataHoraInicio(new Date());

      Alert.alert('Sucesso', 'Lembrete salvo com sucesso!');
      navigation.goBack();
    } catch (error) {
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

  const abrirModal = () => setModalVisible(true);
  const fecharModal = () => setModalVisible(false);

  const escolherImagemGaleria = async () => {
    // Pede permissão para acessar a galeria
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permita acesso à galeria para escolher imagens.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImagem(uri);
      await processarImagemPrescricao(uri);
    }
  };
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

  const processarImagemPrescricao = async (uri: string) => {
    try {
      setLoadingOCR(true);

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
        Extraia da imagem da receita médica as informações abaixo e responda APENAS em JSON válido:
        {
          "medicamento": "nome + dosagem",
          "frequencia": "quantidade em horas, apenas o número, sem texto",
          "duracao": "em dias, apenas número"
        }
        `;
      const result = await model.generateContent([
        { text: prompt },
        { inlineData: { mimeType: "image/jpeg", data: base64 } },
      ]);

      let texto = result.response.text();

      texto = texto.replace(/```json|```/g, "").trim();

      const dados = JSON.parse(texto);

      if (dados.medicamento) setTitulo(dados.medicamento);

      if (dados.frequencia !== undefined && !isNaN(Number(dados.frequencia))) {
        setFrequenciaTipo("horas");
        setFrequenciaQuantidade(Number(dados.frequencia));
        setFreqInputText(String(dados.frequencia));
      } else {
        setFrequenciaTipo("diaria");
        setFrequenciaQuantidade(1);
        setFreqInputText("1");
      }

      Alert.alert(
        "Confirme os dados",
        `Medicamento: ${dados.medicamento}\nFrequência: ${dados.frequencia}\nDuração: ${dados.duracao}`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Confirmar", onPress: () => handleSave() }
        ]
      );
    } catch (error) {
      console.error("Erro no Gemini:", error);
      Alert.alert("Erro", "Não foi possível processar a prescrição.");
    } finally {
      setLoadingOCR(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} >
      <View style={styles.outerContainer}>
        <View style={styles.container}>
          <Modal isVisible={modalVisible} style={{ marginVertical: 70, minHeight: height * 0.7 }} onBackdropPress={() => setModalVisible(false)}>
            <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 10 }}>
              <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
                <CustomInput
                  value={modalBuscarMedicamento}
                  onChangeText={setModalBuscarMedicamento}
                  placeholder="Digite o nome do medicamento"
                  placeholderTextColor="#aaa"
                />
                {medicamentosFirebase
                  .filter(medicamento => medicamento.medicamento.toLowerCase().includes(modalBuscarMedicamento.toLowerCase()))
                  .map((medicamento: any) => (
                    <TouchableOpacity
                      key={medicamento.id}
                      style={{ padding: 15, borderBottomWidth: 1, borderColor: '#ccc' }}
                      onPress={() => {
                        setTitulo(medicamento.medicamento);
                        setFrequenciaTipo(medicamento.frequencia);
                        if (medicamento.frequencia == 'horas') {
                          setFreqInputText(String(medicamento.intervalo));
                        }
                        fecharModal();
                        if (medicamento.bula) {
                          setBulaDisponivel(true);
                          setBulaUrl(medicamento.urlBula);
                        } else {
                          setBulaDisponivel(false);
                          setBulaUrl('');
                        }
                        setImagem(medicamento.img);

                      }}
                    >
                      <Text style={{ fontSize: 16 }}>{medicamento.medicamento}</Text>
                      {medicamento.bula ? (
                        <Text style={{ color: 'green' }}>Bula disponível</Text>
                      ) : (
                        <Text style={{ color: 'red' }}>Bula não disponível</Text>
                      )}
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>
          </Modal>
          <Text style={styles.title}>Adicionar medicamento</Text>
          <Text style={styles.label}>Nome:</Text>
          <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', alignContent: 'center', height: 'auto' }}>

            <CustomInputZoom
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Digite o nome"
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity onPress={abrirModal} style={{ padding: 8, alignItems: 'center', marginTop: -16 }}>
              <Image
                source={require('../../../../assets/lupa.png')}
                style={{ width: 28, height: 28 }}
                resizeMode="contain"
              />
            </TouchableOpacity>

          </View>

          {bulaDisponivel && (
            <TouchableOpacity
              onPress={() => {
                if (bulaUrl) {
                  Linking.openURL(bulaUrl);
                } else {
                  Alert.alert('Bula não disponível', 'Desculpe, a bula deste medicamento não está disponível.');
                }
              }}
              style={{ marginBottom: 20 }}
            >
              <Text style={{ color: '#007BFF' }}>Ver bula do medicamento</Text>
            </TouchableOpacity>
          )}
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
              {data.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={isTimePickerVisible}
            mode="time"
            date={data}
            onConfirm={(selectedTime) => {
              setData(selectedTime);
              setTimePickerVisible(false);
            }}
            onCancel={() => setTimePickerVisible(false)}
          />

          <Text style={styles.label}>Frequência:</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 }}>
            {['diaria', 'horas', 'semana'].map(tipo => (
              <TouchableOpacity
                key={tipo}
                onPress={() => setFrequenciaTipo(tipo as any)}
                style={[
                  styles.freqBtn,
                  frequenciaTipo === tipo && styles.freqBtnSelected,
                ]}
              >
                <Text style={frequenciaTipo === tipo ? { color: 'white' } : {}}>
                  {tipo === 'diaria' ? 'Diária' : tipo === 'horas' ? 'A cada X horas' : 'Semanal'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {frequenciaTipo === 'horas' && (
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

          <TouchableOpacity
            style={{
              backgroundColor: '#007BFF',
              padding: 12,
              borderRadius: 8,
              marginTop: 20,
              alignItems: 'center',
            }}
            onPress={async () => {
              const { status } = await ImagePicker.requestCameraPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permissão necessária', 'Permita acesso à câmera.');
                return;
              }

              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
              });

              if (!result.canceled) {
                await processarImagemPrescricao(result.assets[0].uri);
              }
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
              Preencher com IA
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={escolherImagemGaleria} style={{
            backgroundColor: '#007BFF',
            padding: 12,
            borderRadius: 8,
            marginTop: 20,
            alignItems: 'center',
          }}>
            <Text style={{ color: 'white' }}>Selecionar da galeria</Text>
          </TouchableOpacity>

          <CustomButton title="Salvar" style={styles.saveButton} onPress={handleSave} />

        </View>
      </View>
    </ScrollView>
  );
}
