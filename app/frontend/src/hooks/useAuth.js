import { useSelector, useDispatch } from 'react-redux';
import { login, register, logout, forgotPassword, resetPassword } from '../store/slices/authSlice';

// Custom hook for accessing auth state and methods from Redux
export const useAuth = () => {
  const dispatch = useDispatch();
  const { currentUser, loading, error } = useSelector(state => state.auth);

  // Login handler
  const handleLogin = async (email, password) => {
    try {
      const resultAction = await dispatch(login({ email, password }));
      // If login succeeded, return the user data
      if (login.fulfilled.match(resultAction)) {
        return resultAction.payload;
      }
      // If there was an error, throw it
      throw new Error(resultAction.payload || 'Login failed');
    } catch (error) {
      throw error;
    }
  };

  // Register handler
  const handleRegister = async (email, password, fullName, username, phone) => {
    try {
      const resultAction = await dispatch(register({ email, password, fullName, username, phone }));
      // If registration succeeded, return the user data
      if (register.fulfilled.match(resultAction)) {
        return resultAction.payload;
      }
      // If there was an error, throw it
      throw new Error(resultAction.payload || 'Registration failed');
    } catch (error) {
      throw error;
    }
  };

  // Logout handler
  const handleLogout = () => {
    dispatch(logout());
  };

  // Forgot password handler
  const handleForgotPassword = async (email) => {
    try {
      const resultAction = await dispatch(forgotPassword(email));
      // If forgot password succeeded, return the result
      if (forgotPassword.fulfilled.match(resultAction)) {
        return resultAction.payload;
      }
      // If there was an error, throw it
      throw new Error(resultAction.payload || 'Forgot password request failed');
    } catch (error) {
      throw error;
    }
  };

  // Reset password handler
  const handleResetPassword = async (password, token) => {
    try {
      const resultAction = await dispatch(resetPassword({ password, token }));
      // If reset password succeeded, return the result
      if (resetPassword.fulfilled.match(resultAction)) {
        return resultAction.payload;
      }
      // If there was an error, throw it
      throw new Error(resultAction.payload || 'Password reset failed');
    } catch (error) {
      throw error;
    }
  };

  // Return the auth state and methods
  return {
    currentUser,
    loading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    forgotPassword: handleForgotPassword,
    resetPassword: handleResetPassword,
  };
};