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
import { authAPI } from '../utils/api';

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
    // Only redirect if redirectTo is provided and we didn't create this effect just for state
    if (isAuthenticated && redirectTo && redirectTo !== window.location.pathname) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);
  
  // Handle login submission
  const handleLogin = async ({ email, password }) => {
    console.log('Attempting login with:', { email });
    
    try {
      const result = await dispatch(loginAsync({ email, password }));
      console.log('Login result:', result);
      return result.meta.requestStatus === 'fulfilled';
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
    const result = await dispatch(registerAsync({ 
        firstName,
        lastName,
        username,
        email,
        phone,
        password,
        confirmPassword
    }));
    
    if (result.meta.requestStatus !== 'fulfilled') {
      throw new Error(result.payload || 'Registration failed');
    }
    
    return result.payload;
  };
  
  // Handle forgot password
  const handleForgotPassword = async (email) => {
    const result = await dispatch(forgotPassword(email));
    
    if (result.meta.requestStatus !== 'fulfilled') {
      throw new Error(result.payload || 'Password reset request failed');
    }
    
    return result.payload;
  };
  
  // Handle verify token
  const handleVerifyToken = async (token) => {
    const result = await dispatch(verifyToken(token));
    
    if (result.meta.requestStatus !== 'fulfilled') {
      throw new Error(result.payload || 'Token verification failed');
    }
    
    return result.payload;
  };
  
  // Handle reset password
  const handleResetPassword = async (password, token) => {
    const result = await dispatch(resetPassword({ password, token }));
    
    if (result.meta.requestStatus !== 'fulfilled') {
      throw new Error(result.payload || 'Password reset failed');
    }
    
    return result.payload;
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
    try {
      return await authAPI.checkEmailAvailability(email);
    } catch (error) {
      throw error;
    }
  };
  
  // Check phone availability
  const checkPhoneAvailability = async (phoneNumber) => {
    try {
      return await authAPI.checkPhoneAvailability(phoneNumber);
    } catch (error) {
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