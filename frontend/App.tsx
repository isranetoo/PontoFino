import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './src/navigation/AppNavigator';
import LoginScreen from './src/screens/LoginScreen';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const payload = token.split('.')[1];
        const decodedPayload = payload ? JSON.parse(atob(payload)) : null;
        const isExpired = decodedPayload?.exp < Math.floor(Date.now() / 1000);
        setIsAuthenticated(!isExpired);
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return null; // Show a loading screen or spinner here if needed
  }

  return isAuthenticated ? <AppNavigator /> : <LoginScreen />;
}
