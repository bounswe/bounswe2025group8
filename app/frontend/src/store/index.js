import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import taskDetailReducer from './slices/taskDetailSlice';
import searchReducer from './slices/searchSlice';
import reviewReducer from './slices/reviewSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    taskDetail: taskDetailReducer,
    search: searchReducer,
    review: reviewReducer,
  },
});