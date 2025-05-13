import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  loginAsync, 
  registerAsync, 
  login, 
  logout, 
  selectIsAuthenticated, 
  selectCurrentUser, 
  selectUserRole, 
  selectAuthLoading,
  selectAuthError 
} from '../store/slices/authSlice';

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
    const result = await dispatch(loginAsync({ email, password }));
    return result.meta.requestStatus === 'fulfilled';
  };
  
  // Handle signup submission
  const handleSignup = async ({ email, password, firstName, lastName }) => {
    const name = `${firstName} ${lastName}`;
    const result = await dispatch(registerAsync({ email, password, name }));
    return result.meta.requestStatus === 'fulfilled';
  };
  
  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    navigate('/'); // Always redirect to home on logout
  };
  
  // Quick login with mock data (for development)
  const quickLogin = (role = 'user') => {
    let userData;
    
    if (role === 'admin') {
      userData = {
        user: {
          id: 'admin-789',
          name: 'Admin User',
          email: 'admin@example.com',
          avatar: 'https://randomuser.me/api/portraits/women/65.jpg'
        },
        role: 'admin',
        token: `mock-token-admin-${Date.now()}`
      };
    } else {
      userData = {
        user: {
          id: 'user-123',
          name: 'Regular User',
          email: 'user@example.com',
          avatar: null
        },
        role: 'user',
        token: `mock-token-user-${Date.now()}`
      };
    }
    
    dispatch(login(userData));
    // Only navigate if redirectTo is provided
    if (redirectTo) {
      navigate(redirectTo);
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
    handleLogin,
    handleSignup,
    handleLogout,
    quickLogin
  };
};

export default useAuth;