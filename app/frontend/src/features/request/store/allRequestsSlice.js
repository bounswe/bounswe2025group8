import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getPopularTasks } from '../services/requestService';

// Async thunk for fetching popular tasks
export const fetchPopularTasks = createAsyncThunk(
  'allRequests/fetchPopularTasks',
  async (limit = 6, { rejectWithValue }) => {
    try {
      console.log("Fetching popular tasks with limit:", limit);
      const tasks = await getPopularTasks(limit);
      console.log("Received tasks:", tasks);
      return tasks;
    } catch (error) {
      console.error("Error in fetchPopularTasks:", error);
      return rejectWithValue(
        error.response?.data || 'Error fetching popular tasks'
      );
    }
  }
);

// Initial state
const initialState = {
  tasks: [],
  loading: false,
  error: null,
};

const allRequestsSlice = createSlice({
  name: 'allRequests',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetTasks: (state) => {
      state.tasks = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch popular tasks cases
      .addCase(fetchPopularTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPopularTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
        state.error = null;
      })
      .addCase(fetchPopularTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.tasks = [];
      });
  },
});

export const { clearError, resetTasks } = allRequestsSlice.actions;

export default allRequestsSlice.reducer;