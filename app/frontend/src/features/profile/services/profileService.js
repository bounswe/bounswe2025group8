import api from '../../../services/api';

/**
 * Fetch user profile data
 */
export const getUserProfile = async (userId) => {
  try {
    if (userId === 'current') {
      userId = localStorage.getItem('userId');
      if (!userId) throw new Error('User not authenticated');
    }
    const res = await api.get(`/users/${userId}/`);
    return (res.data && res.data.data) ? res.data.data : res.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Fetch reviews for a user
 */
export const getUserReviews = async (userId, page = 1, limit = 20, sort = 'createdAt', order = 'desc') => {
  try {
    if (!userId) throw new Error('User ID is required');
    const res = await api.get(`/users/${userId}/reviews/`, {
      params: { page, limit, sort, order },
    });
    return (res.data && res.data.data) ? res.data.data : res.data;
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    throw error;
  }
};

/**
 * Fetch tasks created by a user
 */
export const getUserCreatedRequests = async (userId, page = 1, limit = 10, status = null) => {
  try {
    if (!userId) throw new Error('User ID is required');
    const params = { page, limit };
    if (status) params.status = status;
    const res = await api.get(`/users/${userId}/tasks/`, { params });
    return (res.data && res.data.data) ? res.data.data : res.data;
  } catch (error) {
    console.error('Error fetching created tasks:', error);
    throw error;
  }
};

/**
 * Fetch tasks a user has volunteered for
 */
export const getUserVolunteeredRequests = async (userId, page = 1, limit = 10) => {
  try {
    if (!userId) throw new Error('User ID is required');
    const res = await api.get(`/volunteers/`, {
      params: { volunteer_id: userId, page, limit },
    });
    return (res.data && res.data.data) ? res.data.data : res.data;
  } catch (error) {
    console.error('Error fetching volunteered tasks:', error);
    throw error;
  }
};

/**
 * Fetch badges for a user (mock until backend is ready)
 */
export const getUserBadges = async (userId) => {
  try {
    if (!userId) throw new Error('User ID is required');
    console.warn(`Badge API not implemented in backend yet for user ${userId}. Returning mock data.`);
    return [
      {
        id: 'badge1',
        title: 'First Steps',
        description: 'Completed 5 tasks',
        image: 'https://cdn-icons-png.flaticon.com/128/8382/8382248.png',
        color: '#FF9800',
        earned: true,
        earnedDate: '2025-02-15',
      },
      {
        id: 'badge2',
        title: 'Helpful Hand',
        description: 'Volunteered for 10 tasks',
        image: 'https://cdn-icons-png.flaticon.com/128/2714/2714728.png',
        color: '#4CAF50',
        earned: true,
        earnedDate: '2025-03-01',
      },
    ];
  } catch (error) {
    console.error('Error fetching user badges:', error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userData) => {
  try {
    const currentUserId = localStorage.getItem('userId');
    if (!currentUserId) throw new Error('User ID not found. Please log in again.');
    const res = await api.patch(`/users/${currentUserId}/`, userData);
    return (res.data && res.data.data) ? res.data.data : res.data;
  } catch (error) {
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
 */
export const uploadProfilePicture = async (file) => {
  try {
    console.warn('Profile picture upload endpoint not found in backend. Implementation may need adjustment.');
    const currentUserId = localStorage.getItem('userId');
    if (!currentUserId) throw new Error('User ID not found. Please log in again.');

    const formData = new FormData();
    formData.append('photo', file);
    formData.append('user_id', currentUserId);

    const res = await api.post(`/users/${currentUserId}/photo/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return (res.data && res.data.data) ? res.data.data : res.data;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
};

/**
 * Change user password
 */
export const changePassword = async (currentPassword, newPassword, confirmPassword) => {
  try {
    const currentUserId = localStorage.getItem('userId');
    if (!currentUserId) throw new Error('User ID not found. Please log in again.');
    const res = await api.post(`/users/${currentUserId}/change-password/`, {
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmPassword,
    });
    return res.data || { status: 'success', message: 'Password changed successfully.' };
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

/**
 * Add a review for a task
 */
export const addReview = async (taskId, revieweeId, score, comment) => {
  try {
    const res = await api.post(`/reviews/`, {
      task_id: taskId,
      reviewee_id: revieweeId,
      score,
      comment,
    });
    return (res.data && res.data.data) ? res.data.data : res.data;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

/**
 * Update an existing review
 */
export const updateReview = async (reviewId, score, comment) => {
  try {
    const res = await api.patch(`/reviews/${reviewId}/`, { score, comment });
    return (res.data && res.data.data) ? res.data.data : res.data;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

/**
 * Delete a review
 */
export const deleteReview = async (reviewId) => {
  try {
    const res = await api.delete(`/reviews/${reviewId}/`);
    return res.data || { status: 'success', message: 'Review deleted successfully.' };
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};
