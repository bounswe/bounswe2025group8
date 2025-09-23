import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for volunteering for a task
export const volunteerForTask = createAsyncThunk(
  'taskDetail/volunteerForTask',
  async (taskId, { dispatch }) => {
    try {
      // In a real app, this would be an API call
      // For demo purposes, simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create a mock volunteer object
      const mockVolunteer = {
        id: 201,
        name: "Current User",
        avatar: "/path/to/current_user_avatar.png",
        rating: 4.5,
      };
      
      // Update Redux state with volunteer info
      dispatch(setSelectedVolunteer(mockVolunteer));
      dispatch(setVolunteerStatus(true));
      
      return mockVolunteer;
    } catch (error) {
      console.error('Error volunteering for task:', error);
      throw error;
    }
  }
);

// Async thunk for canceling volunteering
export const cancelVolunteering = createAsyncThunk(
  'taskDetail/cancelVolunteering',
  async (taskId, { dispatch }) => {
    try {
      // In a real app, this would be an API call
      // For demo purposes, simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Reset the volunteer status
      dispatch(setVolunteerStatus(false));
      dispatch(setStatus('pending'));
      
      return null;
    } catch (error) {
      console.error('Error canceling volunteering:', error);
      throw error;
    }
  }
);

const initialState = {
  status: 'pending', // pending, pending_volunteer, volunteered, assigned, selected, completed, cancelled
  task: null,
  selectedVolunteer: null,
  assignedVolunteers: [], // Array of volunteers who are assigned but not yet confirmed
  error: null,
  loading: false,
  isVolunteer: false // Added flag to track volunteer status
};

export const taskDetailSlice = createSlice({
  name: 'taskDetail',
  initialState,
  reducers: {
    setTask: (state, action) => {
      state.task = action.payload;
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setVolunteerStatus: (state, action) => {
      state.isVolunteer = action.payload;
      // When setting volunteer status to true, automatically set status to pending_volunteer
      if (action.payload === true) {
        state.status = 'pending_volunteer';
      }
    },
    setSelectedVolunteer: (state, action) => {
      state.selectedVolunteer = action.payload;
      // Note: We're not changing the status here anymore
      // Status changes are explicitly handled by setStatus
    },
    setAssignedVolunteers: (state, action) => {
      state.assignedVolunteers = action.payload;
      if (action.payload && action.payload.length > 0) {
        state.status = 'assigned';
      } else {
        state.status = 'pending';
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    resetTaskDetail: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Handle volunteerForTask states
      .addCase(volunteerForTask.pending, (state) => {
        state.loading = true;
      })
      .addCase(volunteerForTask.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(volunteerForTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Handle cancelVolunteering states
      .addCase(cancelVolunteering.pending, (state) => {
        state.loading = true;
      })
      .addCase(cancelVolunteering.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(cancelVolunteering.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { 
  setTask, 
  setStatus,
  setVolunteerStatus,
  setSelectedVolunteer,
  setAssignedVolunteers,
  setLoading, 
  setError,
  resetTaskDetail
} = taskDetailSlice.actions;

export default taskDetailSlice.reducer;