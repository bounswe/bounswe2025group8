// Mock Authentication API Service using TypeScript
import { 
  mockApiResponses, 
  simulateApiDelay, 
  isEmailTaken, 
  isPhoneNumberTaken, 
  isUsernameTaken,
  validatePassword,
  validateEmail,
  mockUsers,
  mockAuthToken,
} from '../mockData';
import type { ApiResponse, User, LoginRequest, PasswordResetRequest, ResetPasswordRequest } from '../types';



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
  }): Promise<ApiResponse> {
    await simulateApiDelay(100);

    // Validation checks
    if (userData.password !== userData.confirmPassword) {
      return {
        status: 'error',
        message: 'Registration failed.',
        data: {
          confirm_password: ['Passwords do not match.']
        }
      };
    }

    if (!validatePassword(userData.password)) {
      return mockApiResponses.register.emailTaken;
    }

    if (!validateEmail(userData.email)) {
      return {
        status: 'error',
        message: 'Registration failed.',
        data: {
          email: ['Please enter a valid email address.']
        }
      };
    }

    if (isEmailTaken(userData.email)) {
      return mockApiResponses.register.emailTaken;
    }

    if (isUsernameTaken(userData.username)) {
      return mockApiResponses.register.validation;
    }

    if (isPhoneNumberTaken(userData.phone)) {
      return {
        status: 'error',
        message: 'Registration failed.',
        data: {
          phone_number: ['This phone number is already taken.']
        }
      };
    }

    // Simulate successful registration
    const newUserId = mockUsers.length + 1;
    return {
      status: 'success',
      message: 'Registration successful. Please log in to continue.',
      data: {
        user_id: newUserId,
        name: userData.firstName,
        email: userData.email
      }
    };
  }

  // Login user
  async login(credentials: LoginRequest): Promise<ApiResponse> {
    await simulateApiDelay(100);

    if (!validateEmail(credentials.email)) {
      return mockApiResponses.login.validation;
    }

    // Check if user exists and password is valid
    const user = mockUsers.find((u: User) => u.email === credentials.email);
    if (!user || !validatePassword(credentials.password)) {
      return mockApiResponses.login.invalidCredentials;
    }

    // Simulate successful login - return token for Redux to store
    return {
      ...mockApiResponses.login.success,
      data: {
        ...mockApiResponses.login.success.data,
        token: mockAuthToken
      }
    };
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