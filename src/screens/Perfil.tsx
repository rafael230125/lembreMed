import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
//import Icon from 'react-native-vector-icons/MaterialIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useUserContext } from '../context/UserContext'; 
import { Ionicons } from '@expo/vector-icons';

type PerfilScreenNavigationProp = StackNavigationProp<{
  Configuracao: undefined;
  MeuPerfil: undefined;
  Login: undefined;
}>;

type Props = {
  navigation: PerfilScreenNavigationProp;
};

const { width, height } = Dimensions.get('window');

export default function Perfil({ navigation }: Props) {
  //const { userData } = useUserContext(); 
  const userName = 'Usuário'; 
  const userEmail =  'usuário@example.com';
  const userProfileImage  =  'sem foto';

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Perfil</Text> 
        
        <View style={styles.profileContainer}>
          <View style={styles.profileCircle}>
            <Image source={{ uri: userProfileImage }} style={styles.profileImage} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userEmail}>{userEmail}</Text>
          </View>
        </View>

        <View style={styles.optionsContainer} >
          <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('MeuPerfil')}>
            <Ionicons name="person-outline" size={24} color={""} />
            <Text style={styles.optionText}>Meu perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('Configuracao')}>
            <Ionicons name="settings" size={24} color={""} />
            <Text style={styles.optionText}>Configurações</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutOption} onPress={() => navigation.navigate('Login')}>
            <Ionicons name="exit-outline" size={24} color={""} />
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: width * 0.07, 
    paddingTop: height * 0.05, 
    backgroundColor: '#fff',
  },
  title: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    marginBottom: height * 0.04, 
    textAlign: 'center',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.03,
  },
  profileCircle: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: width * 0.1,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: width * 0.04,
  },
  profileImage: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: width * 0.1,
  },
  userInfo: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: width * 0.04, 
    color: '#777',
  },
  optionsContainer: {
    marginBottom: height * 0.03, 
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: height * 0.02,
  },
  optionText: {
    marginLeft: width * 0.03,
    fontSize: width * 0.04,
  },
  logoutOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: height * 0.02,
    marginBottom: height * 0.12, 
  },
  logoutText: {
    marginLeft: width * 0.03,
    fontSize: width * 0.04,
  },
});

