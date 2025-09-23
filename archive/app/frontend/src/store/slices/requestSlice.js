import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as taskService from "../../services/taskService";

/**
 * Fetch requests with filtering and pagination
 * @param {Object} options - Options for fetching requests
 * @param {Object} options.filters - Filter parameters to apply (will be sent as URL query params)
 * @param {number} options.page - Page number for pagination
 * @param {number} options.limit - Items per page
 */
export const fetchRequests = createAsyncThunk(
  "requests/fetchRequests",
  async ({ filters = {}, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      // Clean up filter object - remove empty or undefined values
      const cleanFilters = {};
      Object.keys(filters).forEach((key) => {
        if (
          filters[key] !== undefined &&
          filters[key] !== null &&
          filters[key] !== ""
        ) {
          cleanFilters[key] = filters[key];
        }
      });

      const response = await taskService.getTasks(cleanFilters, page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching requests");
    }
  }
);

/**
 * Fetch a single request by ID
 */
export const fetchRequestById = createAsyncThunk(
  "requests/fetchRequestById",
  async (requestId, { rejectWithValue }) => {
    try {
      const response = await taskService.getTaskById(requestId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching request details"
      );
    }
  }
);

const initialState = {
  requests: [],
  filteredRequests: [],
  currentRequest: null,
  filters: {
    category: "",
    urgency_level: "", // Use urgency_level consistently in UI state
    searchTerm: "",
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
};

const requestSlice = createSlice({
  name: "requests",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },    filterRequests: (state) => {
      const { category, urgency_level, searchTerm } = state.filters;
      let filtered = [...state.requests];

      // Apply category filter
      if (category) {
        filtered = filtered.filter(
          (request) =>
            request.categories &&
            request.categories.some((cat) => cat === category)
        );
      }

      // Apply urgency filter - using urgency_level for consistency
      if (urgency_level) {
        filtered = filtered.filter(
          (request) =>
            (request.urgency_level &&
              request.urgency_level.toString() === urgency_level)
        );
      }

      // Apply search term
      if (searchTerm?.trim()) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (request) =>
            (request.title && request.title.toLowerCase().includes(term)) ||
            (request.categories &&
              request.categories.some(
                (cat) =>
                  typeof cat === "string" && cat.toLowerCase().includes(term)
              ))
        );
      }

      state.filteredRequests = filtered;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchRequests states
      .addCase(fetchRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        // The taskService now returns the correct structure
        const { tasks, pagination } = action.payload;

        state.filteredRequests = tasks;
        state.pagination = pagination;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch requests";
      })

      // Handle fetchRequestById states
      .addCase(fetchRequestById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequestById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRequest = action.payload;
      })
      .addCase(fetchRequestById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch request details";
      });
  },
});

export const { setFilters, clearFilters, setPage, filterRequests } =
  requestSlice.actions;

export default requestSlice.reducer;
