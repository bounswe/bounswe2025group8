import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { serializeDate } from '../../../utils/dateUtils';
import * as createRequestService from '../services/createRequestService';
import { mapFormToTaskApiFormat } from '../../../utils/taskUtils';

// Async thunk for submitting a request
export const submitRequest = createAsyncThunk(
  'createRequest/submitRequest',
  async (formData, { rejectWithValue }) => {
    try {
      // Transform the form data to match the API's expected format
      const taskData = mapFormToTaskApiFormat(formData);
      
      // Create the task in the backend
      const createdTask = await createRequestService.createTask(taskData);
      
      // Photo upload functionality is temporarily disabled
      // (Previously attempted to upload photos here)
      
      return {
        success: true,
        requestId: createdTask.id,
        message: 'Request created successfully',
        task: createdTask
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
      return await createRequestService.fetchCategories();
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching categories');
    }
  }
);

// Async thunk for processing photos for preview
export const uploadPhotos = createAsyncThunk(
  'createRequest/uploadPhotos',
  async (photos, { rejectWithValue }) => {
    try {
      // Ensure photos is always an array
      const photoArray = Array.isArray(photos) ? photos : [photos];
      
      // Generate temporary URLs for previewing photos in the UI
      // The actual upload happens later in submitRequest
      return photoArray.map(photo => {
        const previewUrl = URL.createObjectURL(photo);
        return { 
          id: 'photo_' + Math.random().toString(36).substr(2, 9),
          url: previewUrl,
          name: photo.name,
          file: photo // Store the file object for later upload
        };
      });    } catch (error) {
      console.error('Error in uploadPhotos:', error);
      return rejectWithValue(error.message || 'Error processing photos');
    }
  }
);

// Initial state of the form
const initialState = {
  currentStep: 0,  formData: {    // General Information step
    title: '',
    description: '',
    category: 'OTHER',  // Default to OTHER category value
    urgency: '2',  // '2' represents "Low" urgency
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
      const payload = { ...action.payload };
      
      // Check if deadlineDate exists and needs serialization
      if (payload.deadlineDate instanceof Date) {
        payload.deadlineDate = serializeDate(payload.deadlineDate);
      }
      
      state.formData = {
        ...state.formData,
        ...payload
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
    resetForm: () => {
      // Make sure we use serialized dates when resetting
      return {
        ...initialState,
        formData: {
          ...initialState.formData,
          deadlineDate: serializeDate(new Date())
        }
      };
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
      })      .addCase(uploadPhotos.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure action.payload is always treated as an array
        const payloadArray = Array.isArray(action.payload) ? action.payload : [action.payload];
        state.uploadedPhotos = [...state.uploadedPhotos, ...payloadArray];
        state.error = null;
      })      .addCase(uploadPhotos.rejected, (state, action) => {
        state.loading = false;
        // Handle the error message safely
        state.error = action.payload || 'Failed to upload photos';
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