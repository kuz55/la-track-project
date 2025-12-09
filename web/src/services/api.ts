import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // Замените на URL вашего бэкенда

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Добавляем токен к каждому запросу, если он есть в localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Обработка ошибок на уровне API
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Токен истёк или недействителен
      localStorage.removeItem('token');
      window.location.href = '/login'; // Перенаправить на логин
    }
    return Promise.reject(error);
  }
);

export default api;