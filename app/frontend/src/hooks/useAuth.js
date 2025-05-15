import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  selectAuthError 
} from '../store/slices/authSlice';
import { authAPI } from '../services/api';

/**
 * Hook for handling authentication in the application
 * @param {string} redirectTo - Path to redirect to after successful auth (default: null - no redirect)
 * @returns {Object} Auth methods and state
 */
const useAuth = (redirectTo = null) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Select auth state from Redux
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  const userRole = useSelector(selectUserRole);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  // Redirect only on successful auth actions, not on every component mount
  useEffect(() => {
    // Only redirect if redirectTo is provided, user is authenticated, and we're not already on that page
    const currentPath = window.location.pathname;
    if (isAuthenticated && redirectTo && redirectTo !== currentPath) {
      console.log(`Auth redirect: Redirecting to ${redirectTo} from ${currentPath}`);
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);
    // Handle login submission
  const handleLogin = async ({ email, password }) => {
    console.log('Attempting login with:', { email });
    
    try {
      const result = await dispatch(loginAsync({ email, password }));
      console.log('Login result:', result);
      
      if (result.meta.requestStatus !== 'fulfilled') {
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
        firstName,
        lastName,
        username,
        email,
        phone,
        password,
        confirmPassword) => {
    try {
      const result = await dispatch(registerAsync({ 
          firstName,
          lastName,
          username,
          email,
          phone,
          password,
          confirmPassword
      }));
      
      console.log('Register result:', result);
      
      if (result.meta.requestStatus !== 'fulfilled') {
        throw new Error(result.payload || 'Registration failed');
      }
      
      return result.payload;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };
    // Handle forgot password
  const handleForgotPassword = async (email) => {
    console.log('Requesting password reset for:', email);
    
    try {
      const result = await dispatch(forgotPassword(email));
      console.log('Forgot password result:', result);
      
      if (result.meta.requestStatus !== 'fulfilled') {
        throw new Error(result.payload || 'Password reset request failed');
      }
      
      return result.payload;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  };
  
  // Handle verify token
  const handleVerifyToken = async (token) => {
    console.log('Verifying token');
    
    try {
      const result = await dispatch(verifyToken(token));
      console.log('Token verification result:', result);
      
      if (result.meta.requestStatus !== 'fulfilled') {
        throw new Error(result.payload || 'Token verification failed');
      }
      
      return result.payload;
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  };
  
  // Handle reset password
  const handleResetPassword = async (password, token) => {
    console.log('Resetting password with token');
    
    try {
      const result = await dispatch(resetPassword({ password, token }));
      console.log('Reset password result:', result);
      
      if (result.meta.requestStatus !== 'fulfilled') {
        throw new Error(result.payload || 'Password reset failed');
      }
      
      return result.payload;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await authAPI.logout();
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
  const checkEmailAvailability = async (email) => {
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
  const checkPhoneAvailability = async (phoneNumber) => {
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
    login: handleLogin,
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