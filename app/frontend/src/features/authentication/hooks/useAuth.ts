import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch } from '../../../store';
import { useAppDispatch,useAppSelector } from '../../../store/hooks';
import { 
  loginAsync, 
  registerAsync,
  forgotPassword,
  verifyToken, 
  resetPassword, 
  logout,
  selectIsAuthenticated, 
  selectCurrentUser, 
  selectUserRole, 
  selectAuthLoading,
  selectAuthError,
  selectAuthToken 
} from '../store/authSlice';
import { authAPI } from '../services/authAPI';
import type {ApiResponse, UseAuthReturn, LoginCredentials } from '../types';






/**
 * Hook for handling authentication in the application
 * @param redirectTo - Path to redirect to after successful auth (default: null - no redirect)
 * @returns Auth methods and state
 */
const useAuth = (redirectTo: string | null = null): UseAuthReturn => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // Select auth state from Redux
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectCurrentUser);
  const userRole = useAppSelector(selectUserRole);
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const token = useAppSelector(selectAuthToken);
  // Redirect only on successful auth actions, not on every component mount
  useEffect(() => {
    // Only redirect if redirectTo is provided, user is authenticated, and we're not already on that page
    const currentPath = window.location.pathname;
    if (isAuthenticated && redirectTo && redirectTo !== currentPath) {
      console.log(`Auth redirect: Redirecting to ${redirectTo} from ${currentPath}`);
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  // Fetch user profile on app load if user is authenticated but missing profile data
  useEffect(() => {
    const fetchProfileOnLoad = async () => {
      if (isAuthenticated && currentUser && currentUser.id && !currentUser.surname) {
        console.log('Fetching complete user profile on app load...');
        try {
          // Import the fetchUserProfileAsync action
          const { fetchUserProfileAsync } = await import('../store/authSlice');
          await (dispatch as AppDispatch)(fetchUserProfileAsync(currentUser.id));
        } catch (error) {
          console.warn('Could not fetch user profile on app load:', error);
        }
      }
    };

    fetchProfileOnLoad();
  }, [isAuthenticated, currentUser, dispatch]);

  // Handle login submission
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    console.log('Attempting login with:', { email: credentials.email });
    
    try {
      const result = await (dispatch as AppDispatch)(loginAsync(credentials));
      console.log('Login result:', result);
      
      if (result.type.endsWith('/rejected')) {
        console.error('Login failed:', result.payload);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Handle register submission
  const register = async (
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    phone: string,
    password: string,
    confirmPassword: string
  ): Promise<unknown> => {
    try {
      const result = await (dispatch as AppDispatch)(registerAsync({ 
        firstName,
        lastName,
        username,
        email,
        phone,
        password,
        confirmPassword
      }));
      
      console.log('Register result:', result);
      
      if (result.type.endsWith('/rejected')) {
        throw new Error((result.payload as string) ?? 'Registration failed');
      } 
      
      return result.payload;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };
  // Handle forgot password
  const handleForgotPassword = async (email: string): Promise<unknown> => {
    console.log('Requesting password reset for:', email);
    
    try {
      const result = await (dispatch as AppDispatch)(forgotPassword(email));
      console.log('Forgot password result:', result);
      
      if (result.type.endsWith('/rejected')) {
        throw new Error((result.payload as string) ?? 'Password reset request failed');
      }
      
      return result.payload;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  };
  
  // Handle verify token
  const handleVerifyToken = async (token: string): Promise<unknown> => {
    console.log('Verifying token');
    
    try {
      const result = await (dispatch as AppDispatch)(verifyToken(token));
      console.log('Token verification result:', result);
      
      if (result.type.endsWith('/rejected')) {
        throw new Error((result.payload as string) ?? 'Token verification failed');
      }
      
      return result.payload;
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  };
  
  // Handle reset password
  const handleResetPassword = async (password: string, token: string): Promise<unknown> => {
    console.log('Resetting password with token');
    
    try {
      const result = await (dispatch as AppDispatch)(resetPassword({ password, token }));
      console.log('Reset password result:', result);
      
      if (result.type.endsWith('/rejected')) {
        throw new Error((result.payload as string) ?? 'Password reset failed');
      }
      
      return result.payload;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };
  
  // Handle logout
  const handleLogout = async (): Promise<void> => {
    try {
      await authAPI.logout(token || undefined);
      dispatch(logout());
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if server logout fails, clear local state
      dispatch(logout());
      navigate('/login');
    }
  };
  
  // Check email availability
  const checkEmailAvailability = async (email: string): Promise<ApiResponse> => {
    console.log('Checking email availability for:', email);
    
    try {
      const result = await authAPI.checkEmailAvailability(email);
      console.log('Email availability result:', result);
      return result;
    } catch (error) {
      console.error('Email availability check error:', error);
      throw error;
    }
  };
  
  // Check phone availability
  const checkPhoneAvailability = async (phoneNumber: string): Promise<ApiResponse> => {
    console.log('Checking phone availability for:', phoneNumber);
    
    try {
      const result = await authAPI.checkPhoneAvailability(phoneNumber);
      console.log('Phone availability result:', result);
      return result;
    } catch (error) {
      console.error('Phone availability check error:', error);
      throw error;
    }
  };
    return {
    // Current auth state
    isAuthenticated,
    currentUser,
    userRole,
    loading,
    error,
    
    // Auth methods
    login,
    register,
    logout: handleLogout,
    forgotPassword: handleForgotPassword,
    verifyToken: handleVerifyToken,
    resetPassword: handleResetPassword,
    checkEmailAvailability,
    checkPhoneAvailability
  };
};

export default useAuth;