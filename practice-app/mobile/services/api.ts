import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.12:8000/api';

interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

interface LoginResponse {
  token: string;
  user_id: number;
}

interface UserData {
  id: number;
  name: string;
  surname: string;
  username: string;
  email: string;
  phone_number: string;
}

interface RegisterData {
  name: string;
  surname: string;
  username: string;
  email: string;
  phone_number: string;
  password: string;
  confirm_password: string;
}

interface LoginData {
  email: string;
  password: string;
}

const handleResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    console.error('Non-JSON response:', text);
    throw new Error('Server returned non-JSON response');
  }

  const data = await response.json();
  console.log('API Response:', data);
  return data;
};

export const api = {
  async login(data: LoginData): Promise<LoginResponse> {
    try {
      console.log('Attempting login with:', { email: data.email });
      const response = await fetch(`${API_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<LoginResponse> = await handleResponse(response);

      if (result.status === 'error') {
        throw new Error(result.message || 'Login failed');
      }

      if (!result.data?.token) {
        throw new Error('No token received');
      }

      await AsyncStorage.setItem('token', result.data.token);
      await AsyncStorage.setItem('userId', result.data.user_id.toString());
      return result.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async register(data: RegisterData): Promise<LoginResponse> {
    try {
      console.log('Attempting registration with:', { email: data.email, username: data.username });
      const response = await fetch(`${API_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          surname: data.surname,
          username: data.username,
          email: data.email,
          phone_number: data.phone_number,
          password: data.password,
          confirm_password: data.confirm_password
        }),
      });

      const result: ApiResponse<any> = await handleResponse(response);

      if (result.status === 'error') {
        // Check for specific error messages in the data object
        if (result.data) {
          const errorMessages = Object.entries(result.data)
            .map(([field, messages]) => {
              if (Array.isArray(messages)) {
                return messages.join(', ');
              }
              return `${field}: ${messages}`;
            })
            .join('\n');
          
          if (errorMessages) {
            throw new Error(errorMessages);
          }
        }
        throw new Error(result.message || 'Registration failed');
      }

      // After successful registration, attempt to log in
      return await this.login({
        email: data.email,
        password: data.password
      });
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        await fetch(`${API_URL}/auth/logout/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
      }
      await AsyncStorage.removeItem('token');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem('token');
  },

  async getCurrentUser(): Promise<UserData> {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      
      if (!token || !userId) {
        throw new Error('No token or user ID found');
      }

      const response = await fetch(`${API_URL}/users/${userId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      // The user endpoint returns the user data directly without the data wrapper
      const userData = await response.json();
      
      if (!userData || !userData.id) {
        throw new Error('Invalid user data received');
      }

      return userData;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  },
}; 