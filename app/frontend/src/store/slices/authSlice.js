import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Load user from localStorage
const getUserFromStorage = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Async thunks for authentication actions
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call to your backend
      if (email && password) {
        // Simulate successful login
        const userData = { email, name: email.split('@')[0] };
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      } else {
        return rejectWithValue('Invalid email or password');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password, fullName, username, phone }, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call to your backend
      if (email && password) {
        // Simulate successful registration
        const userData = {
          email,
          fullName,
          username,
          phone,
        };
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
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
  initialState: {
    currentUser: getUserFromStorage(),
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('user');
      state.currentUser = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Register cases
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
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

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;