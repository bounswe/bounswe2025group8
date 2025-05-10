import { configureStore } from '@reduxjs/toolkit';
import profileReducer from './slices/profileSlice';

export const store = configureStore({
  reducer: {
    profile: profileReducer,
    // Add other reducers as needed
  },
});

export default store;