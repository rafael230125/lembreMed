import React, { useState } from 'react';
import { View, Text, Dimensions, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import CustomButton from '@components/CustomButton';
import { RootStackParamList } from '@typings/types';
import { useUserContext } from '@context/UserContext';
import { db } from '@services/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { MaskedTextInput } from 'react-native-mask-text';
import { TextInput } from 'react-native';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as FileSystem from 'expo-file-system';
import Modal from 'react-native-modal';
import styles from './styles';

const { width, height } = Dimensions.get('window');

type InformacaoContaScreenNavigationProp = StackNavigationProp<RootStackParamList, 'InformacaoConta'>;

type Props = {
  navigation: InformacaoContaScreenNavigationProp;
};

export default function InformacaoConta({ navigation }: Props) {
  const { userData } = useUserContext();
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [birthDate, setBirthDate] = useState<string>('');
  const [imagem, setImagem] = useState<string | null>(null);
  const [isImageOptionsVisible, setImageOptionsVisible] = useState(false);

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

    // Converte a imagem local para blob
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
    const imageName = `users/imagens_users/${userId}/${Date.now()}.jpg`;
    const imageRef = ref(storage, imageName);

    await uploadBytes(imageRef, blob);
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  };

  const handleSave = async () => {
    const userId = userData.uid || 'default_user';
    const userDoc = doc(db, 'users', userId);

    let imageUrl = null;
    if (imagem) {
      imageUrl = await uploadImagem(imagem, userId);
    }

    await setDoc(userDoc, {
      ...userData,
      name,
      phone,
      birthDate,
      profileImage: imageUrl,
    });

    Alert.alert('Sucesso', 'Perfil salvo com sucesso!');
    navigation.navigate('Main');

  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.outerContainer}>
        <View style={styles.container}>
          <TouchableOpacity onPress={() => setImageOptionsVisible(true)}>
            {imagem ? (
              <Image
                source={{ uri: imagem }}
                style={styles.image}
                resizeMode="contain"
              />
            ) : (
              <Image
                source={require('../../../../assets/fotoPerfil.png')}
                style={styles.image}
                resizeMode="cover"
              />
            )}
          </TouchableOpacity>
          <Text style={styles.titleSub}>Nome:</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome"
            value={name}
            onChangeText={setName}
          />
          <Text style={styles.titleSub}>Data de nascimento:</Text>
          <MaskedTextInput
            mask="99/99/9999"
            onChangeText={(masked, unmasked) => setBirthDate(unmasked)}
            value={birthDate}
            keyboardType="numeric"
            placeholder="DD/MM/AAAA"
            style={styles.input}
          />

          <Text style={styles.titleSub}>Telefone:</Text>
          <MaskedTextInput
            mask="(99) 99999-9999"
            onChangeText={(masked, unmasked) => setPhone(unmasked)}
            value={phone}
            keyboardType="numeric"
            placeholder="(00) 00000-0000"
            style={styles.input}
          />

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

          <CustomButton title="Salvar" onPress={handleSave} />
        </View>
      </View>
    </ScrollView>
  );
}



