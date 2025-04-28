import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // Ensure baseURL is correct
  timeout: 5000,
});

// Add the token to all requests
API.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken'); // Use AsyncStorage
  if (token) {
    console.log('Token encontrado:', token); // Log to verify the token
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn('Nenhum token encontrado. Certifique-se de que o usuário está autenticado.');
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add a response interceptor to handle token expiration
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is 401 and if the token can be refreshed
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken'); // Use AsyncStorage
        if (refreshToken) {
          const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
            refresh: refreshToken,
          });

          const newAccessToken = response.data.access;
          await AsyncStorage.setItem('authToken', newAccessToken);

          // Update the Authorization header and retry the original request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return API(originalRequest);
        }
      } catch (refreshError) {
        console.error('Erro ao atualizar o token:', refreshError);
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('refreshToken');
      }
    }

    return Promise.reject(error);
  }
);

export default API;
