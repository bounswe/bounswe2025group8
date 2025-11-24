import axios, { type AxiosResponse, type InternalAxiosRequestConfig, AxiosError } from 'axios';
import { authStorage } from '../features/authentication/utils';

// Determine API base URL dynamically based on current origin
function getApiBaseUrl(): string {
  const currentOrigin = window.location.origin;
  
  console.log('Current origin:', currentOrigin);
  
  // If we're on production domain (neighborhelp.webhop.me), use production API
  if (currentOrigin.includes('neighborhelp.webhop.me')) {
    console.log('Using production API URL');
    return 'https://neighborhelp.webhop.me/api';
  }
  
  // Check if we're accessing via IP address
  const isIpAddress = /^https?:\/\/(\d{1,3}\.){3}\d{1,3}(:\d+)?$/.test(currentOrigin);
  
  console.log('Is IP address?', isIpAddress);
  
  // If accessing via IP, use IP for backend too
  if (isIpAddress) {
    const ipMatch = currentOrigin.match(/^https?:\/\/([\d.]+)(:\d+)?/);
    if (ipMatch) {
      const ip = ipMatch[1];
      const apiUrl = `http://${ip}:8000/api`;
      console.log('Using IP-based API URL:', apiUrl);
      return apiUrl;
    }
  }
  
  // Default to localhost for local development
  console.log('Using localhost API URL');
  return 'http://localhost:8000/api';
}

// Create an axios instance with base URL
export const API_BASE_URL: string = getApiBaseUrl();
export const API_ORIGIN: string = new URL(API_BASE_URL).origin;
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
