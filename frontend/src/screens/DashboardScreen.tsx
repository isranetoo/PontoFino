import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import NavBar from '../components/NavBar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  Profile: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

function DashboardScreen({ navigation, route }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Profile')}>
        <Text style={styles.buttonText}>Ver Perfil</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>

      <NavBar navigation={navigation} />
    </View>
  );
}

export default DashboardScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', padding: 20, backgroundColor: '#fff3e0' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 30, color: '#fb8c00', textAlign: 'center' },
  button: {
    backgroundColor: '#fb8c00',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
