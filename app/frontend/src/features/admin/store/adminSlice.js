import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getReports,
  getTaskReports,
  getUserReports,
  getAllRequests,
  getReportedUsers,
  updateReportStatus,
  banUser,
  deleteTask,
  getAdminUserDetail,
  sendWarning,
} from '../services/adminService';

// Async thunks for reports
export const fetchReports = createAsyncThunk(
  'admin/fetchReports',
  async ({ reportType = 'all', status = null, page = 1 }, { rejectWithValue }) => {
    try {
      return await getReports(reportType, status, page);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching reports');
    }
  }
);

export const fetchTaskReports = createAsyncThunk(
  'admin/fetchTaskReports',
  async ({ status = null, page = 1 }, { rejectWithValue }) => {
    try {
      return await getTaskReports(status, page);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching task reports');
    }
  }
);

export const fetchUserReports = createAsyncThunk(
  'admin/fetchUserReports',
  async ({ status = null, page = 1 }, { rejectWithValue }) => {
    try {
      return await getUserReports(status, page);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching user reports');
    }
  }
);

// Async thunk for fetching all requests
export const fetchAllAdminRequests = createAsyncThunk(
  'admin/fetchAllRequests',
  async ({ filters = {}, page = 1 }, { rejectWithValue }) => {
    try {
      return await getAllRequests(filters, page);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching requests');
    }
  }
);

// Async thunk for fetching reported users
export const fetchReportedUsers = createAsyncThunk(
  'admin/fetchReportedUsers',
  async ({ page = 1 }, { rejectWithValue }) => {
    try {
      return await getReportedUsers(page);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching reported users');
    }
  }
);

// Async thunk for updating report status
export const updateReportStatusThunk = createAsyncThunk(
  'admin/updateReportStatus',
  async ({ reportType, reportId, status, notes = '' }, { rejectWithValue }) => {
    try {
      const result = await updateReportStatus(reportType, reportId, status, notes);
      return { reportId, reportType, ...result };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error updating report status');
    }
  }
);

// Async thunk for banning user
export const banUserThunk = createAsyncThunk(
  'admin/banUser',
  async ({ userId, reason }, { rejectWithValue }) => {
    try {
      const result = await banUser(userId, reason);
      return { userId, ...result };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error banning user');
    }
  }
);

// Async thunk for sending warning to user
export const sendWarningThunk = createAsyncThunk(
  'admin/sendWarning',
  async ({ userId, message }, { rejectWithValue }) => {
    try {
      const result = await sendWarning(userId, message);
      return { userId, ...result };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error sending warning');
    }
  }
);

// Async thunk for deleting task
export const deleteTaskThunk = createAsyncThunk(
  'admin/deleteTask',
  async ({ taskId, reason = '' }, { rejectWithValue }) => {
    try {
      const result = await deleteTask(taskId, reason);
      return { taskId, ...result };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error deleting task');
    }
  }
);

// Async thunk for getting admin user detail
export const fetchAdminUserDetail = createAsyncThunk(
  'admin/fetchAdminUserDetail',
  async ({ userId }, { rejectWithValue }) => {
    try {
      return await getAdminUserDetail(userId);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching user details');
    }
  }
);

// Initial state
const initialState = {
  reports: [],
  taskReports: [],
  userReports: [],
  allRequests: [],
  reportedUsers: [],
  userDetail: null,
  pagination: {
    page: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  stats: {},
  loading: false,
  actionLoading: false,
  error: null,
  successMessage: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.successMessage = null;
    },
    resetAdminState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch reports
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload.reports;
        state.pagination = action.payload.pagination;
        state.stats = action.payload.stats;
        state.error = null;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch task reports
      .addCase(fetchTaskReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskReports.fulfilled, (state, action) => {
        state.loading = false;
        state.taskReports = action.payload.reports;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchTaskReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch user reports
      .addCase(fetchUserReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserReports.fulfilled, (state, action) => {
        state.loading = false;
        state.userReports = action.payload.reports;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchUserReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch all requests
      .addCase(fetchAllAdminRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAdminRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.allRequests = action.payload.tasks;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchAllAdminRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch reported users
      .addCase(fetchReportedUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReportedUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.reportedUsers = action.payload.users;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchReportedUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch admin user detail
      .addCase(fetchAdminUserDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminUserDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.userDetail = action.payload;
        state.error = null;
      })
      .addCase(fetchAdminUserDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update report status
      .addCase(updateReportStatusThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateReportStatusThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = 'Report status updated successfully';
        state.error = null;
      })
      .addCase(updateReportStatusThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Ban user
      .addCase(banUserThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(banUserThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = 'User banned successfully';
        state.error = null;
      })
      .addCase(banUserThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Delete task
      .addCase(deleteTaskThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteTaskThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = 'Task deleted successfully';
        state.allRequests = state.allRequests.filter(
          (task) => task.id !== action.payload.taskId
        );
        state.error = null;
      })
      .addCase(deleteTaskThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Send warning
      .addCase(sendWarningThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(sendWarningThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = 'Warning sent successfully';
        state.error = null;
      })
      .addCase(sendWarningThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, resetAdminState } = adminSlice.actions;

export default adminSlice.reducer;
