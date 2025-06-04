import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import { RootStackParamList } from '../types/types';
import { useUserContext } from '../context/UserContext';
import { db } from '../services/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { MaskedTextInput } from 'react-native-mask-text';
import { TextInput } from 'react-native';

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
  const [profileImage, setProfileImage] = useState<string | null>(null);

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
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    const userId = userData.uid || 'default_user';
    const userDoc = doc(db, 'users', userId);

    await setDoc(userDoc, {
      ...userData,
      name,
      phone,
      birthDate
    });

    Alert.alert('Sucesso', 'Perfil salvo com sucesso!');
    navigation.navigate('Main');

  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.outerContainer}>
        <View style={styles.container}>
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={profileImage ? { uri: profileImage } : require('../../assets/fotoPerfil.png')}
              style={styles.image}
              resizeMode="cover"
            />
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
              onChangeText={(text, rawText) => setBirthDate(rawText)}
              value={birthDate}
              keyboardType="numeric"
              placeholder="DD/MM/AAAA"
              style={styles.input}
            />

          <Text style={styles.titleSub}>Telefone:</Text>
            <MaskedTextInput
              mask="(99) 99999-9999"
              onChangeText={(text, rawText) => setPhone(rawText)}
              value={phone}
              keyboardType="numeric"
              placeholder="(00) 00000-0000"
              style={styles.input}
            />

          <CustomButton title="Salvar" onPress={handleSave} />
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
    alignItems: 'center',
    marginTop: height * 0.07,
  },
  image: {
    width: width * 0.21,
    height: height * 0.1,
    marginBottom: height * 0.02,
  },
  title: {
    color: '#000',
    fontSize: width * 0.06,
    fontWeight: 'bold',
    marginBottom: height * 0.03,
    textAlign: 'center',
  },
  titleSub: {
    fontWeight: 'regular',
    fontSize: width * 0.04,
    alignSelf: 'flex-start',
    marginBottom: height * 0.01,
  },
  radioGroup: {
    flexDirection: 'row',
    marginBottom: height * 0.04,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioText: {
    fontSize: width * 0.035,
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

