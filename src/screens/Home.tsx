import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '../components/SearchBar';

const { width, height } = Dimensions.get('window');

const tarefas = [
  {
    id: '1',
    titulo: 'Mercado',
    horario: '10:00 - 11:00',
    cor: '#8DA8C8',
    icon: '🛒',
  },
  {
    id: '2',
    titulo: 'Estudar',
    horario: '13:00 - 14:00',
    cor: '#A3B28D',
    icon: '📚',
  },
  {
    id: '3',
    titulo: 'Consulta',
    horario: '15:00 - 16:00',
    cor: '#FCA9F1',
    icon: '📅',
  },
  {
    id: '4',
    titulo: 'Aniversário',
    horario: '19:00 - 21:00',
    cor: '#F57F7F',
    icon: '🎁',
  },
];

export default function Home() {
  const [search, setSearch] = useState('');

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={[styles.card, { backgroundColor: item.cor }]}>
      <View style={styles.cardIcon}>
        <Text style={styles.icon}>{item.icon}</Text>
      </View>
      <View style={styles.cardText}>
        <Text style={styles.cardTitle}>{item.titulo}</Text>
        <Text style={styles.cardTime}>{item.horario}</Text>
      </View>
      <Ionicons name="checkmark-circle" size={28} color="green" />
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.outerContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Home</Text>
          <SearchBar
            placeholder="Buscar"
            value={search}
            onChangeText={(text) => setSearch(text)}
          />
          <Text style={styles.subtitle}>Minhas tarefas</Text>
          <FlatList
            data={tarefas.filter((profissional) =>
              profissional.titulo.toLowerCase().includes(search.toLowerCase())
            )}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 80 }}
          />
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
    marginTop: height * 0.07,
  },
  title: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    marginBottom: height * 0.04, 
    textAlign: 'center',
  },
  search: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    height: 45,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
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
    color: '#fff',
  },
  cardTime: {
    fontSize: 14,
    color: '#f0f0f0',
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
});
