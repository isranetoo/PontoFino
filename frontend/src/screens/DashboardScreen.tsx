import { View, Text, Button, StyleSheet } from 'react-native';

export default function DashboardScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      <Button title="Ver Perfil" onPress={() => navigation.navigate('Profile')} />
      <Button title="Sair" onPress={() => navigation.navigate('Login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});
