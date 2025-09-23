import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as categoryService from '../../services/categoryService';

// Initial state
const initialState = {
  categories: [],
  popularCategories: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const categories = await categoryService.getCategories();
      return categories;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch categories');
    }
  }
);

export const fetchPopularCategories = createAsyncThunk(
  'categories/fetchPopularCategories',
  async (limit = 5, { rejectWithValue }) => {
    try {
      const popularCategories = await categoryService.getPopularCategories(limit);
      return popularCategories;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch popular categories');
    }
  }
);

// Category slice
const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch popular categories
      .addCase(fetchPopularCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPopularCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.popularCategories = action.payload;
      })
      .addCase(fetchPopularCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const { clearCategoryError } = categorySlice.actions;

// Export selectors
export const selectAllCategories = (state) => state.categories.categories;
export const selectPopularCategories = (state) => state.categories.popularCategories;
export const selectCategoriesLoading = (state) => state.categories.loading;
export const selectCategoriesError = (state) => state.categories.error;

export default categorySlice.reducer;
