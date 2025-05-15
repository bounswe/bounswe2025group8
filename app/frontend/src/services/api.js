import axios from 'axios';

// Create an axios instance with base URL
const API_BASE_URL = 'http://165.227.152.202:8000/api' ;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Token ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add a response interceptor
api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  // Handle global error cases here
  if (error.response && error.response.status === 401) {
    // Clear local storage and redirect to login if unauthorized
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

export const authAPI = {
  // Get the axios instance for direct testing
  getAxiosInstance: () => api,
  
  // Register a new user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register/', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  // Login a user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login/', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  // Logout a user
  logout: async () => {
    try {
      const response = await api.post('/auth/logout/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Logout failed' };
    }
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    try {
      const response = await api.post('/auth/password-reset-request/', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Password reset request failed' };
    }
  },

  // Verify reset token
  verifyResetToken: async (token) => {
    try {
      const response = await api.get(`/auth/verify-token/${token}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Invalid or expired token' };
    }
  },
  // Reset password with token
  resetPassword: async (data) => {
    try {
      const response = await api.post('/auth/reset-password/', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Password reset failed' };
    }
  },

  // Check email availability
  checkEmailAvailability: async (email) => {
    try {
      const response = await api.get(`/auth/check-availability/?email=${email}`);
      return response.data;
    } catch (error) {
      // During development/testing, return a default response if the API is not available
      console.warn("Email availability check API call failed:", error);
      return { available: true }; // Default to available during testing
    }
  },

  // Check phone number availability
  checkPhoneAvailability: async (phoneNumber) => {
    try {
      const response = await api.get(`/auth/check-availability/?phone_number=${phoneNumber}`);
      return response.data;
    } catch (error) {
      // During development/testing, return a default response if the API is not available
      console.warn("Phone availability check API call failed:", error);
      return { available: true }; // Default to available during testing
    }
  }
};

// Task/Request API service
export const taskAPI = {
  // Create a new task/request
  createTask: async (taskData) => {
    try {
      const response = await api.post('/tasks/', taskData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create task' };
    }
  },

  // Get all tasks
  getTasks: async (filters = {}) => {
    try {
      const response = await api.get('/tasks/', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch tasks' };
    }
  },

  // Get a specific task
  getTask: async (taskId) => {
    try {
      const response = await api.get(`/tasks/${taskId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch task' };
    }
  },

  // Update a task
  updateTask: async (taskId, taskData) => {
    try {
      const response = await api.patch(`/tasks/${taskId}/`, taskData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update task' };
    }
  },

  // Upload a photo for a task
  uploadTaskPhoto: async (taskId, photoFile) => {
    try {
      // Validate inputs
      if (!taskId) {
        throw new Error('Task ID is required for photo upload');
      }
      
      if (!photoFile || typeof photoFile !== 'object' || !(photoFile instanceof File)) {
        throw new Error('Invalid photo file object');
      }
      
      const formData = new FormData();
      // Backend expects 'photo' field name in the request, not 'url'
      formData.append('photo', photoFile);
      
      console.log(`Uploading photo ${photoFile.name} (${photoFile.size} bytes) to tasks/${taskId}/photo/ endpoint`);
      
      const response = await api.post(`/tasks/${taskId}/photo/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Photo upload API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Photo upload API error:', error.response?.data || error.message);
      throw error.response?.data || { message: `Failed to upload photo: ${error.message}` };
    }
  }
};

export default api;
