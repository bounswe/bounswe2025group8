import axios from 'axios';
import { logout } from './authService';

/**
 * Initialize API middleware with axios interceptors
 * This handles common API scenarios like:
 * - Token expiration
 * - Authentication errors
 * - Adding common headers
 */
export const setupApiInterceptors = () => {
  // Request interceptor
  axios.interceptors.request.use(
    (config) => {
      // Add token to headers if available
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Token ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  axios.interceptors.response.use(
    (response) => {
      // Return successful responses as-is
      return response;
    },
    async (error) => {
      // Handle auth errors
      if (error.response && error.response.status === 401) {
        // Clear auth data from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        
        // Redirect to login page
        window.location.href = '/login';
      }
      
      // Format error response consistently
      if (error.response && error.response.data) {
        // If the error is already in our format, pass it through
        if (error.response.data.status === 'error') {
          return Promise.reject(error);
        }
        
        // Format error message
        const errorMessage = 
          error.response.data.message || 
          error.response.data.detail || 
          'An error occurred';
        
        // Enhance the error object
        error.formattedMessage = errorMessage;
      }
      
      return Promise.reject(error);
    }
  );
};

/**
 * Format API responses consistently
 * @param {*} response - Raw API response
 * @returns {Object} Formatted response data
 */
export const formatApiResponse = (response) => {
  // Check if response is already in our format (status field present)
  if (response && response.data && response.data.status) {
    return response.data;
  }
  
  // Otherwise, format it consistently
  return {
    status: 'success',
    data: response.data,
    message: null
  };
};

export default {
  setupApiInterceptors,
  formatApiResponse
};
