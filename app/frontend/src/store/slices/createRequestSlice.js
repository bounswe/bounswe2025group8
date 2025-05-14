import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Mock API base URL - this will be replaced with real API endpoint
const API_BASE_URL = 'https://api.neighborhoodassistance.org';

// Async thunk for submitting a request
export const submitRequest = createAsyncThunk(
  'createRequest/submitRequest',
  async (requestData, { rejectWithValue }) => {
    try {
      // For now, we'll simulate a successful submission
      console.log('Submitting request:', requestData);
      
      // In a real implementation, you would use axios:
      // const response = await axios.post(`${API_BASE_URL}/requests`, requestData);
      // return response.data;
      
      // Mock response
      return {
        success: true,
        requestId: 'req_' + Math.random().toString(36).substr(2, 9),
        message: 'Request created successfully'
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error submitting request');
    }
  }
);

// Async thunk for fetching categories
export const fetchCategories = createAsyncThunk(
  'createRequest/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      // Mock categories data
      return [
        { id: '1', name: 'Healthcare' },
        { id: '2', name: 'House Cleaning' },
        { id: '3', name: 'Tutoring' },
        { id: '4', name: 'Groceries' },
        { id: '5', name: 'Gardening' },
        { id: '6', name: 'Moving' },
        { id: '7', name: 'Pet Care' },
        { id: '8', name: 'Technical Help' },
        { id: '9', name: 'Transportation' },
        { id: '10', name: 'Uncategorized' }
      ];
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching categories');
    }
  }
);

// Async thunk for uploading photos
export const uploadPhotos = createAsyncThunk(
  'createRequest/uploadPhotos',
  async (photos, { rejectWithValue }) => {
    try {
      // In a real implementation, you would upload photos to server
      // const formData = new FormData();
      // photos.forEach((photo, index) => {
      //   formData.append(`photo${index}`, photo);
      // });
      // const response = await axios.post(`${API_BASE_URL}/upload`, formData);
      // return response.data;
      
      // Mock response - create URLs for the uploaded photos
      return photos.map(photo => {
        const mockUrl = URL.createObjectURL(photo);
        return { 
          id: 'photo_' + Math.random().toString(36).substr(2, 9),
          url: mockUrl,
          name: photo.name
        };
      });
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error uploading photos');
    }
  }
);

// Initial state of the form
const initialState = {
  currentStep: 0,
  formData: {
    // General Information step
    title: '',
    description: '',
    category: 'Uncategorized',
    urgency: 'Low',
    requiredPeople: 1,
    
    // Upload Photos step
    photos: [],
    
    // Determine Deadline step
    deadlineDate: new Date().toISOString(), // Serializable format
    deadlineTime: '09:00 AM',
    
    // Setup Address step
    city: 'ISTANBUL',
    district: '',
    neighborhood: '',
    street: '',
    buildingNo: '',
    doorNo: '',
    addressDescription: ''
  },
  uploadedPhotos: [],
  categories: [],
  loading: false,
  error: null,
  success: null
};

const createRequestSlice = createSlice({
  name: 'createRequest',
  initialState,
  reducers: {
    nextStep: (state) => {
      if (state.currentStep < 3) {
        state.currentStep += 1;
      }
    },
    prevStep: (state) => {
      if (state.currentStep > 0) {
        state.currentStep -= 1;
      }
    },
    setStep: (state, action) => {
      if (action.payload >= 0 && action.payload <= 3) {
        state.currentStep = action.payload;
      }
    },
    updateFormData: (state, action) => {
      state.formData = {
        ...state.formData,
        ...action.payload
      };
    },
    incrementRequiredPeople: (state) => {
      state.formData.requiredPeople += 1;
    },
    decrementRequiredPeople: (state) => {
      if (state.formData.requiredPeople > 1) {
        state.formData.requiredPeople -= 1;
      }
    },
    resetForm: (state) => {
      return initialState;
    },
    removePhoto: (state, action) => {
      state.uploadedPhotos = state.uploadedPhotos.filter(
        photo => photo.id !== action.payload
      );
    }
  },
  extraReducers: (builder) => {
    builder
      // Submit request cases
      .addCase(submitRequest.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload;
        state.error = null;
      })
      .addCase(submitRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch categories cases
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Upload photos cases
      .addCase(uploadPhotos.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadPhotos.fulfilled, (state, action) => {
        state.loading = false;
        state.uploadedPhotos = [...state.uploadedPhotos, ...action.payload];
        state.error = null;
      })
      .addCase(uploadPhotos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  nextStep, 
  prevStep, 
  setStep, 
  updateFormData, 
  incrementRequiredPeople,
  decrementRequiredPeople,
  resetForm,
  removePhoto
} = createRequestSlice.actions;

export default createRequestSlice.reducer;