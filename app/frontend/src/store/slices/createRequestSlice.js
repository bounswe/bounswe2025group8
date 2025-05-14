import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { taskAPI } from '../../utils/api';
import { serializeDate, deserializeDate } from '../../utils/dateUtils';

// Helper function to translate urgency text to numeric level
function translateUrgencyToLevel(urgency) {
  switch (urgency) {
    case 'Low': return 1;
    case 'Medium': return 2;
    case 'High': return 3;
    case 'Urgent': return 4;
    default: return 1;
  }
}

// Async thunk for submitting a request
export const submitRequest = createAsyncThunk(
  'createRequest/submitRequest',
  async (requestData, { rejectWithValue }) => {
    try {
      console.log('Submitting request:', requestData);
      
      // Format data for the backend
      // Parse the deadline date and time properly
      let deadlineDate;
      try {
        // First try to parse the date parts
        const dateObj = deserializeDate(requestData.deadlineDate);
        
        // Parse the time string (format: "09:00 AM")
        const timeMatch = requestData.deadlineTime.match(/(\d+):(\d+)\s?(AM|PM)/i);
        if (!timeMatch) {
          throw new Error(`Invalid time format: ${requestData.deadlineTime}`);
        }
        
        let hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        const isPM = timeMatch[3].toUpperCase() === 'PM';
        
        // Convert 12-hour format to 24-hour format
        if (isPM && hours < 12) hours += 12;
        if (!isPM && hours === 12) hours = 0;
        
        // Set the hours and minutes on the date object
        dateObj.setHours(hours, minutes, 0, 0);
        deadlineDate = dateObj.toISOString();
        
        console.log('Parsed deadline date:', dateObj, 'ISO:', deadlineDate);
      } catch (error) {
        console.error('Error parsing deadline date:', error, 
          'Date:', requestData.deadlineDate, 
          'Time:', requestData.deadlineTime);
        throw new Error(`Invalid deadline date or time: ${error.message}`);
      }
      
      const taskData = {
        title: requestData.title,
        description: requestData.description,
        category: requestData.category, // Using the category directly since it's already properly formatted
        location: `${requestData.city}, ${requestData.district}, ${requestData.neighborhood}, ${requestData.street}, No: ${requestData.buildingNo}, Door: ${requestData.doorNo}, ${requestData.addressDescription}`,
        deadline: deadlineDate,
        requirements: requestData.requirements || '',
        urgency_level: translateUrgencyToLevel(requestData.urgency),
        volunteer_number: requestData.requiredPeople,
        is_recurring: false // Assuming this is not implemented yet
      };
      
      // Create the task first
      const response = await taskAPI.createTask(taskData);
      console.log('Task creation response:', response);
      
      // The backend returns a response with this structure:
      // { status: 'success', message: 'Task created successfully.', data: { id: 1, ... } }
      if (!response || !response.data) {
        throw new Error('Invalid response format from server');
      }
      
      // Extract task ID from the data property in the response
      const taskId = response.data.id;
      
      if (!taskId) {
        console.error('Could not extract task ID from response:', response);
        throw new Error('Task created but ID not found in response');
      }
      
      // If we have uploaded photos, upload them to the server
      if (requestData.uploadedPhotos && requestData.uploadedPhotos.length > 0) {
        console.log('Uploading photos for task:', taskId);
        console.log('Photos to upload:', requestData.uploadedPhotos.length);
        
        // Get the valid photos with available file references
        const validPhotos = requestData.uploadedPhotos.filter(photo => 
          photo && photo.id && window._photoFiles && window._photoFiles[photo.id]
        );
        
        if (validPhotos.length !== requestData.uploadedPhotos.length) {
          console.warn(`Found ${validPhotos.length} valid photos out of ${requestData.uploadedPhotos.length}`);
        }
        
        const photoUploadPromises = validPhotos.map(photo => {
          // Get the actual File object from our reference storage
          const fileObject = window._photoFiles[photo.id];
          console.log('Uploading photo:', photo.fileMetadata.name, 'File type:', photo.fileMetadata.type);
          // Send the file object to the API
          return taskAPI.uploadTaskPhoto(taskId, fileObject);
        });
        
        try {
          // Wait for all photo uploads to complete
          const photoResults = await Promise.allSettled(photoUploadPromises);
          
          // Log results
          const successCount = photoResults.filter(result => result.status === 'fulfilled').length;
          const failedCount = photoResults.filter(result => result.status === 'rejected').length;
          console.log(`Photo upload results: ${successCount} successful, ${failedCount} failed`);
          
          // Log detailed errors for failed uploads
          photoResults.forEach((result, index) => {
            if (result.status === 'rejected') {
              console.error(`Error uploading photo #${index}:`, result.reason);
            }
          });
        } catch (photoError) {
          console.error('Error during photo upload batch process:', photoError);
          // Continue with the task creation even if photo upload fails
        }
      }
      
      // Return a properly formatted response with the task data
      return {
        taskId: taskId,
        taskData: response.data,
        message: response.message || 'Request created successfully'
      };
    } catch (error) {
      console.error('Error submitting request:', error);
      return rejectWithValue(
        error.message || error.response?.data?.message || 'Error submitting request'
      );
    }
  }
);

