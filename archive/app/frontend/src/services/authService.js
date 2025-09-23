import axios from 'axios';

// Base API URL
const API_URL = import.meta.env.VITE_API_URL;

/**
 * Handle login response by storing token and user info
 * @param {Object} response - Login API response
 * @private
 */
const _handleLoginResponse = (response) => {
  if (response.data && response.data.data) {
    const { token, user } = response.data.data;
    
    // Store token and user ID in localStorage
    if (token) localStorage.setItem('token', token);
    if (user && user.id) localStorage.setItem('userId', user.id);
    
    return response.data.data;
  }
  return response.data;
};

/**
 * Login user
 * @param {string} username - User's username or email
 * @param {string} password - User's password
 * @returns {Promise<Object>} User data and token
 */
export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login/`, {
      username,
      password
    });
    
    return _handleLoginResponse(response);
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} User data
 */
export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register/`, userData);
    
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Logout user
 * @returns {Promise<Object>} Logout response
 */
export const logout = async () => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      await axios.post(`${API_URL}/auth/logout/`, {}, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
    }
    
    // Clean up localStorage regardless of API response
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    
    return { status: 'success', message: 'Logged out successfully' };
  } catch (error) {
    console.error('Logout error:', error);
    // Clean up localStorage even on errors
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    throw error;
  }
};

/**
 * Request password reset
 * @param {string} email - User's email address
 * @returns {Promise<Object>} Response message
 */
export const requestPasswordReset = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/auth/request-reset/`, {
      email
    });
    
    return response.data;
  } catch (error) {
    console.error('Password reset request error:', error);
    throw error;
  }
};

/**
 * Verify password reset token
 * @param {string} token - Reset token
 * @returns {Promise<Object>} Token verification response
 */
export const verifyResetToken = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/auth/verify-token/${token}/`);
    
    return response.data;
  } catch (error) {
    console.error('Token verification error:', error);
    throw error;
  }
};

/**
 * Reset password using token
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @param {string} confirmPassword - Confirm new password
 * @returns {Promise<Object>} Response message
 */
export const resetPassword = async (token, newPassword, confirmPassword) => {
  try {
    const response = await axios.post(`${API_URL}/auth/reset-password/`, {
      token,
      new_password: newPassword,
      confirm_password: confirmPassword
    });
    
    return response.data;
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

/**
 * Check if username or email is available
 * @param {string} type - Type of check ('username' or 'email')
 * @param {string} value - Value to check
 * @returns {Promise<Object>} Availability status
 */
export const checkAvailability = async (type, value) => {
  try {
    const response = await axios.post(`${API_URL}/auth/check-availability/`, {
      type,
      value
    });
    
    return response.data;
  } catch (error) {
    console.error('Availability check error:', error);
    throw error;
  }
};

/**
 * Get current user's authentication status
 * @returns {boolean} True if user is authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

/**
 * Get current user ID
 * @returns {string|null} User ID or null if not authenticated
 */
export const getCurrentUserId = () => {
  return localStorage.getItem('userId');
};
