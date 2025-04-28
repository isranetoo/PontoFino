import { View, Text, Button, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import API from '../api/api';

export default function ProfileScreen({ navigation }: any) {
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken'); // Retrieve the access token
      const response = await API.get('/profile/', {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
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
        <Button title="Fazer Login" onPress={() => navigation.navigate('Login')} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      <Text>Nome: {profile.username}</Text>
      <Text>Email: {profile.email}</Text>

      <Button title="Voltar para Dashboard" onPress={() => navigation.navigate('Dashboard')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  error: { color: 'red', marginBottom: 20 },
});
