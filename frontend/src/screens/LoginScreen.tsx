import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import API from '../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await API.post('/login/', { email, password }); // Remove /api prefix
      const { access, refresh } = response.data;
      console.log('Tokens recebidos:', { access, refresh });

      // Save tokens using AsyncStorage
      await AsyncStorage.setItem('authToken', access);
      await AsyncStorage.setItem('refreshToken', refresh);

      // Navigate to the profile screen after login
      navigation.navigate('Profile');
    } catch (error: any) {
      console.error('Erro ao fazer login:', error.response?.data || error.message);
      Alert.alert('Erro no login', 'Verifique seu email e senha.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Button title="Entrar" onPress={handleLogin} />
      <Button title="Não tem conta? Registre-se" onPress={() => navigation.navigate('Register')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 10, padding: 10, borderRadius: 5 },
});
