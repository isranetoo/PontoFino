import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import API from '../api/api';

export default function RegisterScreen({ navigation }: any) {
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
      <Text style={styles.title}>Registrar</Text>

      <TextInput
        placeholder="Nome de Usuário"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
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

      <Button title="Registrar" onPress={handleRegister} />
      <Button title="Já tem conta? Entrar" onPress={() => navigation.navigate('Login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 10, padding: 10, borderRadius: 5 },
});
