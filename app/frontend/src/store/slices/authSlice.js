import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

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
      // In a real app, this would be an API call to your backend
      if (email && password) {
        // Simulate successful login
        const userData = { 
          id: 'user-' + Date.now(),
          email, 
          name: email.split('@')[0] 
        };
        
        const token = 'mock-token-' + Date.now();
        const role = email.includes('admin') ? 'admin' : 'user';
        
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        
        return { user: userData, token, role };
      } else {
        return rejectWithValue('Invalid email or password');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const registerAsync = createAsyncThunk(
  'auth/registerAsync',
  async ({ email, password, name }, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call to your backend
      if (email && password && name) {
        // Simulate successful registration
        const userData = {
          id: 'user-' + Date.now(),
          email,
          name
        };
        
        const token = 'mock-token-' + Date.now();
        const role = 'user'; // Default role for new users
        
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        
        return { user: userData, token, role };
      } else {
        return rejectWithValue('Invalid registration data');
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
      // In a real app, this would be an API call to your backend
      if (email) {
        // Simulate sending reset password email
        return { success: true, message: 'Password reset email sent' };
      } else {
        return rejectWithValue('Email is required');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Forgot password request failed');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ password, token }, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call to your backend
      if (password && token) {
        // Simulate password reset
        return { success: true, message: 'Password reset successful' };
      } else {
        return rejectWithValue('Password and token are required');
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
    },
    
    // Update user profile
    updateUserProfile(state, action) {
      state.user = { ...state.user, ...action.payload };
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(state.user));
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
export const { login, logout, updateUserProfile, clearError } = authSlice.actions;

// Selectors for easy access to auth state
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectCurrentUser = (state) => state.auth.user;
export const selectUserRole = (state) => state.auth.role;
export const selectAuthToken = (state) => state.auth.token;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;