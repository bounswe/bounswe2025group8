import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Mock API base URL - this will be replaced with real API endpoint
const API_BASE_URL = 'https://api.neighborhoodassistance.org';

// Async thunks
export const fetchUserProfile = createAsyncThunk(
  'profile/fetchUserProfile',
  async (userId, { rejectWithValue }) => {
    try {
      // In a real app, this would call an actual API
      // For now, we'll simulate a successful response with mock data
      
      // Mock user data that matches the design
      return {
        id: '123',
        name: 'Batuhan Büber',
        profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg',
        rating: 4.7,
        reviewCount: 12,
        completedTasks: 25,
        location: 'Hidden for privacy',
        email: 'ashley.robinson@example.com',
        phone: 'Hidden until task assignment',
      };
      
      // In a real implementation:
      // const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
      // return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching profile');
    }
  }
);

export const fetchUserReviews = createAsyncThunk(
  'profile/fetchUserReviews',
  async (userId, { rejectWithValue }) => {
    try {
      // Mock reviews data
      return [
        {
          id: '1',
          reviewer: {
            id: '101',
            name: 'Matthew Brown',
            profilePicture: 'https://randomuser.me/api/portraits/men/33.jpg',
          },
          rating: 5,
          date: '2025-05-13',
          comment: 'Dolore aute aliqua quis non do incididunt. Sunt cupidatat laboris commodo do occaecat irure id exercitation. Veniam culpa irure veniam'
        },
        {
          id: '2',
          reviewer: {
            id: '102',
            name: 'Ashley Gonzalez',
            profilePicture: 'https://randomuser.me/api/portraits/women/32.jpg',
          },
          rating: 3,
          date: '2025-05-08',
          comment: 'Dolore aute aliqua quis non do incididunt. Sunt cupid sawqs'
        },
        {
          id: '3',
          reviewer: {
            id: '103',
            name: 'Jennifer',
            profilePicture: 'https://randomuser.me/api/portraits/women/68.jpg',
          },
          rating: 5,
          date: '2025-05-01',
          comment: 'Dolore aute aliqua quis non do incididunt. Sunt cupidatat laboris commodo'
        },
      ];
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching reviews');
    }
  }
);

// Separate async thunk for fetching requests the user has created
export const fetchUserCreatedRequests = createAsyncThunk(
  'profile/fetchUserCreatedRequests',
  async (userId, { rejectWithValue }) => {
    try {
      // Mock requests data for tasks created by the user
      return [
        {
          id: '1',
          title: 'I need to clean my house',
          image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          category: 'House Cleaning',
          distance: '750 m',
          timeAgo: '22 hours ago',
          urgency: 'Low',
          status: 'Pending',
          completed: false,
          volunteersCount: 0,
          role: 'requester'
        },
        {
          id: '2',
          title: 'Help for my math exam',
          image: 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          category: 'Tutoring',
          distance: '550 m',
          timeAgo: '10 hours ago',
          urgency: 'Medium',
          status: 'Rejected',
          completed: false,
          volunteersCount: 2,
          role: 'requester'
        },
        {
          id: '3',
          title: 'Grocery shopping help',
          image: 'https://images.unsplash.com/photo-1579113800032-c38bd7635818?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          category: 'Groceries',
          distance: '1.2 km',
          timeAgo: '3 days ago',
          urgency: 'Medium',
          status: 'Completed',
          completed: true,
          volunteersCount: 1,
          role: 'requester'
        },
      ];
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching created requests');
    }
  }
);

// Separate async thunk for fetching requests the user has volunteered for
export const fetchUserVolunteeredRequests = createAsyncThunk(
  'profile/fetchUserVolunteeredRequests',
  async (userId, { rejectWithValue }) => {
    try {
      // Mock requests data for tasks the user volunteered for
      return [
        {
          id: '4',
          title: 'Help me to see a doctor',
          image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          category: 'Healthcare',
          distance: '2 km',
          timeAgo: '3 hours ago',
          urgency: 'High',
          status: 'Accepted',
          completed: false,
          requesterName: 'John Doe',
          requesterRating: 4.2,
          role: 'volunteer'
        },
        {
          id: '5',
          title: 'Garden help needed',
          image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?ixlib=rb-1.2.1&auto=format&fit=crop&w=1489&q=80',
          category: 'Gardening',
          distance: '3.5 km',
          timeAgo: '1 week ago',
          urgency: 'Low',
          status: 'Completed',
          completed: true,
          requesterName: 'Emily Johnson',
          requesterRating: 4.8,
          role: 'volunteer'
        },
        {
          id: '6',
          title: 'Help with moving furniture',
          image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          category: 'Moving',
          distance: '1.8 km',
          timeAgo: '2 days ago',
          urgency: 'Medium',
          status: 'Pending',
          completed: false,
          requesterName: 'Michael Smith',
          requesterRating: 3.9,
          role: 'volunteer'
        },
      ];
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching volunteered requests');
    }
  }
);

