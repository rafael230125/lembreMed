import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import CustomButton from '@components/CustomButton';
import CustomInput from '@components/CustomInput';
import { db } from '@services/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Image } from 'react-native';
import Modal from 'react-native-modal';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { TabParamList } from '@typings/types';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './styles';
import { useGeminiOCR } from "@services/gemini";

type Props = BottomTabScreenProps<TabParamList, 'AdicionarMedicamento'>;
import { handleChooseImage, handleTakePicture, uploadImagem, escolherImagemComOCR } from "@utils/imageUtils";

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
  const [freqInputText, setFreqInputText] = useState(frequenciaQuantidade.toString());
  const { processarImagem, loading } = useGeminiOCR();

  const diasSemanaLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  const predefinedColors = [
    '#FFF4E3', '#E3FFE3', '#F9E6FF',
    '#E3F9FF', '#FFFCE3', '#E3FFF4',
  ];

  async function agendarNotificacao(
    dataInicio: Date,
    titulo: string,
    frequenciaTipo: 'diaria' | 'horas' | 'semana',
    frequenciaQuantidade: number,
    diasSemanaSelecionados: number[],
    idMedicamento: string
  ) {

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

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} >
      <View style={styles.outerContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Adicionar medicamento</Text>
          <Text style={styles.label}>Nome:</Text>
          <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', alignContent: 'center', height: 'auto' }}>
            <CustomInput
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Digite o nome"
              placeholderTextColor="#aaa"
            />
          </View>
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
                await handleTakePicture(setImagem);
              }}>
                <Text style={styles.modalButtonText}>Tirar foto</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalButton} onPress={async () => {
                setImageOptionsVisible(false);
                await handleChooseImage(setImagem);
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

          <CustomButton title="Preencher com IA" onPress={() => escolherImagemComOCR(
            setImagem,
            setTitulo,
            setFrequenciaTipo,
            setFrequenciaQuantidade,
            setFreqInputText,
            handleSave,
            processarImagem
          )} />

          <CustomButton title="Salvar" style={styles.saveButton} onPress={handleSave} />

        </View>
      </View>
      {loading && (
        <View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: '#ffffff',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999
        }}>
          <ActivityIndicator size="large" color="#70C4E8" />
        </View>
      )}
    </ScrollView>
  );
}

