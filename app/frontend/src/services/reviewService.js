import api from './api';

/**
 * Review Service
 * Handles all review-related API calls
 */

/**
 * Submit a review for a task
 * @param {number} taskId - ID of the task
 * @param {number} revieweeId - ID of the user being reviewed
 * @param {number} score - Rating score (1-5)
 * @param {string} comment - Review comment
 * @returns {Promise} API response
 */
export const submitReview = async (taskId, revieweeId, score, comment) => {
  try {
    const response = await api.post(`/tasks/${taskId}/reviews/`, {
      reviewee_id: revieweeId,
      score,
      comment,
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
};

/**
 * Get reviews for a specific task
 * @param {number} taskId - ID of the task
 * @param {Object} params - Query parameters (page, limit, etc.)
 * @returns {Promise} API response with reviews
 */
export const getTaskReviews = async (taskId, params = {}) => {
  try {
    const response = await api.get(`/tasks/${taskId}/reviews/`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching task reviews:', error);
    throw error;
  }
};

/**
 * Get reviews for a specific user
 * @param {number} userId - ID of the user
 * @param {Object} params - Query parameters (page, limit, sort, order)
 * @returns {Promise} API response with reviews
 */
export const getUserReviews = async (userId, params = {}) => {
  try {
    const response = await api.get(`/users/${userId}/reviews/`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    throw error;
  }
};

/**
 * Update an existing review
 * @param {number} reviewId - ID of the review
 * @param {number} score - Updated rating score (1-5)
 * @param {string} comment - Updated review comment
 * @returns {Promise} API response
 */
export const updateReview = async (reviewId, score, comment) => {
  try {
    const response = await api.patch(`/reviews/${reviewId}/`, {
      score,
      comment,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

/**
 * Delete a review
 * @param {number} reviewId - ID of the review
 * @returns {Promise} API response
 */
export const deleteReview = async (reviewId) => {
  try {
    const response = await api.delete(`/reviews/${reviewId}/`);
    return response.data;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

/**
 * Check if current user can review participants of a task
 * @param {Object} task - Task object
 * @param {Object} currentUser - Current user object
 * @returns {Array} Array of users that can be reviewed
 */
export const getReviewableUsers = (task, currentUser) => {
  if (!task || !currentUser || task.status !== 'COMPLETED') {
    return [];
  }

  const reviewableUsers = [];
  
  // If current user is the task creator, they can review volunteers
  if (task.creator && task.creator.id === currentUser.id) {
    if (task.volunteers && task.volunteers.length > 0) {
      // Add accepted volunteers to reviewable list
      const acceptedVolunteers = task.volunteers.filter(v => v.status === 'ACCEPTED');
      reviewableUsers.push(...acceptedVolunteers.map(v => ({
        id: v.user?.id || v.id,
        name: v.user?.name || v.name,
        surname: v.user?.surname || v.surname,
        role: 'volunteer'
      })));
    }
    
    // Also check if there are assignees (for tasks with direct assignment)
    if (task.assignees && task.assignees.length > 0) {
      reviewableUsers.push(...task.assignees.map(assignee => ({
        id: assignee.id,
        name: assignee.name,
        surname: assignee.surname,
        role: 'volunteer'
      })));
    }
  }
  
  // If current user is a volunteer, they can review the requester
  let isVolunteer = false;
  
  // Check if user is in volunteers array
  if (task.volunteers && task.volunteers.length > 0) {
    isVolunteer = task.volunteers.some(v => {
      const volunteerId = v.user?.id || v.volunteer?.id || v.id;
      const volunteerStatus = v.status;
      return volunteerId === currentUser.id && 
             (volunteerStatus === 'ACCEPTED' || task.status === 'COMPLETED');
    });
  }
  
  // Check if user is in assignees array
  if (!isVolunteer && task.assignees && task.assignees.length > 0) {
    isVolunteer = task.assignees.some(a => a.id === currentUser.id);
  }
  
  // Check if user is the single assignee (backward compatibility)
  if (!isVolunteer && task.assignee && task.assignee.id === currentUser.id) {
    isVolunteer = true;
  }
  
  console.log('getReviewableUsers debug:', {
    currentUserId: currentUser.id,
    taskStatus: task.status,
    isVolunteer,
    volunteers: task.volunteers,
    assignees: task.assignees,
    assignee: task.assignee,
    creator: task.creator
  });
  
  if (isVolunteer && task.creator) {
    reviewableUsers.push({
      id: task.creator.id,
      name: task.creator.name,
      surname: task.creator.surname,
      role: 'requester'
    });
  }

  // Remove duplicates based on user ID
  const uniqueUsers = reviewableUsers.filter((user, index, self) => 
    index === self.findIndex(u => u.id === user.id)
  );

  return uniqueUsers;
};

export default {
  submitReview,
  getTaskReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  getReviewableUsers,
};