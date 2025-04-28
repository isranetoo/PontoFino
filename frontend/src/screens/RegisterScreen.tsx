import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import API from '../api/api';

export default function RegisterScreen({ navigation }: any) {
  // Disable the header for this screen
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      const response = await API.post('/register/', {
        username,
        email,
        password,
      });
      console.log(response.data);
      Alert.alert('Cadastro realizado!');
      navigation.navigate('Login');
    } catch (error: any) {
      console.error(error.response?.data || error.message);
      Alert.alert('Erro no cadastro', 'Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Conta</Text>
      <Text style={styles.subtitle}>Preencha os campos abaixo para se registrar</Text>

      <TextInput
        placeholder="Nome de Usuário"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        placeholderTextColor="#aaa"
      />
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

      <Button title="Registrar" onPress={handleRegister} color="#6200ee" />
      <Text style={styles.loginText} onPress={() => navigation.navigate('Login')}>
        Já tem conta? <Text style={styles.loginLink}>Entrar</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10, color: '#333', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', marginBottom: 15, padding: 12, borderRadius: 8, backgroundColor: '#fff' },
  loginText: { marginTop: 15, textAlign: 'center', color: '#666' },
  loginLink: { color: '#6200ee', fontWeight: 'bold' },
});
