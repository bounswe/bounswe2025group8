import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { serializeDate } from '../../utils/dateUtils';

// Mock API base URL - this will be replaced with real API endpoint
const API_BASE_URL = 'https://api.neighborhoodassistance.org';

// Async thunk for submitting a request
export const submitRequest = createAsyncThunk(
  'createRequest/submitRequest',
  async (requestData, { rejectWithValue }) => {
    try {
      console.log('Submitting request:', requestData);
      
      // Format data that would be sent to the backend in a real implementation
      // This is kept for reference for when the API is implemented
      /* 
      const taskData = {
        title: requestData.title,
        description: requestData.description,
        category: requestData.category,
        location: `${requestData.city}, ${requestData.district}`,
        deadline: new Date().toISOString(),
        requirements: requestData.requirements || '',
        urgency_level: requestData.urgency === 'High' ? 3 : (requestData.urgency === 'Medium' ? 2 : 1),
        volunteer_number: requestData.requiredPeople
      };
      */
      
      // In a real implementation, you would use axios:
      // const response = await axios.post(`${API_BASE_URL}/tasks`, taskData);
      
      // Generate a random ID for the mock request
      const requestId = 'req_' + Math.random().toString(36).substr(2, 9);
      
      // Mock task creation response
      const mockResponse = {
        success: true,
        requestId: requestId,
        message: 'Request created successfully',
        // Add request data for the profile slice to use
        requestData: {
          id: requestId,
          title: requestData.title,
          description: requestData.description,
          category: requestData.category,
          urgency: requestData.urgency,
          location: `${requestData.city}, ${requestData.district}`,
          completed: false,
          distance: '0.5 km away', // Mock value
          timeAgo: 'just now',
          volunteersCount: 0
        }
      };
      
      // If we have uploaded photos, simulate uploading them
      if (requestData.uploadedPhotos && requestData.uploadedPhotos.length > 0) {
        console.log('Uploading photos for task:', mockResponse.requestId);
        console.log('Photos to upload:', requestData.uploadedPhotos.length);
        
        // Get the valid photos with available file references
        const validPhotos = requestData.uploadedPhotos.filter(photo => 
          photo && photo.id && window._photoFiles && window._photoFiles[photo.id]
        );
        
        if (validPhotos.length !== requestData.uploadedPhotos.length) {
          console.warn(`Found ${validPhotos.length} valid photos out of ${requestData.uploadedPhotos.length}`);
        }
        
        // Simulate uploading each photo
        for (const photo of validPhotos) {
          console.log('Would upload photo:', photo.fileMetadata.name, 'File type:', photo.fileMetadata.type);
          
          // In real implementation:
          // const formData = new FormData();
          // formData.append('photo', fileObject);
          // await axios.post(`${API_BASE_URL}/tasks/${mockResponse.requestId}/photos`, formData);
        }
      }
      
      // Create a formatted request object for the profile state
      const newRequest = {
        id: mockResponse.requestId,
        title: requestData.title,
        description: requestData.description,
        category: requestData.category || 'Uncategorized', 
        urgency: requestData.urgency || 'Medium',
        location: `${requestData.city || 'Unknown'}, ${requestData.district || 'Location'}`,
        completed: false,
        distance: '0.5 km away', // Mock value
        timeAgo: 'just now',
        volunteersCount: 0
      };
      
      // Store the new request in localStorage for the profile page to pick up
      localStorage.setItem('pendingNewRequest', JSON.stringify(newRequest));
      localStorage.setItem('refreshProfileData', 'true');
      
      return mockResponse;
    } catch (error) {
      console.error('Error submitting request:', error);
      return rejectWithValue(error.response?.data || 'Error submitting request');
    }
  }
);

