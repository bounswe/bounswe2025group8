import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getTasks } from '../services/requestService';
import { cancelTask } from '../services/createRequestService';

// Async thunk for fetching all tasks with pagination
export const fetchAllTasks = createAsyncThunk(
  'allRequests/fetchAllTasks',
  async ({ filters = {}, page = 1, includeStatus = [] }, { rejectWithValue }) => {
    try {
      // Add default status filtering to exclude cancelled and completed tasks if no status is specified
      const enhancedFilters = { ...filters };
      
      // If no specific status filter is provided and includeStatus is empty,
      // exclude cancelled and completed tasks by default for the AllRequests page
      if (!enhancedFilters.status && includeStatus.length === 0) {
        // We'll filter on the frontend since the backend expects single status values
        // and we want to exclude CANCELLED and COMPLETED specifically
      }
      
      console.log("Fetching all tasks with filters:", enhancedFilters, "page:", page);
      const response = await getTasks(enhancedFilters, page);
      console.log("Received tasks response:", response);
      
      // Filter out cancelled and completed tasks if not explicitly included
      const shouldExcludeStatuses = !enhancedFilters.status && includeStatus.length === 0;
      if (shouldExcludeStatuses && response.tasks) {
        const originalTasks = response.tasks;
        // Exclude CANCELLED, COMPLETED, and EXPIRED tasks from AllRequests page
        const filteredTasks = originalTasks.filter(task => 
          task.status !== 'CANCELLED' && task.status !== 'COMPLETED' && task.status !== 'EXPIRED'
        );
        
        return {
          ...response,
          tasks: filteredTasks,
          pagination: {
            ...response.pagination,
            // Adjust pagination based on filtered results
            totalItems: Math.max(0, response.pagination.totalItems - (originalTasks.length - filteredTasks.length))
          }
        };
      }
      
      return response;
    } catch (error) {
      console.error("Error in fetchAllTasks:", error);
      return rejectWithValue(
        error.response?.data || 'Error fetching tasks'
      );
    }
  }
);

// Async thunk for deleting a task
export const deleteTask = createAsyncThunk(
  'allRequests/deleteTask',
  async (taskId, { rejectWithValue }) => {
    try {
      console.log("Deleting task:", taskId);
      await cancelTask(taskId);
      return taskId;
    } catch (error) {
      console.error("Error in deleteTask:", error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Error deleting task'
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
    // Manual action to remove a task from the list (for immediate UI updates)
    removeTaskFromList: (state, action) => {
      const taskId = action.payload;
      const initialLength = state.tasks.length;
      state.tasks = state.tasks.filter(task => task.id !== taskId);
      // Update pagination info only if a task was actually removed
      const removedCount = initialLength - state.tasks.length;
      if (removedCount > 0 && state.pagination.totalItems > 0) {
        state.pagination.totalItems -= removedCount;
      }
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
      })
      // Delete task cases
      .addCase(deleteTask.pending, (state) => {
        // Optionally set a deleting flag
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        // Remove the deleted task from the list immediately
        const deletedTaskId = action.payload;
        state.tasks = state.tasks.filter(task => task.id !== deletedTaskId);
        // Update pagination info
        if (state.pagination.totalItems > 0) {
          state.pagination.totalItems -= 1;
        }
        state.error = null;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearError, resetTasks, removeTaskFromList } = allRequestsSlice.actions;

export default allRequestsSlice.reducer;