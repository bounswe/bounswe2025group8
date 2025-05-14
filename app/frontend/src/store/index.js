import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import createRequestReducer from './slices/createRequestSlice.js';
import ProfileReducer from './slices/profileSlice.js';
import categoryReducer from './slices/categorySlice.js';
import requestReducer from './slices/requestSlice.js';

// Check for stored auth data
const getPreloadedState = () => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      // In a real app, you'd decode the token or make an API call
      // For dev purposes, we'll just check if it contains role info
      const role = token.includes('admin') ? 'admin' : 'user';
      
      // Example user data based on token
      let userData = {
        id: `mock-${role}-id`,
        name: role === 'admin' ? 'Admin User' : 'Regular User',
        email: `${role}@example.com`,
        avatar: role === 'admin' ? 'https://randomuser.me/api/portraits/women/65.jpg' : null
      };
      
      return {
        auth: {
          isAuthenticated: true,
          token,
          role,
          user: userData
        }
      };
    }
  } catch (e) {
    console.error('Error loading auth state:', e);
  }
  return {}; // Return empty state if no token found
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    createRequest: createRequestReducer,
    profile: ProfileReducer,
    categories: categoryReducer,
    requests: requestReducer,
  },
  preloadedState: getPreloadedState(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types (if needed)
        ignoredActions: [],
        // Ignore these field paths in the state (if needed)
        ignoredPaths: [],
      },
    }),
});