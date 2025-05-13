import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for submitting a review
export const submitReview = createAsyncThunk(
  'review/submitReview',
  async ({ taskId, volunteerId, rating, reviewText }, { dispatch }) => {
    try {
      // In a real app, this would be an API call
      // For demo purposes, simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        taskId,
        volunteerId, 
        rating,
        reviewText,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  }
);

// Async thunk for fetching volunteers for a task
export const fetchVolunteersForTask = createAsyncThunk(
  'review/fetchVolunteersForTask',
  async (taskId, { dispatch }) => {
    try {
      // In a real app, this would be an API call
      // For demo purposes, simulate API call with delay and return mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data - in a real app, this would come from the API
      const mockVolunteers = [
        {
          id: 101,
          name: "Elizabeth Bailey",
          avatar: null, // Use initial instead
          rating: 4.5,
        },
        {
          id: 102,
          name: "Michael Johnson",
          avatar: null,
          rating: 4.0,
        },
        {
          id: 103,
          name: "Sarah Parker",
          avatar: null,
          rating: 5.0,
        }
      ];
      
      return mockVolunteers;
    } catch (error) {
      console.error('Error fetching volunteers for task:', error);
      throw error;
    }
  }
);

const initialState = {
  isDialogOpen: false,
  taskId: null,
  volunteers: [],
  selectedVolunteer: null,
  reviews: {},  // Map of volunteerId -> {rating, review}
  loading: false,
  error: null,
  submittedReviews: [] // Track which volunteers have been reviewed
};

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    openReviewDialog: (state, action) => {
      state.isDialogOpen = true;
      state.taskId = action.payload.taskId;
    },
    closeReviewDialog: (state) => {
      state.isDialogOpen = false;
    },
    selectVolunteer: (state, action) => {
      state.selectedVolunteer = action.payload;
    },
    addReview: (state, action) => {
      const { volunteerId, rating, reviewText } = action.payload;
      state.reviews[volunteerId] = { rating, reviewText };
      
      // Add to submitted reviews list
      if (!state.submittedReviews.includes(volunteerId)) {
        state.submittedReviews.push(volunteerId);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchVolunteersForTask
      .addCase(fetchVolunteersForTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVolunteersForTask.fulfilled, (state, action) => {
        state.loading = false;
        state.volunteers = action.payload;
        // Set the first volunteer as selected by default
        if (action.payload.length > 0 && !state.selectedVolunteer) {
          state.selectedVolunteer = action.payload[0];
        }
      })
      .addCase(fetchVolunteersForTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Handle submitReview
      .addCase(submitReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.loading = false;
        // Add the review to our state
        const { volunteerId, rating, reviewText } = action.payload;
        state.reviews[volunteerId] = { rating, reviewText };
        
        // Add to submitted reviews list
        if (!state.submittedReviews.includes(volunteerId)) {
          state.submittedReviews.push(volunteerId);
        }
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { openReviewDialog, closeReviewDialog, selectVolunteer, addReview } = reviewSlice.actions;

export default reviewSlice.reducer;
