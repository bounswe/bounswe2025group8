import axios from 'axios';

// Base API URL - using the Docker container service name for the API
const API_URL = import.meta.env.VITE_API_URL;

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Token ${token}` } : {};
};

/**
 * Fetch user profile data
 * @param {string|number} userId - The ID of the user
 * @returns {Promise<Object>} User profile data
 */
export const getUserProfile = async (userId) => {
  try {
    // If 'current' is passed, get the actual userId from localStorage
    if (userId === 'current') {
      userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User not authenticated');
      }
    }
    
    const endpoint = `${API_URL}/users/${userId}/`;
    const response = await axios.get(endpoint, {
      headers: getAuthHeaders()
    });
    
    // Format the response
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Fetch reviews for a user
 * @param {string|number} userId - The ID of the user
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of reviews per page
 * @param {string} sort - Field to sort by ('createdAt' or 'score')
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Promise<Object>} Object containing reviews data and pagination info
 */
export const getUserReviews = async (userId, page = 1, limit = 20, sort = 'createdAt', order = 'desc') => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    const endpoint = `${API_URL}/users/${userId}/reviews/`;
      
    const response = await axios.get(endpoint, {
      headers: getAuthHeaders(),
      params: { page, limit, sort, order }
    });
    
    // The backend returns data in a specific format with reviews and pagination
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    throw error;
  }
};

/**
 * Fetch tasks created by a user
 * @param {string|number} userId - The ID of the user
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of tasks per page
 * @param {string} status - Filter by task status (optional)
 * @returns {Promise<Object>} Object containing tasks data and pagination info
 */
export const getUserCreatedRequests = async (userId, page = 1, limit = 10, status = null) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    const endpoint = `${API_URL}/users/${userId}/tasks/`;
    
    const params = { page, limit };
    if (status) {
      params.status = status;
    }
    
    const response = await axios.get(endpoint, {
      headers: getAuthHeaders(),
      params
    });
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching created tasks:', error);
    throw error;
  }
};

/**
 * Fetch tasks a user has volunteered for
 * @param {string|number} userId - The ID of the user
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of tasks per page
 * @returns {Promise<Object>} Object containing tasks data
 */
export const getUserVolunteeredRequests = async (userId, page = 1, limit = 10) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    // Get volunteers where user is the volunteer
    const response = await axios.get(`${API_URL}/volunteers/`, {
      headers: getAuthHeaders(),
      params: {
        volunteer_id: userId,
        page,
        limit
      }
    });
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching volunteered tasks:', error);
    throw error;
  }
};

/**
 * Fetch badges for a user
 * Note: The backend doesn't seem to have a badges endpoint yet.
 * This is a placeholder for when that functionality is implemented.
 * 
 * @param {string|number} userId - The ID of the user
 * @returns {Promise<Array>} List of badges
 */
export const getUserBadges = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    // Since there's no badges endpoint in the backend yet, return mock data
    console.warn(`Badge API not implemented in backend yet for user ${userId}. Returning mock data.`);
    
    // Mock data to maintain functionality until backend implementation
    return [
      {
        id: 'badge1',
        title: 'First Steps',
        description: 'Completed 5 tasks',
        image: 'https://cdn-icons-png.flaticon.com/128/8382/8382248.png',
        color: '#FF9800',
        earned: true,
        earnedDate: '2025-02-15'
      },
      {
        id: 'badge2',
        title: 'Helpful Hand',
        description: 'Volunteered for 10 tasks',
        image: 'https://cdn-icons-png.flaticon.com/128/2714/2714728.png',
        color: '#4CAF50',
        earned: true,
        earnedDate: '2025-03-01'
      }
    ];
  } catch (error) {
    console.error('Error fetching user badges:', error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {Object} userData - Updated user data
 * @returns {Promise<Object>} Updated user profile
 */
export const updateUserProfile = async (userData) => {
  try {
    const currentUserId = localStorage.getItem('userId');
    if (!currentUserId) {
      throw new Error('User ID not found. Please log in again.');
    }

    // Use PATCH for partial updates
    const response = await axios.patch(`${API_URL}/users/${currentUserId}/`, userData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      }
    });
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    // Check if this is a validation error from the backend
    if (error.response && error.response.status === 400) {
      console.error('Validation error when updating profile:', error.response.data);
    } else {
      console.error('Error updating user profile:', error);
    }
    throw error;
  }
};

/**
 * Upload profile picture
 * Note: The backend doesn't appear to have a dedicated profile picture endpoint yet.
 * This function may need to be updated when that endpoint is implemented.
 * 
 * @param {File} file - The image file to upload
 * @returns {Promise<Object>} Updated user profile with picture URL
 */
export const uploadProfilePicture = async (file) => {
  try {
    // Based on the backend code, there's no specific profile picture endpoint
    // Consider using the photo upload endpoint as an alternative
    console.warn('Profile picture upload endpoint not found in backend. Implementation may need adjustment.');
    
    const currentUserId = localStorage.getItem('userId');
    if (!currentUserId) {
      throw new Error('User ID not found. Please log in again.');
    }
    
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('user_id', currentUserId);
    
    // This is a placeholder. The actual endpoint for photo uploads may need to be used
    const response = await axios.post(`${API_URL}/users/${currentUserId}/photo/`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      }
    });
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
};

/**
 * Change user password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @param {string} confirmPassword - Confirm new password
 * @returns {Promise<Object>} Response message
 */
export const changePassword = async (currentPassword, newPassword, confirmPassword) => {
  try {
    const currentUserId = localStorage.getItem('userId');
    if (!currentUserId) {
      throw new Error('User ID not found. Please log in again.');
    }
    
    const response = await axios.post(`${API_URL}/users/${currentUserId}/change-password/`, {
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmPassword
    }, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      }
    });
    
    if (response.data) {
      return response.data;
    }
    return { status: 'success', message: 'Password changed successfully.' };
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

/**
 * Add a review for a task
 * @param {number} taskId - ID of the task
 * @param {number} revieweeId - ID of the user being reviewed
 * @param {number} score - Rating score (1-5)
 * @param {string} comment - Review comment
 * @returns {Promise<Object>} The created review
 */
export const addReview = async (taskId, revieweeId, score, comment) => {
  try {
    const response = await axios.post(`${API_URL}/reviews/`, {
      task_id: taskId,
      reviewee_id: revieweeId, 
      score,
      comment
    }, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      }
    });
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

/**
 * Update an existing review
 * @param {number} reviewId - ID of the review to update
 * @param {number} score - New rating score (1-5)
 * @param {string} comment - New review comment
 * @returns {Promise<Object>} The updated review
 */
export const updateReview = async (reviewId, score, comment) => {
  try {
    const response = await axios.patch(`${API_URL}/reviews/${reviewId}/`, {
      score,
      comment
    }, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      }
    });
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

/**
 * Delete a review
 * @param {number} reviewId - ID of the review to delete
 * @returns {Promise<Object>} Response message
 */
export const deleteReview = async (reviewId) => {
  try {
    const response = await axios.delete(`${API_URL}/reviews/${reviewId}/`, {
      headers: getAuthHeaders()
    });
    
    return response.data || { status: 'success', message: 'Review deleted successfully.' };
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};
