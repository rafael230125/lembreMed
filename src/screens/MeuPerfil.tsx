import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ScrollView, Alert } from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../services/firebaseConfig';
import { MaskedTextInput } from 'react-native-mask-text';
import { TextInput } from 'react-native';
import { RootStackParamList } from '../types/types';

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

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permissão Necessária', 'É necessário conceder permissão para acessar a galeria.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      //updateUserField('profileImage', result.assets[0].uri);
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

      const userDocRef = doc(db, 'users', user.uid);

      await updateDoc(userDocRef, {
        name: nome,
        phone: telefone,
        birthDate: dataNascimento,
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
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={{ uri: 'https://via.placeholder.com/150' }}
              style={styles.profilePhoto}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.editIcon} onPress={pickImage}>
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

        <CustomButton title="Salvar" onPress={saveProfile} style={styles.customButton} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: width * 0.1,
    paddingTop: height * 0.05,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: height * 0.03,
  },
  profilePhoto: {
    width: width * 0.17,
    height: width * 0.17,
    borderRadius: width * 0.125,
    borderWidth: 3,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#313131',
    borderRadius: 50,
    padding: 5,
  },
  formContainer: {
    width: '100%',
    marginBottom: 0,
  },
  label: {
    fontSize: width * 0.04,
    fontWeight: 'regular',
    marginBottom: 5,
    color: '#333',
  },
  customButton: {
    marginTop: height * 0.05,
    marginBottom: height * 0.1,
    alignSelf: 'center',
  },
  input: {
    width: '100%',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    fontSize: 16,
    paddingVertical: 10,
    marginBottom: 20,
  },
});