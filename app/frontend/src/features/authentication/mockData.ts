
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ApiResponse,User,RegisterRequest, LoginRequest, PasswordResetRequest, ResetPasswordRequest } from "./types";

// Mock Users Database
export const mockUsers: User[] = [
  {
    user_id: 1,
    name: "Maria",
    surname: "Lopez",
    username: "marialopez",
    email: "maria.lopez@example.com",
    phone_number: "1234567890"
  },
  {
    user_id: 2,
    name: "John",
    surname: "Doe",
    username: "johndoe",
    email: "john.doe@example.com",
    phone_number: "0987654321"
  },
  {
    user_id: 3,
    name: "Alice",
    surname: "Johnson",
    username: "alicej",
    email: "alice.johnson@example.com",
    phone_number: "5551234567"
  }
];

// Mock Authentication Token
export const mockAuthToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

// Mock Reset Token
export const mockResetToken = "reset-token-12345-abcdef";

// ============= REGISTER USER MOCK DATA =============

export const mockRegisterSuccessResponse: ApiResponse<Omit<User, 'surname' | 'username' | 'phone_number'>> = {
  status: 'success',
  message: 'Registration successful. Please log in to continue.',
  data: {
    user_id: 4,
    name: 'Maria',
    email: 'maria.lopez@example.com'
  }
};

export const mockRegisterErrorResponse: ApiResponse = {
  status: 'error',
  message: 'Registration failed.',
  data: {
    email: ['This email is already taken.'],
    password: ['Password must include uppercase, lowercase, number, and special character.']
  }
};

export const mockRegisterValidationErrorResponse: ApiResponse = {
  status: 'error',
  message: 'Registration failed.',
  data: {
    username: ['This username is already taken.'],
    phone_number: ['Phone number must be valid.'],
    confirm_password: ['Passwords do not match.']
  }
};

// ============= CHECK AVAILABILITY MOCK DATA =============

export const mockEmailAvailableResponse: ApiResponse<{ available: boolean }> = {
  status: 'success',
  message: 'This email is available for registration.',
  data: { available: true }
};

export const mockEmailUnavailableResponse: ApiResponse<{ available: boolean }> = {
  status: 'error',
  message: 'This email is already associated with an existing account.',
  data: { available: false }
};

export const mockPhoneAvailableResponse: ApiResponse<{ available: boolean }> = {
  status: 'success',
  message: 'This phone number is available for registration.',
  data: { available: true }
};

export const mockPhoneUnavailableResponse: ApiResponse<{ available: boolean }> = {
  status: 'error',
  message: 'This phone number is already associated with an existing account.',
  data: { available: false }
};

// ============= LOGIN MOCK DATA =============

export const mockLoginSuccessResponse: ApiResponse<{ token: string; user_id: number }> = {
  status: 'success',
  message: 'Login successful.',
  data: {
    token: mockAuthToken,
    user_id: 1
  }
};

export const mockLoginErrorResponse: ApiResponse = {
  status: 'error',
  message: 'Invalid credentials.'
};

export const mockLoginValidationErrorResponse: ApiResponse = {
  status: 'error',
  message: 'Login failed.',
  data: {
    email: ['Please enter a valid email address.'],
    password: ['Password is required.']
  }
};

// ============= LOGOUT MOCK DATA =============

export const mockLogoutSuccessResponse: ApiResponse = {
  status: 'success',
  message: 'Logout successful.'
};

export const mockLogoutUnauthorizedResponse: ApiResponse = {
  status: 'error',
  message: 'Authentication required.'
};

// ============= PASSWORD RESET REQUEST MOCK DATA =============

export const mockPasswordResetRequestSuccessResponse: ApiResponse = {
  status: 'success',
  message: 'If your email exists in our system, you will receive a password reset link shortly.'
};

export const mockPasswordResetRequestErrorResponse: ApiResponse = {
  status: 'error',
  message: 'Please provide a valid email address.'
};

