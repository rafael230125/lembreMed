import React, { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '../components/SearchBar';
import { db, collection, getDocs } from '../services/firebaseConfig';
import { StackNavigationProp } from '@react-navigation/stack';
import { getAuth } from "firebase/auth";
import { query, where } from '../services/firebaseConfig';
import { deleteDoc, doc } from 'firebase/firestore';
import { format } from 'date-fns';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { TabParamList, RootStackParamList } from '../types/types';
import { iniciarBackgroundFetch } from '../backgroundTask/backgroundTasks';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'react-native';
import ConfirmDelete from '../components/ConfirmDelete';

type HomeNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Home'>,
  StackNavigationProp<RootStackParamList>
>;

type Props = {
  navigation: HomeNavigationProp;
};

const { width, height } = Dimensions.get('window');

export default function Home({ navigation }: Props) {
  const [search, setSearch] = useState('');
  const [medicamentos, setMedicamentos] = useState<any[]>([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedIdToDelete, setSelectedIdToDelete] = useState<string | null>(null);


  useEffect(() => {
    configurarCanalNotificacoes();
    const requestPermissionsAndStartFetch = async () => {
      await Notifications.requestPermissionsAsync();
      iniciarBackgroundFetch();
    };
    requestPermissionsAndStartFetch();
  }, []);

  async function configurarCanalNotificacoes() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('medicamentos', {
        name: 'Lembretes de Medicamentos',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  }
  useFocusEffect(
    useCallback(() => {
      const fetchMedicamentos = async () => {
        try {
          const user = getAuth().currentUser;

          if (!user) {
            Alert.alert('Erro', 'Usuário não autenticado.');
            return;
          }

          const medicamentosRef = collection(db, 'medicamentos');
          const q = query(medicamentosRef, where('userId', '==', user.uid));
          const medicamentosSnapshot = await getDocs(q);
          const medicamentosList = medicamentosSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              imagem: data.imagem || null,
              ...data,
            };
          });
          setMedicamentos(medicamentosList);
        } catch (error) {
          Alert.alert('Erro', 'Não foi possível carregar os medicamentos.');
          console.error(error);
        }
      };

      fetchMedicamentos();
    }, [])
  );

  const handleDelete = async (id: string) => {
    try {
      const json = await AsyncStorage.getItem('lembretes');
      if (json) {
        const lembretes = JSON.parse(json);
        const updatedLembretes = lembretes.filter((lembrete: any) => lembrete.id !== id);
        await AsyncStorage.setItem('lembretes', JSON.stringify(updatedLembretes));
      }
      await deleteDoc(doc(db, 'medicamentos', id));
      setMedicamentos((prev) => prev.filter((tarefa) => tarefa.id !== id));
      Alert.alert('Sucesso', 'Lembrete excluído com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível excluir o lembrete.');
      console.error(error);
    }
  };

  const confirmDelete = (id: string) => {
    setSelectedIdToDelete(id);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedIdToDelete) return;

    try {
      await deleteDoc(doc(db, 'medicamentos', selectedIdToDelete));
      setMedicamentos((prev) =>
        prev.filter((med) => med.id !== selectedIdToDelete)
      );
      Alert.alert('Sucesso', 'Lembrete excluído com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível excluir o lembrete.');
      console.error(error);
    } finally {
      setDeleteModalVisible(false);
      setSelectedIdToDelete(null);
    }
  };



  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: item.cor }]}
      onPress={() => navigation.navigate('EditarMedicamento', { medicamento: item })}
    >
      <View style={styles.cardIcon}>
        {item.imagem ? (
          <Image source={{ uri: item.imagem }} style={styles.cardImage} />
        ) : (
          <Ionicons name="medkit" size={24} color="#000" />
        )}
      </View>
      <View style={styles.cardText}>
        <Text style={styles.cardTitle}>{item.titulo}</Text>
        <Text style={styles.cardTime}>{item.dataHoraInicio
          ? format(new Date(item.dataHoraInicio), 'dd/MM/yyyy HH:mm')
          : ''
        }</Text>
      </View>

      <TouchableOpacity
        onPress={(event) => {
          event.stopPropagation();
          confirmDelete(item.id);
        }}
      >
        <Ionicons name="trash" size={20} color="#000" />
      </TouchableOpacity>

    </TouchableOpacity>
  );

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Home</Text>
        <SearchBar
          placeholder="Buscar"
          value={search}
          onChangeText={(text) => setSearch(text)}
        />
        <Text style={styles.subtitle}>Meus medicamentos</Text>
        <FlatList
          data={medicamentos.filter((medicamento) =>
            medicamento.titulo.toLowerCase().includes(search.toLowerCase())
          )}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      </View>
      <ConfirmDelete
        visible={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={handleConfirmDelete}
      />

    </View>
  );
}

const styles = StyleSheet.create({
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
  subtitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    marginBottom: height * 0.03,
    marginTop: height * 0.02,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    gap: 12,
  },
  icon: {
    fontSize: 22,
    textAlign: 'center',
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  cardTime: {
    fontSize: 14,
    color: '#000',
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 25,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
  },
  cardImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    resizeMode: 'cover',
  },
});