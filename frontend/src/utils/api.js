import axios from 'axios';
import Cookie from 'js-cookie';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.flightwatch.com'
  : 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = Cookie.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookie.remove('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
