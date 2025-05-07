import { createSlice } from '@reduxjs/toolkit';

// Initial state with no user logged in
const initialState = {
  isAuthenticated: false,
  user: null,
  role: 'guest', // default role
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login action
    login(state, action) {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.role = action.payload.role;
      state.token = action.payload.token;
    },
    // Logout action
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.role = 'guest';
      state.token = null;
    },
    // Update user profile
    updateUserProfile(state, action) {
      state.user = { ...state.user, ...action.payload };
    },
  },
});

// Export actions
export const { login, logout, updateUserProfile } = authSlice.actions;

// Selectors for easy access to auth state
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectCurrentUser = (state) => state.auth.user;
export const selectUserRole = (state) => state.auth.role;

export default authSlice.reducer;