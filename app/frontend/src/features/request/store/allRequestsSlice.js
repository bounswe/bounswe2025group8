import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getTasks } from '../services/requestService';

// Async thunk for fetching all tasks with pagination
export const fetchAllTasks = createAsyncThunk(
  'allRequests/fetchAllTasks',
  async ({ filters = {}, page = 1 }, { rejectWithValue }) => {
    try {
      console.log("Fetching all tasks with filters:", filters, "page:", page);
      const response = await getTasks(filters, page);
      console.log("Received tasks response:", response);
      return response;
    } catch (error) {
      console.error("Error in fetchAllTasks:", error);
      return rejectWithValue(
        error.response?.data || 'Error fetching tasks'
      );
    }
  }
);

// Initial state
const initialState = {
  tasks: [],
  pagination: {
    page: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
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
      state.pagination = initialState.pagination;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all tasks cases
      .addCase(fetchAllTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.tasks;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchAllTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.tasks = [];
        state.pagination = initialState.pagination;
      });
  },
});

export const { clearError, resetTasks } = allRequestsSlice.actions;

export default allRequestsSlice.reducer;