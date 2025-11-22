import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as profileService from '../services/profileService';

// Async thunks using our service
export const fetchUserProfile = createAsyncThunk(
  'profile/fetchUserProfile',
  async (userId, { rejectWithValue }) => {
    try {
      // For 'current' user, replace with the actual ID from local storage
      const currentUserId = localStorage.getItem('userId');
      const actualUserId = userId === 'current' && currentUserId ? currentUserId : userId;
      
      return await profileService.getUserProfile(actualUserId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data || 'Error fetching profile');
    }
  }
);

export const fetchUserReviews = createAsyncThunk(
  'profile/fetchUserReviews',
  async ({ userId, page = 1, limit = 20, role = null }, { rejectWithValue }) => {
    try {
      // For 'current' user, replace with the actual ID from local storage
      const currentUserId = localStorage.getItem('userId');
      const actualUserId = userId === 'current' && currentUserId ? currentUserId : userId;
      
      const response = await profileService.getUserReviews(actualUserId, page, limit, 'createdAt', 'desc', role);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data || 'Error fetching reviews');
    }
  }
);

export const fetchUserCreatedRequests = createAsyncThunk(
  'profile/fetchUserCreatedRequests',
  async ({ userId, page = 1, limit = 10, status = null }, { rejectWithValue }) => {
    try {
      // For 'current' user, replace with the actual ID from local storage
      const currentUserId = localStorage.getItem('userId');
      const actualUserId = userId === 'current' && currentUserId ? currentUserId : userId;
      
      const response = await profileService.getUserCreatedRequests(actualUserId, page, limit, status);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data || 'Error fetching created requests');
    }
  }
);

export const fetchUserVolunteeredRequests = createAsyncThunk(
  'profile/fetchUserVolunteeredRequests',
  async ({ userId, page = 1, limit = 10, taskStatus = null }, { rejectWithValue }) => {
    try {
      // For 'current' user, replace with the actual ID from local storage
      const currentUserId = localStorage.getItem('userId');
      const actualUserId = userId === 'current' && currentUserId ? currentUserId : userId;
      
      const response = await profileService.getUserVolunteeredRequests(actualUserId, page, limit, taskStatus);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data || 'Error fetching volunteered requests');
    }
  }
);

export const fetchUserBadges = createAsyncThunk(
  'profile/fetchUserBadges',
  async (userId, { rejectWithValue }) => {
    try {
      // For 'current' user, replace with the actual ID from local storage
      const currentUserId = localStorage.getItem('userId');
      const actualUserId = userId === 'current' && currentUserId ? currentUserId : userId;
      
      return await profileService.getUserBadges(actualUserId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data || 'Error fetching badges');
    }
  }
);

export const updateUserProfileDetails = createAsyncThunk(
  'profile/updateUserProfileDetails',
  async (userData, { rejectWithValue }) => {
    try {
      const currentUserId = localStorage.getItem('userId');
      if (!currentUserId) {
        throw new Error('User ID not found. Please log in again.');
      }
      
      const response = await profileService.updateUserProfile(userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data || 'Error updating profile');
    }
  }
);

export const uploadProfilePicture = createAsyncThunk(
  'profile/uploadProfilePicture',
  async (file, { rejectWithValue }) => {
    try {
      const currentUserId = localStorage.getItem('userId');
      if (!currentUserId) {
        throw new Error('User ID not found. Please log in again.');
      }
      
      const response = await profileService.uploadProfilePicture(file);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data || 'Error uploading profile picture');
    }
  }
);

// Profile slice
const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    user: {},
    reviews: [],
    createdRequests: [],
    volunteeredRequests: [],
    badges: [],
    loading: false,
    error: null,
    updateSuccess: false,
    uploadSuccess: false,
  },
  reducers: {
    clearProfileErrors: (state) => {
      state.error = null;
    },
    clearUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
    clearUploadSuccess: (state) => {
      state.uploadSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // User profile cases
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Reviews cases
      .addCase(fetchUserReviews.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserReviews.fulfilled, (state, action) => {
        state.loading = false;
        
        // Ensure we're not storing Date objects in Redux
        // The backend returns timestamp as string (ISO format)
        state.reviews = action.payload;
        state.error = null;
      })
      .addCase(fetchUserReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Created Requests cases
      .addCase(fetchUserCreatedRequests.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserCreatedRequests.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure we store the whole response (which may include pagination info)
        state.createdRequests = action.payload;
        state.error = null;
      })
      .addCase(fetchUserCreatedRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Volunteered Requests cases
      .addCase(fetchUserVolunteeredRequests.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserVolunteeredRequests.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure we store the whole response (which may include pagination info)
        state.volunteeredRequests = action.payload;
        state.error = null;
      })
      .addCase(fetchUserVolunteeredRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Badges cases
      .addCase(fetchUserBadges.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserBadges.fulfilled, (state, action) => {
        state.loading = false;
        state.badges = action.payload;
        state.error = null;
      })
      .addCase(fetchUserBadges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update profile cases
      .addCase(updateUserProfileDetails.pending, (state) => {
        state.loading = true;
        state.updateSuccess = false;
      })
      .addCase(updateUserProfileDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.user = {...state.user, ...action.payload};
        state.error = null;
        state.updateSuccess = true;
      })
      .addCase(updateUserProfileDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.updateSuccess = false;
      })
      
      // Upload profile picture cases
      .addCase(uploadProfilePicture.pending, (state) => {
        state.loading = true;
        state.uploadSuccess = false;
      })
      .addCase(uploadProfilePicture.fulfilled, (state, action) => {
        state.loading = false;
        const newPhoto =
          action.payload?.profile_photo ||
          action.payload?.profilePhoto ||
          action.payload?.profilePicture ||
          action.payload?.photo ||
          null;
        state.user = {
          ...state.user,
          profile_photo: newPhoto,
          profilePhoto: newPhoto,
          profilePicture: newPhoto,
        };
        state.error = null;
        state.uploadSuccess = true;
      })
      .addCase(uploadProfilePicture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.uploadSuccess = false;
      });
  },
});

export const { clearProfileErrors, clearUpdateSuccess, clearUploadSuccess } = profileSlice.actions;

export default profileSlice.reducer;
