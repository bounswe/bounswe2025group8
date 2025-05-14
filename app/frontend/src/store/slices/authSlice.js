import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../utils/api';

// Load user from localStorage
const getUserFromStorage = () => {
  const user = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role') || 'user';
  
  return user ? {
    isAuthenticated: !!user,
    user: JSON.parse(user),
    role,
    token
  } : {
    isAuthenticated: false,
    user: null,
    role: 'guest',
    token: null
  };
};

// Initial state with user data from localStorage
const initialState = {
  ...getUserFromStorage(),
  loading: false,
  error: null,
};

// Async thunks for authentication actions
export const loginAsync = createAsyncThunk(
  'auth/loginAsync',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login({ email, password });
      
      if (response.status === 'success') {
        const userData = response.data.user_id ? {
          id: response.data.user_id,
          email: email,
          name: response.data.name || email.split('@')[0]
        } : {
          id: 'temp-user-id',
          email: email,
          name: email.split('@')[0]
        };
        
        const token = response.data.token;
        const role = 'user'; // Default role, modify as needed based on your backend
        
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userId', userData.id); // Also store userId separately
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        
        return { user: userData, token, role };
      } else {
        return rejectWithValue(response.message || 'Login failed');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const registerAsync = createAsyncThunk(
  'auth/registerAsync',
  async ({firstName,
        lastName,
        username,
        email,
        phone,
        password,
        confirmPassword }, { rejectWithValue }) => {
    try {
      const userData = {
        name: firstName,
        surname: lastName,
        username,
        email,
        phone_number: phone,
        password,
        confirm_password: confirmPassword
      };
      
      const response = await authAPI.register(userData);
      
      if (response.status === 'success') {
        const userData = {
          id: response.data.user_id,
          email: email,
          name: response.data.name || name
        };
        
        // After registration, user needs to login
        return { 
          registered: true, 
          user: userData,
          message: response.message || 'Registration successful. Please login.'
        };
      } else {
        return rejectWithValue(response.message || 'Registration failed');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authAPI.requestPasswordReset(email);
      
      if (response.status === 'success') {
        return { 
          success: true, 
          message: response.message || 'Password reset email sent',
          token: response.data?.token // This will only be available in DEBUG mode
        };
      } else {
        return rejectWithValue(response.message || 'Password reset request failed');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Forgot password request failed');
    }
  }
);

export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (token, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyResetToken(token);
      
      if (response.status === 'success') {
        return {
          valid: true,
          message: response.message || 'Token is valid',
          email: response.data?.email,
          expiry: response.data?.token_expiry
        };
      } else {
        return rejectWithValue(response.message || 'Invalid or expired token');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Token verification failed');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ password, token }, { rejectWithValue }) => {
    try {
      const response = await authAPI.resetPassword({ 
        token: token, 
        new_password: password 
      });
      
      if (response.status === 'success') {
        return { 
          success: true, 
          message: response.message || 'Password reset successful' 
        };
      } else {
        return rejectWithValue(response.message || 'Password reset failed');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Password reset failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Load user data from localStorage
    loadUserFromStorage(state) {
      const stored = getUserFromStorage();
      state.isAuthenticated = stored.isAuthenticated;
      state.user = stored.user;
      state.role = stored.role;
      state.token = stored.token;
      
      // If user exists, ensure userName and userId are stored separately for easy access
      if (stored.user) {
        if (stored.user.name) {
          localStorage.setItem('userName', stored.user.name);
        }
        if (stored.user.id) {
          localStorage.setItem('userId', stored.user.id);
        }
      }
    },
    
    // Login action (synchronous for DevUserPanel)
    login(state, action) {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.role = action.payload.role;
      state.token = action.payload.token;
      
      // Also update localStorage
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('role', action.payload.role);
      
      // Store username separately for easy access
      if (action.payload.user && action.payload.user.name) {
        localStorage.setItem('userName', action.payload.user.name);
      }
    },
    
    // Logout action
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.role = 'guest';
      state.token = null;
      state.error = null;
      
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userName');
    },
    
    // Update user profile
    updateUserProfile(state, action) {
      state.user = { ...state.user, ...action.payload };
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(state.user));
      
      // Update userName if name is being updated
      if (action.payload.name) {
        localStorage.setItem('userName', action.payload.name);
      }
    },
    
    // Clear error state
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login async cases
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.role = action.payload.role;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Register async cases
      .addCase(registerAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.role = action.payload.role;
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Forgot password cases
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Reset password cases
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const { login, logout, updateUserProfile, clearError, loadUserFromStorage } = authSlice.actions;

// Selectors for easy access to auth state
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectCurrentUser = (state) => state.auth.user;
export const selectUserRole = (state) => state.auth.role;
export const selectAuthToken = (state) => state.auth.token;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;