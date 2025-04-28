import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import API from '../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

export default function LoginScreen({ navigation }: any) {
  // Disable the header for this screen
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

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
      <Text style={styles.title}>Bem-vindo</Text>
      <Text style={styles.subtitle}>Faça login para continuar</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholderTextColor="#aaa"
      />
      <TextInput
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#aaa"
      />

      <Button title="Entrar" onPress={handleLogin} color="#6200ee" />
      <Text style={styles.registerText} onPress={() => navigation.navigate('Register')}>
        Não tem conta? <Text style={styles.registerLink}>Registre-se</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10, color: '#333', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', marginBottom: 15, padding: 12, borderRadius: 8, backgroundColor: '#fff' },
  registerText: { marginTop: 15, textAlign: 'center', color: '#666' },
  registerLink: { color: '#6200ee', fontWeight: 'bold' },
});