// Async thunk for fetching categories
export const fetchCategories = createAsyncThunk(
  'createRequest/fetchCategories',
  async () => {
    // Return a predefined list of categories that match the backend's TaskCategory enum
    return [
      { id: 'GROCERY_SHOPPING', name: 'Grocery Shopping' },
      { id: 'TUTORING', name: 'Tutoring' },
      { id: 'HOME_REPAIR', name: 'Home Repair' },
      { id: 'MOVING_HELP', name: 'Moving Help' },
      { id: 'HOUSE_CLEANING', name: 'House Cleaning' },
      { id: 'OTHER', name: 'Other' }
    ];
  }
);

// Async thunk for uploading photos
export const uploadPhotos = createAsyncThunk(
  'createRequest/uploadPhotos',
  async (photos) => {
    // Process photos to create temporary URLs and store file metadata for later upload
    const processedPhotos = [];
    
    // Ensure photos is iterable (convert to array if it's a single item)
    const photosArray = Array.isArray(photos) ? photos : [photos];
    
    for (const photo of photosArray) {
      try {
        if (!photo) {
          console.warn("Skipping invalid photo object:", photo);
          continue;
        }
        
        // Create a temporary URL for preview
        const tempUrl = URL.createObjectURL(photo);
        
        // Store the file in a non-serializable ref that we can access later
        // We'll store a reference with file metadata instead of the actual file
        const photoId = 'photo_' + Math.random().toString(36).substr(2, 9);
        
        // Save a reference to the file outside of Redux
        window._photoFiles = window._photoFiles || {};
        window._photoFiles[photoId] = photo;
        
        // Only store serializable data in Redux
        processedPhotos.push({
          id: photoId,
          url: tempUrl,
          // Store metadata instead of the file object
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
  }
);

// Initial state of the form
const initialState = {
  currentStep: 0,
  formData: {
    // General Information step
    title: '',
    description: '',
    category: 'OTHER',
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
          Object.values(window._photoFiles).forEach(photo => {
            try {
              delete window._photoFiles[photo.id];
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
        state.error = null;
      })
      .addCase(submitRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload;
        state.error = null;
        
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
        state.error = action.payload || 'An unknown error occurred';
      })
      
      // Fetch categories cases
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
        state.error = null;
      })
      
      // Upload photos cases
      .addCase(uploadPhotos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadPhotos.fulfilled, (state, action) => {
        state.loading = false;
        // Check if payload is an array
        if (action.payload && Array.isArray(action.payload)) {
          state.uploadedPhotos = [...state.uploadedPhotos, ...action.payload];
        } 
        // If payload is a single object
        else if (action.payload) {
          state.uploadedPhotos = [...state.uploadedPhotos, action.payload];
        }
        state.error = null;
      });
  }
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