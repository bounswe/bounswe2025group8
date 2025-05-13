import { configureStore } from '@reduxjs/toolkit';
import createRequestReducer from './slices/createRequestSlice';

export const store = configureStore({
  reducer: {
    createRequest: createRequestReducer,
  },
});

export default store;