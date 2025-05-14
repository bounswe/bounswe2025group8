import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use different base URLs for iOS and Android
const API_BASE_URL = Platform.select({
  ios: 'http://192.168.1.106:8000/api',     // For iOS simulator and Expo Go
  android: 'http://10.0.2.2:8000/api',  // For Android emulator
  default: 'http://10.0.2.2:8000/api'
});

interface LoginResponse {
  status: string;
  message: string;
  data: {
    token: string;
    user_id: number;
  };
}

interface RegisterResponse {
  status: string;
  message: string;
  data: {
    user_id: number;
    name: string;
    email: string;
  };
}

export interface ForgotPasswordResponse {
  status: string;
  message: string;
  data?: {
    token?: string;
  };
}

export interface UserProfile {
  id: number;
  name: string;
  surname: string;
  username: string;
  email: string;
  phone_number: string;
  location: string;
  rating: number;
  completed_task_count: number;
  is_active: boolean;
}

export interface UserProfileResponse {
  status: string;
  message: string;
  data: UserProfile;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  price: number;
  created_at: string;
  status: string;
  user: {
    id: number;
    name: string;
    surname: string;
  };
}

export interface TasksResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Task[];
}

export interface Category {
  id: number;
  name: string;
  description: string;
  task_count: number;
}

export interface CategoriesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Category[];
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const register = async (
  email: string,
  password: string,
  name: string,
  username: string,
  phone: string
): Promise<RegisterResponse> => {
  try {
    console.log('Sending registration request to:', `${API_BASE_URL}/auth/register/`);
    const response = await api.post<RegisterResponse>('/auth/register/', {
      email,
      password,
      confirm_password: password,
      name,
      surname: name,
      username,
      phone_number: phone
    });
    console.log('Registration response:', response.data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Registration error details:', {
        error: error.message,
        request: error.config,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
    }
    throw error;
  }
};

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    console.log('API Base URL:', API_BASE_URL);
    console.log('Sending login request to:', `${API_BASE_URL}/auth/login/`);
    console.log('Request payload:', { email, password });
    const response = await api.post<LoginResponse>('/auth/login/', { email, password });
    console.log('Response data:', response.data);
    
    // Store the token from the response data
    if (response.data.data?.token) {
      await AsyncStorage.setItem('token', response.data.data.token);
    }
    
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Login error details:', {
        error,
        request: error.config,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
    }
    throw error;
  }
};

export const forgotPassword = async (email: string): Promise<ForgotPasswordResponse> => {
  try {
    console.log('Sending forgot password request to:', `${API_BASE_URL}/auth/request-reset/`);
    const response = await api.post<ForgotPasswordResponse>('/auth/request-reset/', { email });
    console.log('Forgot password response:', response.data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Forgot password error details:', {
        error: error.message,
        request: error.config,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
    }
    throw error;
  }
};

export const getUserProfile = async (userId: number): Promise<UserProfileResponse> => {
  try {
    console.log('Fetching user profile for:', userId);
    const response = await api.get<UserProfileResponse>(`/users/${userId}/`);
    console.log('User profile response:', response.data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Get user profile error details:', {
        error: error.message,
        request: error.config,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
    }
    throw error;
  }
};

export const getTasks = async (): Promise<TasksResponse> => {
  try {
    console.log('Fetching tasks');
    const response = await api.get<TasksResponse>('/tasks/');
    console.log('Tasks response:', response.data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Get tasks error details:', {
        error: error.message,
        request: error.config,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
    }
    throw error;
  }
};

export const getCategories = async (): Promise<CategoriesResponse> => {
  try {
    console.log('Fetching categories');
    const response = await api.get<CategoriesResponse>('/categories/');
    console.log('Categories response:', response.data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Get categories error details:', {
        error: error.message,
        request: error.config,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
    }
    throw error;
  }
};

export default api; 