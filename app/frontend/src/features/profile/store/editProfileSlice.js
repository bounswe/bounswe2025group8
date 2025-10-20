import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as editProfileService from '../services/editProfileService';

// Async thunk for updating user profile
export const updateUserProfile = createAsyncThunk(
  'editProfile/updateUserProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      // Validate the profile data first
      const validation = editProfileService.validateProfileData(profileData);
      if (!validation.isValid) {
        return rejectWithValue(validation.errors);
      }

      // Update the profile via API
      const updatedUser = await editProfileService.updateUserProfile(profileData);
      return updatedUser;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data || 
        error.message || 
        'Failed to update profile'
      );
    }
  }
);

// Async thunk for fetching current user profile
export const fetchCurrentUserProfile = createAsyncThunk(
  'editProfile/fetchCurrentUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const userData = await editProfileService.getCurrentUserProfile();
      return userData;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data || 
        error.message || 
        'Failed to fetch profile'
      );
    }
  }
);

// Async thunk for uploading profile picture
export const uploadProfilePicture = createAsyncThunk(
  'editProfile/uploadProfilePicture',
  async (file, { rejectWithValue }) => {
    try {
      const updatedUser = await editProfileService.uploadProfilePicture(file);
      return updatedUser;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data || 
        error.message || 
        'Failed to upload profile picture'
      );
    }
  }
);

// Initial state
const initialState = {
  user: {
    id: null,
    name: '',
    surname: '',
    username: '',
    email: '', // Read-only field, displayed but not editable
    phone: '', // Read-only field, displayed but not editable
    profilePicture: null,
    rating: 0,
    reviewCount: 0
  },
  loading: false,
  updating: false,
  uploading: false,
  error: null,
  validationErrors: null,
  updateSuccess: false,
  uploadSuccess: false,
};

// Edit profile slice
const editProfileSlice = createSlice({
  name: 'editProfile',
  initialState,
  reducers: {
    // Clear error messages
    clearError: (state) => {
      state.error = null;
      state.validationErrors = null;
    },
    
    // Clear success flags
    clearSuccess: (state) => {
      state.updateSuccess = false;
      state.uploadSuccess = false;
    },
    
    // Reset the entire state
    resetEditProfile: (state) => {
      return initialState;
    },
    
    // Update user data locally (for optimistic updates)
    updateUserLocally: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    
    // Set validation errors
    setValidationErrors: (state, action) => {
      state.validationErrors = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch current user profile
      .addCase(fetchCurrentUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchCurrentUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.updating = true;
        state.error = null;
        state.validationErrors = null;
        state.updateSuccess = false;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.updating = false;
        state.user = { ...state.user, ...action.payload };
        state.error = null;
        state.validationErrors = null;
        state.updateSuccess = true;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.updating = false;
        
        // Handle validation errors separately
        if (typeof action.payload === 'object' && !action.payload.message) {
          state.validationErrors = action.payload;
          state.error = null;
        } else {
          state.error = action.payload;
          state.validationErrors = null;
        }
        
        state.updateSuccess = false;
      })
      
      // Upload profile picture
      .addCase(uploadProfilePicture.pending, (state) => {
        state.uploading = true;
        state.error = null;
        state.uploadSuccess = false;
      })
      .addCase(uploadProfilePicture.fulfilled, (state, action) => {
        state.uploading = false;
        
        // Update user with new profile picture
        if (action.payload.profilePicture || action.payload.photo) {
          state.user.profilePicture = action.payload.profilePicture || action.payload.photo;
        }
        
        state.error = null;
        state.uploadSuccess = true;
      })
      .addCase(uploadProfilePicture.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
        state.uploadSuccess = false;
      });
  },
});

// Export actions
export const { 
  clearError, 
  clearSuccess, 
  resetEditProfile, 
  updateUserLocally, 
  setValidationErrors 
} = editProfileSlice.actions;

// Selectors
export const selectEditProfile = (state) => state.editProfile;
export const selectUser = (state) => state.editProfile.user;
export const selectIsUpdating = (state) => state.editProfile.updating;
export const selectIsUploading = (state) => state.editProfile.uploading;
export const selectError = (state) => state.editProfile.error;
export const selectValidationErrors = (state) => state.editProfile.validationErrors;
export const selectUpdateSuccess = (state) => state.editProfile.updateSuccess;
export const selectUploadSuccess = (state) => state.editProfile.uploadSuccess;

// Export reducer
export default editProfileSlice.reducer;