// Legacy function
export const fetchUserRequests = createAsyncThunk(
  'profile/fetchUserRequests',
  async (userId, { rejectWithValue }) => {
    try {
      // Now this is just a combination of both types
      const created = [
        {
          id: '1',
          title: 'I need to clean my house',
          image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          category: 'House Cleaning',
          distance: '750 m',
          timeAgo: '22 hours ago',
          urgency: 'Low',
          status: 'Pending',
          completed: false,
          volunteersCount: 0,
          role: 'requester'
        },
        {
          id: '2',
          title: 'Help for my math exam',
          image: 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          category: 'Tutoring',
          distance: '550 m',
          timeAgo: '10 hours ago',
          urgency: 'Medium',
          status: 'Rejected',
          completed: false,
          volunteersCount: 2,
          role: 'requester'
        },
      ];
      
      const volunteered = [
        {
          id: '4',
          title: 'Help me to see a doctor',
          image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          category: 'Healthcare',
          distance: '2 km',
          timeAgo: '3 hours ago',
          urgency: 'High',
          status: 'Accepted',
          completed: false,
          requesterName: 'John Doe',
          requesterRating: 4.2,
          role: 'volunteer'
        },
        {
          id: '5',
          title: 'Garden help needed',
          image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?ixlib=rb-1.2.1&auto=format&fit=crop&w=1489&q=80',
          category: 'Gardening',
          distance: '3.5 km',
          timeAgo: '1 week ago',
          urgency: 'Low',
          status: 'Completed',
          completed: true,
          requesterName: 'Emily Johnson',
          requesterRating: 4.8,
          role: 'volunteer'
        },
      ];
      
      return [...created, ...volunteered];
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching requests');
    }
  }
);

// Badges
export const fetchUserBadges = createAsyncThunk(
  'profile/fetchUserBadges',
  async (userId, { rejectWithValue }) => {
    try {
      // Mock badges data with images
      return [
        {
          id: 'badge1',
          title: 'First Steps',
          description: 'Completed 5 tasks',
          image: 'https://cdn-icons-png.flaticon.com/128/8382/8382248.png', // Minimalist badge
          color: '#FF9800',
          earned: true,
          earnedDate: '2025-02-15'
        },
        {
          id: 'badge2',
          title: 'Helping Hand',
          description: 'Completed 10 tasks',
          image: 'https://cdn-icons-png.flaticon.com/128/1067/1067357.png', // Handshake icon
          color: '#4CAF50',
          earned: true,
          earnedDate: '2025-03-22'
        },
        {
          id: 'badge3',
          title: 'Community Pillar',
          description: 'Completed 25 tasks',
          image: 'https://cdn-icons-png.flaticon.com/128/3588/3588611.png', // Community icon
          color: '#5C69FF',
          earned: false,
          progress: 68,
          requiredAmount: 25
        },
        {
          id: 'badge4',
          title: 'Neighborhood Hero',
          description: 'Completed 50 tasks',
          image: 'https://cdn-icons-png.flaticon.com/128/1756/1756636.png', // Medal icon
          color: '#F06292',
          earned: false,
          progress: 34,
          requiredAmount: 50
        },
        {
          id: 'badge5',
          title: 'Excellent Rating',
          description: 'Maintained 4.5+ rating for 3 months',
          image: 'https://cdn-icons-png.flaticon.com/128/992/992001.png', // Star icon
          color: '#FFD700',
          earned: true,
          earnedDate: '2025-04-18'
        }
      ];
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching badges');
    }
  }
);

// Profile slice
const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    user: {},
    reviews: [],
    requests: [],
    createdRequests: [],
    volunteeredRequests: [],
    badges: [],
    loading: false,
    error: null,
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
      
      // Legacy Requests cases (for backward compatibility)
      .addCase(fetchUserRequests.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
        state.error = null;
      })
      .addCase(fetchUserRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default profileSlice.reducer;