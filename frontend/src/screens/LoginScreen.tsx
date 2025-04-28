import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import API from '../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Login'>>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await API.post('/login/', { email, password });
      const { access, refresh } = response.data;
      console.log('Tokens recebidos:', { access, refresh });

      await AsyncStorage.setItem('authToken', access);
      await AsyncStorage.setItem('refreshToken', refresh);

      if (navigation && navigation.navigate) {
        navigation.navigate('Dashboard'); // Certifique-se de que 'Dashboard' é uma rota válida
        Alert.alert('Login bem-sucedido', 'Bem-vindo de volta!');
      } else {
        console.error('Erro: navigation não está definido.');
      }
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
        placeholderTextColor="#888"
      />
      <TextInput
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#888"
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
      <Text style={styles.registerText} onPress={() => navigation.navigate('Register')}>
        Não tem conta? <Text style={styles.registerLink}>Registre-se</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff3e0' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 10, color: '#fb8c00', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', marginBottom: 15, padding: 12, borderRadius: 8, backgroundColor: '#fff' },
  button: {
    backgroundColor: '#fb8c00',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  registerText: { marginTop: 15, textAlign: 'center', color: '#666' },
  registerLink: { color: '#fb8c00', fontWeight: 'bold' },
});

export default LoginScreen;
