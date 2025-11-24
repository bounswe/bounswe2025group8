export type ApiResponse<T = unknown> = {
  status: 'success';
  message: string;
  data: T;
} | {
  status: 'error';
  message: string;
  data?: unknown; // Optional for error cases
};

export interface User {
  user_id: number;
  name: string;
  surname?: string;
  username?: string;
  email: string;
  phone_number?: string;
}

export interface RegisterRequest {
  name: string;
  surname: string;
  username: string;
  email: string;
  phone_number: string;
  password: string;
  confirm_password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
  confirm_password: string;
}


export interface RegisterResponse {
  user_id: number;
  name: string;
  email: string;
  } 


export interface CheckAvailabilityResponse {
  available: boolean;
}

export interface LoginResponse {
  token: string;
  user_id: number;
}

export interface VerifyTokenResponse {
  email: string;
  token_expiry: string;
}




export interface LoginCredentials {
  email: string;
  password: string;
}

// Auth State Interfaces
export interface AuthUser {
  id: number;
  email: string;
  name: string;
  surname?: string;
  username?: string;
  phone?: string;
  profile_photo?: string | null;
  profilePhoto?: string | null;
  profilePicture?: string | null;
  rating?: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  role: string;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Register Data Interface
export interface RegisterData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

// Redux Async Thunk Return Types
export interface LoginAsyncReturn {
  user: AuthUser;
  token: string;
  role: string;
}

export interface RegisterAsyncReturn {
  registered: boolean;
  user: AuthUser;
  message: string;
}

export interface ForgotPasswordReturn {
  success: boolean;
  message: string;
  token?: string;
}

export interface VerifyTokenReturn {
  valid: boolean;
  message: string;
  email?: string;
  expiry?: string;
}

export interface ResetPasswordReturn {
  success: boolean;
  message: string;
}

export interface UseAuthReturn {
  // Current auth state
  isAuthenticated: boolean;
  currentUser: unknown;
  userRole: string | null;
  loading: boolean;
  error: string | null;
  
  // Auth methods
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    phone: string,
    password: string,
    confirmPassword: string
  ) => Promise<unknown>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<unknown>;
  verifyToken: (token: string) => Promise<unknown>;
  resetPassword: (password: string, token: string) => Promise<unknown>;
  checkEmailAvailability: (email: string) => Promise<ApiResponse>;
  checkPhoneAvailability: (phoneNumber: string) => Promise<ApiResponse>;
}
