import { View, Text, Button, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/api';

export default function ProfileScreen({ navigation }: any) {
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await API.get('/profile/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      setProfile(response.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        setError('Você precisa estar autenticado para acessar esta página.');
      } else {
        setError(error.response?.data?.detail || error.message);
      }
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
        <Button title="Fazer Login" onPress={() => navigation.navigate('Login')} color="#6200ee" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      <Text style={styles.info}>Nome: {profile.username}</Text>
      <Text style={styles.info}>Email: {profile.email}</Text>

      <Button title="Voltar para Dashboard" onPress={() => navigation.navigate('Dashboard')} color="#6200ee" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#333', textAlign: 'center' },
  info: { fontSize: 16, color: '#666', marginBottom: 10 },
  error: { color: 'red', marginBottom: 20, textAlign: 'center' },
  loading: { fontSize: 16, color: '#666', textAlign: 'center' },
});