// Async thunk for fetching categories
export const fetchCategories = createAsyncThunk(
  'createRequest/fetchCategories',
  async (_arg, { rejectWithValue }) => {
    // Mock categories data - in a real app this would be fetched from an API
    try {
      // Simulate API call
      const mockCategories = [
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
      return mockCategories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return rejectWithValue('Error fetching categories');
    }
  }
);

// Async thunk for uploading photos
export const uploadPhotos = createAsyncThunk(
  'createRequest/uploadPhotos',
  async (photos, { rejectWithValue }) => {
    try {
      // Process photos to create temporary URLs and store file metadata for later upload
      const processedPhotos = [];
      
      // Ensure photos is iterable (convert to array if it's a single item)
      const photosArray = Array.isArray(photos) ? photos : [photos];
      
      // Make sure our global storage exists
      window._photoFiles = window._photoFiles || {};
      
      for (const photo of photosArray) {
        try {
          if (!photo) {
            console.warn("Skipping invalid photo object:", photo);
            continue;
          }
          
          // Create a temporary URL for preview
          const tempUrl = URL.createObjectURL(photo);
          
          // Generate a unique ID for this photo
          const photoId = 'photo_' + Math.random().toString(36).substr(2, 9);
          
          // Save a reference to the file outside of Redux
          window._photoFiles[photoId] = photo;
          
          // Only store serializable data in Redux
          processedPhotos.push({
            id: photoId,
            url: tempUrl, // This is a string, so it's serializable
            fileMetadata: {
              name: photo.name || 'unnamed-photo',
              size: photo.size,
              type: photo.type,
              lastModified: photo.lastModified
            }
          });
        } catch (e) {
          console.error("Error processing photo:", e, photo);
        }
      }
      
      console.log("Processed photos:", processedPhotos.length);
      return processedPhotos;
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
    deadlineDate: serializeDate(new Date()),
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
      // Clean up any uploaded photo references and object URLs
      if (window._photoFiles) {
        // We'll clean up object URLs in the next render cycle to avoid React state issues
        setTimeout(() => {
          Object.keys(window._photoFiles).forEach(id => {
            try {
              delete window._photoFiles[id];
            } catch (e) {
              console.warn('Error cleaning up photo reference:', e);
            }
          });
          window._photoFiles = {};
        }, 0);
      }
      
      // Make sure we use serialized dates when resetting
      return {
        ...initialState,
        formData: {
          ...initialState.formData,
          deadlineDate: serializeDate(new Date())
        },
        uploadedPhotos: [] // Explicitly clear the uploaded photos array
      };
    },
    removePhoto: (state, action) => {
      // Get the photo ID to remove
      const photoId = action.payload;
      
      // First, clean up the file reference from window._photoFiles if it exists
      if (window._photoFiles && window._photoFiles[photoId]) {
        // Release the URL object to prevent memory leaks
        const photo = state.uploadedPhotos.find(p => p.id === photoId);
        if (photo && photo.url) {
          try {
            URL.revokeObjectURL(photo.url);
          } catch (e) {
            console.warn('Error revoking object URL:', e);
          }
        }
        
        // Remove from our global file storage
        delete window._photoFiles[photoId];
      }
      
      // Remove from state
      state.uploadedPhotos = state.uploadedPhotos.filter(
        photo => photo.id !== photoId
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
        
        // Add a new mock request to be displayed in the profile page
        try {
          const newRequestObj = {
            id: action.payload.requestId || `req_${Date.now()}`,
            title: state.formData.title || 'New Request',
            category: state.formData.category || 'Uncategorized',
            urgency: state.formData.urgency || 'Medium',
            distance: '0.5 km away',
            timeAgo: 'just now',
            volunteersCount: 0,
            completed: false // This is an active request
          };
          
          // Store this in localStorage so it can be retrieved by the profile page
          localStorage.setItem('pendingNewRequest', JSON.stringify(newRequestObj));
        } catch (err) {
          console.error('Error saving pending request:', err);
        }
        
        // Clean up photo references after successful submission
        if (window._photoFiles) {
          // Clean up in the next render cycle
          setTimeout(() => {
            Object.keys(window._photoFiles).forEach(id => {
              delete window._photoFiles[id];
            });
          }, 0);
        }
        
        // Clean up object URLs to prevent memory leaks
        state.uploadedPhotos.forEach(photo => {
          if (photo.url) {
            try {
              URL.revokeObjectURL(photo.url);
            } catch (e) {
              console.warn('Error revoking URL:', e);
            }
          }
        });
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
        // Ensure uploadedPhotos is initialized as an array
        state.uploadedPhotos = state.uploadedPhotos || [];
        
        // Check if payload exists and is an array
        if (action.payload) {
          // Normalize the payload to always be an array
          const photoArray = Array.isArray(action.payload) ? action.payload : [action.payload];
          
          // Only add valid photos with an ID
          const validPhotos = photoArray.filter(photo => photo && photo.id);
          
          if (validPhotos.length > 0) {
            state.uploadedPhotos = [...state.uploadedPhotos, ...validPhotos];
          }
        }
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