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
  location: string;
  status: string;
  status_display: string;
  category: string;
  category_display: string;
  created_at: string;
  updated_at: string;
  creator: any;
  assignee: any;
  photo?: string;
  urgency_level: number;
  volunteer_number: number;
  is_recurring: boolean;
  deadline: string;
  requirements: string;
}

export interface TasksResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Task[];
}

export interface Category {
  id: string;
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

export const checkAvailability = async (email: string, phone: string): Promise<boolean> => {
  try {
    const response = await api.get('/auth/check-availability/', {
      params: {
        email,
        phone_number: phone
      }
    });
    return response.data.available;
  } catch (error) {
    console.error('Availability check error:', error);
    return false;
  }
};

export const register = async (
  email: string,
  password: string,
  fullName: string,
  username: string,
  phone: string
): Promise<RegisterResponse> => {
  try {
    console.log('Sending registration request to:', `${API_BASE_URL}/auth/register/`);
    
    // Split full name into name and surname
    const nameParts = fullName.trim().split(' ');
    const name = nameParts[0];
    const surname = nameParts.slice(1).join(' ') || name; // Use first name as surname if no surname provided
    
    // Validate phone number format (10-15 digits, optional + prefix)
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      throw new Error('Phone number must be 10-15 digits with an optional + prefix');
    }
    
    // Validate password requirements
    const passwordValidation = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    if (!Object.values(passwordValidation).every(Boolean)) {
      const missing = [];
      if (!passwordValidation.length) missing.push('at least 8 characters');
      if (!passwordValidation.uppercase) missing.push('an uppercase letter');
      if (!passwordValidation.lowercase) missing.push('a lowercase letter');
      if (!passwordValidation.number) missing.push('a number');
      if (!passwordValidation.special) missing.push('a special character');
      throw new Error(`Password must contain ${missing.join(', ')}`);
    }
    
    // Match backend's expected field order exactly
    const requestData = {
      name,
      surname,
      username,
      email,
      phone_number: phone,
      password,
      confirm_password: password
    };
    
    console.log('Registration request data:', requestData);
    const response = await api.post<RegisterResponse>('/auth/register/', requestData);
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
      
      // Check for specific validation errors from backend
      if (error.response?.data?.data) {
        const errors = error.response.data.data;
        
        // Password validation errors
        if (errors.password) {
          const passwordErrors = errors.password;
          if (Array.isArray(passwordErrors)) {
            throw new Error(passwordErrors[0]);
          } else {
            throw new Error(passwordErrors);
          }
        }
        
        // Phone number validation errors
        if (errors.phone_number) {
          const phoneErrors = errors.phone_number;
          if (Array.isArray(phoneErrors)) {
            throw new Error(phoneErrors[0]);
          } else {
            throw new Error(phoneErrors);
          }
        }
        
        // Username validation errors
        if (errors.username) {
          const usernameErrors = errors.username;
          if (Array.isArray(usernameErrors)) {
            throw new Error(usernameErrors[0]);
          } else {
            throw new Error(usernameErrors);
          }
        }
        
        // Email validation errors
        if (errors.email) {
          const emailErrors = errors.email;
          if (Array.isArray(emailErrors)) {
            throw new Error(emailErrors[0]);
          } else {
            throw new Error(emailErrors);
          }
        }
        
        // Name validation errors
        if (errors.name) {
          const nameErrors = errors.name;
          if (Array.isArray(nameErrors)) {
            throw new Error(nameErrors[0]);
          } else {
            throw new Error(nameErrors);
          }
        }
        
        // Surname validation errors
        if (errors.surname) {
          const surnameErrors = errors.surname;
          if (Array.isArray(surnameErrors)) {
            throw new Error(surnameErrors[0]);
          } else {
            throw new Error(surnameErrors);
          }
        }
      }
    }
    throw error;
  }
};

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    console.log('API Base URL:', API_BASE_URL);
    console.log('Sending login request to:', `${API_BASE_URL}/auth/login/`);
    console.log('Request payload:', { email, password });
    const response = await api.post<LoginResponse>('/auth/login/', {
      email,
      password
    });
    console.log('Response data:', response.data);
    
    // Store the token from the response data
    if (response.data.data?.token) {
      await AsyncStorage.setItem('token', response.data.data.token);
      
      // Fetch and store user profile
      if (response.data.data?.user_id) {
        const profileResponse = await getUserProfile(response.data.data.user_id);
        await AsyncStorage.setItem('userProfile', JSON.stringify(profileResponse.data));
      }
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
    console.log('Fetching categories from tasks');
    const response = await api.get<TasksResponse>('/tasks/');
    console.log('Tasks response:', response.data);
    
    // Extract unique categories from tasks
    const categoryMap = new Map<string, Category>();
    response.data.results.forEach(task => {
      console.log('Processing task category:', task.category, 'display:', task.category_display);
      if (!categoryMap.has(task.category)) {
        categoryMap.set(task.category, {
          id: task.category,
          name: task.category_display || task.category,
          description: task.category_display || task.category,
          task_count: 1
        });
      } else {
        const category = categoryMap.get(task.category)!;
        category.task_count += 1;
      }
    });

    const categories = Array.from(categoryMap.values());
    console.log('Generated categories:', categories);
    return {
      count: categoryMap.size,
      next: null,
      previous: null,
      results: categories
    };
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

export const createTask = async (taskData: {
  title: string;
  description: string;
  category: string;
  location: string;
  deadline: string;
  requirements: string;
  urgency_level: number;
  volunteer_number: number;
  is_recurring: boolean;
}): Promise<Task> => {
  try {
    console.log('Creating task:', taskData);
    const response = await api.post<Task>('/tasks/', taskData);
    console.log('Create task response:', response.data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Create task error details:', {
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