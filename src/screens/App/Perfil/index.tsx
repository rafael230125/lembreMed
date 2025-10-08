import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth, db } from '@services/firebaseConfig';
import { StackNavigationProp } from '@react-navigation/stack';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import styles from './styles';

import { TabParamList, RootStackParamList } from '@typings/types';

type PerfilNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Perfil'>,
  StackNavigationProp<RootStackParamList>
>;

type Props = {
  navigation: PerfilNavigationProp;
};

const { width, height } = Dimensions.get('window');

export default function Perfil({ navigation }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [nome, setNome] = useState('teste');
  const [email, setEmail] = useState('teste@email.com');
  const userProfileImage = 'sem foto';
  const [imagem, setImagem] = useState<string | null>(null);

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
            setEmail(userData.email || '');
            setImagem(userData.profileImage || '');
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      }
    });

    return unsubscribe;
  }, []);

  const handleLogout = () => {
    signOut(auth).then(() => {
      navigation.navigate('Login');
    }).catch((error) => {
      console.error('Erro ao fazer logout: ', error);
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {user ? (
          <View style={styles.profileContainer}>
            <View style={styles.profileCircle}>
              {imagem ? (
                <Image source={{ uri: imagem }} style={styles.profileImage} />
              ) : (
                <Ionicons name="person-circle-outline" size={60} color="#000" />
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{nome || 'Usuário'}</Text>
              <Text style={styles.userEmail}>{email}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.loadingText}>Carregando informações do usuário...</Text>
        )}

        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('MeuPerfil')}>
            <Ionicons name="person-outline" size={24} color="black" />
            <Text style={styles.optionText}>Meu perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('Configuracao')}>
            <Ionicons name="settings" size={24} color="black" />
            <Text style={styles.optionText}>Configurações</Text>
          </TouchableOpacity>

          {user && (
            <TouchableOpacity style={styles.logoutOption} onPress={handleLogout}>
              <Ionicons name="exit-outline" size={24} color="black" />
              <Text style={styles.logoutText}>Sair</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