// ============= VERIFY RESET TOKEN MOCK DATA =============

export const mockVerifyTokenSuccessResponse: ApiResponse<{ email: string; token_expiry: string }> = {
  status: 'success',
  message: 'Token is valid.',
  data: {
    email: 'maria.lopez@example.com',
    token_expiry: '2025-05-16T14:00:00Z'
  }
};

export const mockVerifyTokenErrorResponse: ApiResponse = {
  status: 'error',
  message: 'Invalid or expired token. Please request a new password reset link.'
};

// ============= RESET PASSWORD MOCK DATA =============

export const mockResetPasswordSuccessResponse: ApiResponse = {
  status: 'success',
  message: 'Password has been reset successfully. You can now log in with your new password.'
};

export const mockResetPasswordErrorResponse: ApiResponse = {
  status: 'error',
  message: 'Passwords do not match.'
};

export const mockResetPasswordValidationErrorResponse: ApiResponse = {
  status: 'error',
  message: 'Password reset failed.',
  data: {
    token: ['Invalid or expired token.'],
    new_password: ['Password must include uppercase, lowercase, number, and special character.'],
    confirm_password: ['Passwords do not match.']
  }
};

export const mockResetPasswordInvalidTokenResponse: ApiResponse = {
  status: 'error',
  message: 'Invalid or expired token. Please request a new password reset link.'
};

// ============= HELPER FUNCTIONS FOR MOCK API =============

export const getMockUserByEmail = (email: string): User | undefined => {
  return mockUsers.find(user => user.email === email);
};

export const getMockUserByPhoneNumber = (phoneNumber: string): User | undefined => {
  return mockUsers.find(user => user.phone_number === phoneNumber);
};

export const getMockUserByUsername = (username: string): User | undefined => {
  return mockUsers.find(user => user.username === username);
};

export const isEmailTaken = (email: string): boolean => {
  return mockUsers.some(user => user.email === email);
};

export const isPhoneNumberTaken = (phoneNumber: string): boolean => {
  return mockUsers.some(user => user.phone_number === phoneNumber);
};

export const isUsernameTaken = (username: string): boolean => {
  return mockUsers.some(user => user.username === username);
};

export const validatePassword = (password: string): boolean => {
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return hasUppercase && hasLowercase && hasNumber && hasSpecialChar && password.length >= 8;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ============= MOCK API SIMULATION FUNCTIONS =============

export const simulateApiDelay = (ms: number = 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const simulateNetworkError = (): Promise<never> => {
  return new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Network error occurred')), 1000)
  );
};

// ============= COMPLETE MOCK API RESPONSES BY ENDPOINT =============

export const mockApiResponses = {
  register: {
    success: mockRegisterSuccessResponse,
    emailTaken: mockRegisterErrorResponse,
    validation: mockRegisterValidationErrorResponse
  },
  checkAvailability: {
    emailAvailable: mockEmailAvailableResponse,
    emailUnavailable: mockEmailUnavailableResponse,
    phoneAvailable: mockPhoneAvailableResponse,
    phoneUnavailable: mockPhoneUnavailableResponse
  },
  login: {
    success: mockLoginSuccessResponse,
    invalidCredentials: mockLoginErrorResponse,
    validation: mockLoginValidationErrorResponse
  },
  logout: {
    success: mockLogoutSuccessResponse,
    unauthorized: mockLogoutUnauthorizedResponse
  },
  passwordResetRequest: {
    success: mockPasswordResetRequestSuccessResponse,
    error: mockPasswordResetRequestErrorResponse
  },
  verifyToken: {
    success: mockVerifyTokenSuccessResponse,
    invalid: mockVerifyTokenErrorResponse
  },
  resetPassword: {
    success: mockResetPasswordSuccessResponse,
    mismatch: mockResetPasswordErrorResponse,
    validation: mockResetPasswordValidationErrorResponse,
    invalidToken: mockResetPasswordInvalidTokenResponse
  }
};

export default mockApiResponses;