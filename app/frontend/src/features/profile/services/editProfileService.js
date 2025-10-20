import api from '../../../services/api';
import { authStorage } from '../../authentication/utils';

/**
 * Update user profile details
 * This service handles updating name, surname, username, email, phone, and other profile fields
 */
export const updateUserProfile = async (profileData) => {
  try {
    // Debug: Check authentication state
    console.log('Auth Debug - isAuthenticated:', authStorage.isAuthenticated());
    console.log('Auth Debug - token:', authStorage.getToken());
    console.log('Auth Debug - user:', authStorage.getUser());
    
    // Check if user is authenticated
    if (!authStorage.isAuthenticated()) {
      throw new Error('User is not authenticated. Please log in again.');
    }

    // Get current user data
    const currentUser = authStorage.getUser();
    if (!currentUser || !currentUser.id) {
      throw new Error('User ID not found. Please log in again.');
    }
    
    const currentUserId = currentUser.id;
    
    console.log('Updating profile for user ID:', currentUserId);
    console.log('Profile data to update:', profileData);
    
    // Check for any legacy localStorage data that might cause conflicts
    console.log('Legacy localStorage check:');
    console.log('- userId:', localStorage.getItem('userId'));
    console.log('- user:', localStorage.getItem('user'));
    console.log('- token:', localStorage.getItem('token'));

    // Map frontend field names to backend field names based on API documentation
    const backendData = {};
    
    // Use the exact field names as expected by the backend
    if (profileData.name !== undefined) {
      backendData.name = profileData.name;
    }
    if (profileData.surname !== undefined) {
      backendData.surname = profileData.surname;
    }
    if (profileData.username !== undefined) {
      backendData.username = profileData.username;
    }
    
    // Note: Email and phone are now read-only fields and excluded from updates

    // Make API call to update user profile
    const apiUrl = `/users/${currentUserId}/`;
    console.log('Making PATCH request to:', apiUrl);
    console.log('Original frontend data:', JSON.stringify(profileData, null, 2));
    console.log('Mapped backend data:', JSON.stringify(backendData, null, 2));
    
    const response = await api.patch(apiUrl, backendData);
    
    console.log('Backend response status:', response.status);
    console.log('Backend response data:', JSON.stringify(response.data, null, 2));
    
    // Check if the response indicates success
    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`Server responded with status ${response.status}`);
    }
    
    // Extract the updated user data from response - handle different response formats
    let updatedUser;
    if (response.data && response.data.status === 'success') {
      // API follows the standard format from auth documentation
      updatedUser = response.data.data || response.data;
    } else if (response.data && typeof response.data === 'object') {
      // Direct user object response
      updatedUser = response.data;
    } else {
      throw new Error('Invalid response format from server');
    }
    
    // Update localStorage with the new user data using authStorage
    const existingUser = authStorage.getUser();
    if (existingUser) {
      const updatedUserObj = { ...existingUser, ...updatedUser };
      console.log('Updating localStorage with:', JSON.stringify(updatedUserObj, null, 2));
      authStorage.updateUser(updatedUserObj);
    }
    
    // Immediately update localStorage with the response data
    console.log('Immediately updating localStorage with response data...');
    
    // Wait a moment and then re-fetch to ensure we have the latest data
    console.log('Waiting 1 second before re-fetching user profile...');
    setTimeout(async () => {
      try {
        const freshResponse = await api.get(apiUrl);
        let freshData = freshResponse.data?.data || freshResponse.data;
        
        // Map backend field names to frontend field names
        if (freshData.phone_number && !freshData.phone) {
          freshData.phone = freshData.phone_number;
        }
        
        console.log('Fresh data after update:', JSON.stringify(freshData, null, 2));
        
        // Update localStorage again with fresh data
        if (freshData) {
          const currentUser = authStorage.getUser();
          if (currentUser) {
            const refreshedUserObj = { ...currentUser, ...freshData };
            authStorage.updateUser(refreshedUserObj);
            console.log('Updated localStorage with fresh data:', JSON.stringify(refreshedUserObj, null, 2));
          }
        }
      } catch (err) {
        console.error('Error fetching fresh profile data:', err);
      }
    }, 1000);
    
    return updatedUser;
  } catch (error) {
    console.error('Error updating user profile:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error message:', error.message);
    throw error;
  }
};

/**
 * Get current user profile details
 */
export const getCurrentUserProfile = async () => {
  try {
    // Check if user is authenticated
    if (!authStorage.isAuthenticated()) {
      throw new Error('User is not authenticated. Please log in again.');
    }

    // Get current user data
    const currentUser = authStorage.getUser();
    if (!currentUser || !currentUser.id) {
      throw new Error('User ID not found. Please log in again.');
    }
    
    const currentUserId = currentUser.id;

    const response = await api.get(`/users/${currentUserId}/`);
    let userData = response.data?.data || response.data;
    
    // Map backend field names to frontend field names
    if (userData.phone_number && !userData.phone) {
      userData.phone = userData.phone_number;
    }
    
    // Update localStorage with fresh data using authStorage
    authStorage.updateUser(userData);
    
    return userData;
  } catch (error) {
    console.error('Error fetching current user profile:', error);
    throw error;
  }
};

/**
 * Upload profile picture
 */
export const uploadProfilePicture = async (file) => {
  try {
    // Check if user is authenticated
    if (!authStorage.isAuthenticated()) {
      throw new Error('User is not authenticated. Please log in again.');
    }

    // Get current user data
    const currentUser = authStorage.getUser();
    if (!currentUser || !currentUser.id) {
      throw new Error('User ID not found. Please log in again.');
    }
    
    const currentUserId = currentUser.id;

    const formData = new FormData();
    formData.append('photo', file);

    const response = await api.post(`/users/${currentUserId}/photo/`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data' 
      },
    });
    
    const updatedUser = response.data?.data || response.data;
    
    // Update localStorage with the new profile picture using authStorage
    const existingUserData = authStorage.getUser();
    if (existingUserData) {
      const updatedUserObj = { ...existingUserData, ...updatedUser };
      authStorage.updateUser(updatedUserObj);
    }
    
    return updatedUser;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
};

/**
 * Validate profile data before updating
 */
export const validateProfileData = (profileData) => {
  const errors = {};

  // Name validation
  if (profileData.name && profileData.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long';
  }

  // Surname validation
  if (profileData.surname && profileData.surname.trim().length < 2) {
    errors.surname = 'Surname must be at least 2 characters long';
  }

  // Username validation
  if (profileData.username && profileData.username.trim().length < 3) {
    errors.username = 'Username must be at least 3 characters long';
  }

  // Note: Email and phone validation removed as they are now read-only fields

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default {
  updateUserProfile,
  getCurrentUserProfile,
  uploadProfilePicture,
  validateProfileData
};
