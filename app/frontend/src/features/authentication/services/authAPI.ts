// Mock Authentication API Service using TypeScript
import { 
  mockApiResponses, 
  simulateApiDelay, 
  isEmailTaken, 
  isPhoneNumberTaken, 
  validatePassword,
  validateEmail,
  mockUsers,
} from '../mockData';
import api from '../../../services/api'; // Axios instance
import type { ApiResponse, LoginRequest, LoginResponse, PasswordResetRequest, RegisterResponse, ResetPasswordRequest } from '../types';
import { AxiosError } from 'axios';




class AuthAPI {
  // AuthAPI is now stateless - all token management handled by Redux
  // Token is passed as parameter to methods that need it
  
  // Check if request requires authentication
  private requiresAuth(token?: string): boolean {
    if (!token) {
      throw new Error('Authentication required');
    }
    return true;
  }

  // Register new user
  async register(userData: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  }): Promise<ApiResponse<RegisterResponse>> {
    // Transform frontend data to backend API format
  const requestData = {
    name: userData.firstName,
    surname: userData.lastName,
    username: userData.username,
    email: userData.email,
    phone_number: userData.phone,
    password: userData.password,
    confirm_password: userData.confirmPassword
  };

  try {
    // Use the axios api instance from api.ts
    const response = await api.post('/auth/register/', requestData);
    
    // Transform backend response to frontend format
    return {
      status: 'success',
      message: response.data.message || 'Registration successful. Please log in to continue.',
      data: {
        user_id: response.data.data?.user_id,
        name: response.data.data?.name,
        email: response.data.data?.email
      }
    };
  } catch (error) {
    // Handle API errors and transform to frontend format
    if (error instanceof AxiosError && error.response?.data) {
      return {
        status: 'error',
        message: error.response.data.message || 'Registration failed.',
        data: error.response.data.data || {}
      };
    }
    
    // Handle network or other errors
    return {
      status: 'error',
      message: 'Network error. Please try again.',
      data: { }
    };
  }
  }
  

  // Login user
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await api.post('/auth/login/', credentials);
      return {
        status: 'success',
        message: response.data.message || 'Login successful.',
        data: {
          user_id: response.data.data.user_id,
          token: response.data.data.token
        }
      };
    } catch (error) {
      // Handle API errors and transform to frontend format
      if (error instanceof AxiosError && error.response?.data) {
        return {
          status: 'error',
          message: error.response.data.message || 'Login failed.',
          data: error.response.data.data || {}
        };
      }

      // Handle network or other errors
      return {
        status: 'error',
        message: 'Network error. Please try again.',
        data: {}
      };
    }
  }

  // Logout user - token passed from Redux
  async logout(token?: string): Promise<ApiResponse> {
    await simulateApiDelay(50);

    try {
      this.requiresAuth(token);
      return mockApiResponses.logout.success;
    } catch {
      return mockApiResponses.logout.unauthorized;
    }
  }

  // Check email availability
  async checkEmailAvailability(email: string): Promise<ApiResponse> {
    await simulateApiDelay(100);

    if (!validateEmail(email)) {
      return {
        status: 'error',
        message: 'Please provide a valid email address.',
        data: { available: false }
      };
    }

    return isEmailTaken(email) 
      ? mockApiResponses.checkAvailability.emailUnavailable
      : mockApiResponses.checkAvailability.emailAvailable;
  }

  // Check phone availability
  async checkPhoneAvailability(phoneNumber: string): Promise<ApiResponse> {
    await simulateApiDelay(100);

    if (!phoneNumber || phoneNumber.length < 10) {
      return {
        status: 'error',
        message: 'Please provide a valid phone number.',
        data: { available: false }
      };
    }

    return isPhoneNumberTaken(phoneNumber)
      ? mockApiResponses.checkAvailability.phoneUnavailable
      : mockApiResponses.checkAvailability.phoneAvailable;
  }

  // Request password reset
  async requestPasswordReset(data: PasswordResetRequest): Promise<ApiResponse> {
    await simulateApiDelay(100);

    if (!validateEmail(data.email)) {
      return mockApiResponses.passwordResetRequest.error;
    }

    // Always return success for security (don't reveal if email exists)
    return mockApiResponses.passwordResetRequest.success;
  }

  // Verify reset token
  async verifyResetToken(token: string): Promise<ApiResponse> {
    await simulateApiDelay(100);

    // Simulate token validation
    if (token === 'reset-token-12345-abcdef') {
      return mockApiResponses.verifyToken.success;
    }

    return mockApiResponses.verifyToken.invalid;
  }

  // Reset password
  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse> {
    await simulateApiDelay(100);

    if (data.new_password !== data.confirm_password) {
      return mockApiResponses.resetPassword.mismatch;
    }

    if (!validatePassword(data.new_password)) {
      return mockApiResponses.resetPassword.validation;
    }

    if (data.token !== 'reset-token-12345-abcdef') {
      return mockApiResponses.resetPassword.invalidToken;
    }

    return mockApiResponses.resetPassword.success;
  }

  // Get current user info (requires auth) - token passed from Redux
  async getCurrentUser(token?: string): Promise<ApiResponse> {
    await simulateApiDelay(100);

    try {
      this.requiresAuth(token);
      
      // Return mock current user
      return {
        status: 'success',
        message: 'User retrieved successfully.',
        data: mockUsers[0] // Return first user as current user
      };
    } catch {
      return {
        status: 'error',
        message: 'Authentication required.'
      };
    }
  }

  // Check if user is authenticated - token passed from Redux
  isAuthenticated(token?: string): boolean {
    return !!token;
  }
}

// Export singleton instance
export const authAPI = new AuthAPI();
export default authAPI;