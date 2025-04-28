import { View, Text, Button, StyleSheet } from 'react-native';

export default function DashboardScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      <Button title="Ver Perfil" onPress={() => navigation.navigate('Profile')} color="#6200ee" />
      <Button title="Sair" onPress={() => navigation.navigate('Login')} color="#6200ee" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#333', textAlign: 'center' },
});
