import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions, ScrollView, Alert } from 'react-native';
import CustomButton from '@components/CustomButton';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import Modal from 'react-native-modal';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@services/firebaseConfig';
import { MaskedTextInput } from 'react-native-mask-text';
import { TextInput } from 'react-native';
import { RootStackParamList } from '@typings/types';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import styles from './styles';

const { width, height } = Dimensions.get('window');

type MeuPerfilScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MeuPerfil'>;

type Props = {
  navigation: MeuPerfilScreenNavigationProp;
};

export default function MeuPerfil({ navigation }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [imagem, setImagem] = useState<string | null>(null);
  const [isImageOptionsVisible, setImageOptionsVisible] = useState(false);

  const handleChooseImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permita acesso à galeria para escolher imagens.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
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
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImagem(result.assets[0].uri);
    }
  };

  const uploadImagem = async (uri: string, userId: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const storage = getStorage();
      const imageRef = ref(storage, `users/imagens_users/${userId}`);

      await uploadBytes(imageRef, blob);
      const downloadURL = await getDownloadURL(imageRef);

      return downloadURL;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      throw error;
    }
  };

  function formatarData(data: string) {
    if (data.length === 8) {
      return `(${data.substring(0, 2)}/${data.substring(2, 4)}/${data.substring(4)}`;
    }
    return data;
  }

  function formatarTelefone(telefone: string) {
    if (telefone.length === 11) {
      return `(${telefone.substring(0, 2)}) ${telefone.substring(2, 7)}-${telefone.substring(7)}`;

    }
    return telefone;
  }


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setUser(user);
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setNome(userData.name || '');
            setTelefone(formatarTelefone(userData.phone || ''));
            setDataNascimento(userData.birthDate || '');
            setImagem(userData.profileImage || '');
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    });

    return unsubscribe;
  }, []);

  const saveProfile = async () => {
    try {
      const user = getAuth().currentUser;

      if (!user) {
        Alert.alert('Erro', 'Usuário não autenticado.');
        return;
      }

      let imagemURL = null;

      if (imagem && !imagem.startsWith('http')) {
        // Nova imagem foi escolhida
        imagemURL = await uploadImagem(imagem, user.uid);
      } else if (imagem && imagem.startsWith('http')) {
        // Mantém imagem já existente
        imagemURL = imagem;
      } else if (!imagem && user.photoURL) {
        // Imagem foi removida — excluir do Storage
        const storage = getStorage();
        const imageRef = ref(storage, `users/imagens_users/${user.uid}/`);
        try {
          await deleteObject(imageRef);
          console.log('Imagem removida');
        } catch (error) {
          console.warn('Erro ao remover imagem:', error);
        }
      }

      const userDocRef = doc(db, 'users', user.uid);

      await updateDoc(userDocRef, {
        name: nome,
        phone: telefone,
        birthDate: dataNascimento,
        profileImage: imagemURL,
      });

      Alert.alert('Perfil', 'Salvo com sucesso!');

      navigation.navigate('Main');
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível salvar o perfil.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.photoContainer}>
          {imagem ? (
            <Image
              source={{ uri: imagem }}
              style={styles.profilePhoto}
              resizeMode="contain"
            />
          ) : (
            <Ionicons name="person-circle-outline" size={60} color="#000" />
          )}
          <TouchableOpacity style={styles.editIcon} onPress={() => setImageOptionsVisible(true)}>
            <Ionicons name="pencil" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            value={nome}
            placeholder="Nome"
            placeholderTextColor="#aaa"
            onChangeText={(text) => setNome(text)}
          />

          <Text style={styles.label}>Telefone</Text>
          <MaskedTextInput
            mask="(99) 99999-9999"
            onChangeText={(masked, unmasked) => setTelefone(unmasked)}
            value={telefone}
            keyboardType="numeric"
            style={styles.input}
            placeholder='(00) 00000-0000'
          />
          <Text style={styles.label}>Data de Nascimento</Text>
          <MaskedTextInput
            mask="99/99/9999"
            onChangeText={(masked, unmasked) => setDataNascimento(unmasked)}
            value={dataNascimento}
            keyboardType="numeric"
            style={styles.input}
            placeholder='DD/MM/AAAA'
          />
        </View>

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

        <CustomButton title="Salvar" onPress={saveProfile} style={styles.customButton} />
      </View>
    </ScrollView>
  );
}

