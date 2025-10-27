import axios, { type AxiosResponse, type InternalAxiosRequestConfig, AxiosError } from 'axios';
import { authStorage } from '../features/authentication/utils';

// Create an axios instance with base URL
const API_BASE_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
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
  if (error.response?.status === 401) {
    const requestUrl = error.config?.url ?? "";
    const skipRedirect = ["/login", "/photo"].some((segment) =>
      requestUrl.includes(segment)
    );

    if (!skipRedirect) {
      authStorage.clearAuthData();
      window.location.href = "/login";
    }
  }
  return Promise.reject(error);
});

export default api;