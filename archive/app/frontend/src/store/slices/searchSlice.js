import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for performing searches
export const searchItems = createAsyncThunk(
  'search/searchItems',
  async (searchQuery, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call to your backend
      // Mock search results for development
      const mockResults = [
        { id: 1, type: 'task', title: 'Grocery Shopping', matchScore: 0.95 },
        { id: 2, type: 'task', title: 'Dog Walking', matchScore: 0.87 },
        { id: 3, type: 'user', name: 'John Smith', matchScore: 0.76 },
        { id: 4, type: 'task', title: 'Medication Pickup', matchScore: 0.72 },
      ];
      
      // Filter mock results based on search query
      const filteredResults = mockResults.filter(result => 
        (result.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.name?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      
      return filteredResults;
    } catch (error) {
      return rejectWithValue(error.message || 'Search failed');
    }
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    results: [],
    loading: false,
    error: null,
    searchTerm: '',
  },
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    clearSearch: (state) => {
      state.results = [];
      state.searchTerm = '';
    }
  },
  extraReducers: (builder) => {
    builder
      // Search cases
      .addCase(searchItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchItems.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(searchItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSearchTerm, clearSearch } = searchSlice.actions;
export default searchSlice.reducer;
