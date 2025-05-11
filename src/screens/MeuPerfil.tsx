import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { StackNavigationProp } from '@react-navigation/stack';
import Toast from 'react-native-toast-message';
import { useUserContext } from '../context/UserContext';
import { getFirestore, doc, updateDoc } from 'firebase/firestore'; 

const { width, height } = Dimensions.get('window');

type MeuPerfilScreenNavigationProp = StackNavigationProp<{
  Main: undefined;
}>;

type Props = {
  navigation: MeuPerfilScreenNavigationProp;
};

export default function MeuPerfil({ navigation }: Props) {
  //const { userData, updateUserField } = useUserContext();
  //const db = getFirestore();

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

  const saveProfile = async () => {

    {/* 
    try {
      const userId = userData.uid || 'default_user'; 
      const userDoc = doc(db, 'users', userId); 
      
      await updateDoc(userDoc, {
        name: userData.name,
        phone: userData.phone,
        email: userData.email,
        birthDate: userData.birthDate,
        profileImage: userData.profileImage,
      });

      Toast.show({
        type: 'success',
        text1: 'Perfil salvo com sucesso! 🧑',
        visibilityTime: 1000,
        autoHide: true,
        topOffset: 50,
      });

      navigation.navigate('Main');
    } catch (error) {
      console.error('Erro ao salvar o perfil:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao salvar o perfil!',
        visibilityTime: 1000,
        autoHide: true,
        topOffset: 50,
      });
    }
      */}
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
          <CustomInput
            value={ ''}
            placeholder="Nome"
            placeholderTextColor="#aaa"
            onChangeText={(name) => updateUserField('name', name)}
          />

          <Text style={styles.label}>Telefone</Text>
          <CustomInput
            value={ ''}
            placeholder="Telefone"
            placeholderTextColor="#aaa"
            onChangeText={(phone) => updateUserField('phone', phone)}
          />
          <Text style={styles.label}>Data de Nascimento</Text>
          <CustomInput
            value={ ''}
            placeholder="Data de nascimento"
            placeholderTextColor="#aaa"
            onChangeText={(birthDate) => updateUserField('birthDate', birthDate)}
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
});
