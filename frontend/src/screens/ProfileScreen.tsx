import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/api';
import NavBar from '../components/NavBar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  Profile: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

function ProfileScreen({ navigation }: Props) {
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
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Fazer Login</Text>
        </TouchableOpacity>
        <NavBar navigation={navigation} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Carregando perfil...</Text>
        <NavBar navigation={navigation} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      <Text style={styles.info}>Nome: {profile.username}</Text>
      <Text style={styles.info}>Email: {profile.email}</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Dashboard')}>
        <Text style={styles.buttonText}>Voltar para Dashboard</Text>
      </TouchableOpacity>
      <NavBar navigation={navigation} />
    </View>
  );
}

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', padding: 20, backgroundColor: '#fff3e0' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 20, color: '#fb8c00', textAlign: 'center' },
  info: { fontSize: 16, color: '#666', marginBottom: 10 },
  error: { color: 'red', marginBottom: 20, textAlign: 'center' },
  loading: { fontSize: 16, color: '#666', textAlign: 'center' },
  button: {
    backgroundColor: '#fb8c00',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
