import axios, { type AxiosResponse, type InternalAxiosRequestConfig, AxiosError } from 'axios';
import { authStorage } from '../features/authentication/utils';

// Create an axios instance with base URL
const API_BASE_URL: string = 'http://35.222.191.20:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include auth token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token: string | null = authStorage.getToken();
  if (token) {
    config.headers['Authorization'] = `Token ${token}`; 
  }
  return config;
}, (error: AxiosError) => {
  return Promise.reject(error);
});

// Add a response interceptor for global error handling
api.interceptors.response.use((response: AxiosResponse) => {
  return response;
}, (error: AxiosError) => {
  // Handle global error cases
  if (error.response && error.response.status === 401) {
    // Clear auth data and redirect to login if unauthorized
    authStorage.clearAuthData();
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

export default api;