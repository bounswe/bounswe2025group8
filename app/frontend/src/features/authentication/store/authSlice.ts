import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { authAPI } from '../services/authAPI';
import { authStorage } from '../utils/localStorage';
import type { 
  AuthState, 
  AuthUser, 
  LoginCredentials, 
  RegisterData, 
  LoginAsyncReturn, 
  RegisterAsyncReturn, 
  ForgotPasswordReturn, 
  VerifyTokenReturn, 
  ResetPasswordReturn, 
} from '../types';
import { toAbsoluteUrl } from '../../../utils/url';



const resolveProfilePhoto = (userData: Partial<AuthUser> & Record<string, unknown> | null | undefined) => {
  return toAbsoluteUrl(
    userData?.profile_photo ||
      userData?.profilePhoto ||
      userData?.profilePicture ||
      (userData as Record<string, unknown> | undefined)?.photo ||
      (userData as Record<string, unknown> | undefined)?.avatar ||
      null
  );
};

// Load user from localStorage using centralized utility
const getUserFromStorage = (): Omit<AuthState, 'loading' | 'error'> => {
  const user = authStorage.getUser();
  const normalizedUser = user
    ? (() => {
        const photo = resolveProfilePhoto(user);
        return {
          ...user,
          profilePicture: photo ?? user.profilePicture ?? null,
          profilePhoto: photo ?? (user as Record<string, unknown>)?.profilePhoto ?? null,
          profile_photo: photo ?? (user as Record<string, unknown>)?.profile_photo ?? null,
        };
      })()
    : null;
  const token = authStorage.getToken();
  const role = authStorage.getRole();
  
  return normalizedUser && token ? {
    isAuthenticated: true,
    user: normalizedUser,
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
const initialState: AuthState = {
  ...getUserFromStorage(),
  loading: false,
  error: null,
};

// Async thunks for authentication actions
// New async thunk to fetch user profile after login
export const fetchUserProfileAsync = createAsyncThunk<
  AuthUser,
  number,
  { rejectValue: string }
>(
  'auth/fetchUserProfileAsync',
  async (userId, { rejectWithValue }) => {
    try {
      // Import api from the common api service
      const { default: api } = await import('../../../services/api');
      const response = await api.get(`/users/${userId}/`);
      
      const userData = response.data?.data || response.data;
      const profilePhoto = resolveProfilePhoto(userData);
      
      const profileUser: AuthUser = {
        id: userData.id,
        email: userData.email,
        name: userData.name || userData.first_name || '',
        surname: userData.surname || userData.last_name || '',
        username: userData.username || '',
        phone: userData.phone || userData.phone_number || '',
        profilePicture: profilePhoto,
        profilePhoto,
        profile_photo: profilePhoto,
        rating: userData.rating || 0,
      };
      
      // Update localStorage with complete user data
      authStorage.updateUser(profileUser);
      
      return profileUser;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return rejectWithValue('Failed to fetch user profile');
    }
  }
);

export const loginAsync = createAsyncThunk<
  LoginAsyncReturn,
  LoginCredentials,
  { rejectValue: string }
>(
  'auth/loginAsync',
  async ({ email, password }, { rejectWithValue, dispatch }) => {
    try {
      const response = await authAPI.login({ email, password });
      
      if (response.status === 'success' && response.data) {
        const responseData = response.data; 
        const token = responseData.token as string;
        
        // Initial user data with minimal info
        const initialUserData: AuthUser = {
          id: responseData.user_id,
          email: email,
          name: email.split('@')[0] // Temporary until profile is fetched
        };
        
        // Store initial auth data with default role
        authStorage.setAuthData(initialUserData, token, 'user');
        
        // Fetch complete user profile after login
        try {
          const userProfileResult = await dispatch(fetchUserProfileAsync(responseData.user_id));
          
          if (fetchUserProfileAsync.fulfilled.match(userProfileResult)) {
            const userData = userProfileResult.payload;
            const role = userData.username === 'admin' ? 'admin' : 'user';
            
            // Update with complete profile data and correct role
            authStorage.setAuthData(userData, token, role);
            
            return { user: userData, token, role };
          } else {
            // Profile fetch failed, but continue with minimal data
            console.warn('Could not fetch user profile after login');
            return { user: initialUserData, token, role: 'user' };
          }
        } catch (profileError) {
          console.warn('Could not fetch user profile after login:', profileError);
          // Continue with login even if profile fetch fails
          return { user: initialUserData, token, role: 'user' };
        }
      } else {
        return rejectWithValue(response.message || 'Login failed');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Login failed');
    }
  }
);

export const registerAsync = createAsyncThunk<
  RegisterAsyncReturn,
  RegisterData,
  { rejectValue: string }
>(
  'auth/registerAsync',
  async ({ firstName, lastName, username, email, phone, password, confirmPassword }, { rejectWithValue }) => {
    try {
      const userData = {
        firstName,
        lastName,
        username,
        email,
        phone,
        password,
        confirmPassword
      };
      
      const response = await authAPI.register(userData);
      
      if (response.status === 'success' && response.data) {
        const responseData = response.data;
        const userData: AuthUser = {
          id: responseData.user_id ,
          email: email,
          name: (responseData.name as string) || firstName
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
      return rejectWithValue(error instanceof Error ? error.message : 'Registration failed');
    }
  }
);

export const forgotPassword = createAsyncThunk<
  ForgotPasswordReturn,
  string,
  { rejectValue: string }
>(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authAPI.requestPasswordReset({ email });
      
      if (response.status === 'success') {
        const responseData = response.data as Record<string, unknown>; // Type assertion for mock data
        return { 
          success: true, 
          message: response.message || 'Password reset email sent',
          token: responseData?.token as string | undefined // This will only be available in DEBUG mode
        };
      } else {
        return rejectWithValue(response.message || 'Password reset request failed');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Forgot password request failed');
    }
  }
);

export const verifyToken = createAsyncThunk<
  VerifyTokenReturn,
  string,
  { rejectValue: string }
>(
  'auth/verifyToken',
  async (token, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyResetToken(token);
      
      if (response.status === 'success' && response.data) {
        const responseData = response.data as Record<string, unknown>; // Type assertion for mock data
        return {
          valid: true,
          message: response.message || 'Token is valid',
          email: responseData.email as string | undefined,
          expiry: responseData.token_expiry as string | undefined
        };
      } else {
        return rejectWithValue(response.message || 'Invalid or expired token');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Token verification failed');
    }
  }
);

export const resetPassword = createAsyncThunk<
  ResetPasswordReturn,
  { password: string; token: string },
  { rejectValue: string }
>(
  'auth/resetPassword',
  async ({ password, token }, { rejectWithValue }) => {
    try {
      const response = await authAPI.resetPassword({ 
        token: token, 
        new_password: password,
        confirm_password: password
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
      return rejectWithValue(error instanceof Error ? error.message : 'Password reset failed');
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
      
      // Note: userName and userId are available in stored.user object
      // No need to store them separately
    },
    
    // Login action (synchronous for DevUserPanel)
    login(state, action: PayloadAction<{ user: AuthUser; role: string; token: string }>) {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.role = action.payload.role;
      state.token = action.payload.token;
      
      // Update localStorage using centralized helper
      authStorage.setAuthData(action.payload.user, action.payload.token, action.payload.role);
    },
    
    // Logout action
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.role = 'guest';
      state.token = null;
      state.error = null;
      
      // Clear localStorage using centralized helper
      authStorage.clearAuthData();
    },
    
    // Update user profile
    updateUserProfile(state, action: PayloadAction<Partial<AuthUser>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        
        // Update localStorage using centralized helper
        authStorage.updateUser(state.user);
        // Note: userName and userId are available in user object
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
      
      // Fetch user profile cases
      .addCase(fetchUserProfileAsync.fulfilled, (state, action) => {
        // Update user with complete profile data
        state.user = action.payload;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Login failed';
      })
      
      // Register async cases
      .addCase(registerAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state) => {
        state.loading = false;
        // Note: After registration, user is NOT automatically logged in
        // They need to login separately
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Registration failed';
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
        state.error = action.payload ?? 'Password reset failed';
      })
      
      // Verify token cases
      .addCase(verifyToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyToken.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Token verification failed';
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
        state.error = action.payload ?? 'Password reset failed';
      });
  },
});

// Export actions
export const { login, logout, updateUserProfile, clearError, loadUserFromStorage } = authSlice.actions;

// Selectors for easy access to auth state
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectUserRole = (state: { auth: AuthState }) => state.auth.role;
export const selectAuthToken = (state: { auth: AuthState }) => state.auth.token;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

export default authSlice.reducer;
