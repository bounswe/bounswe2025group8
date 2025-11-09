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
 * Get all potential users that could be reviewed for a task (without filtering by existing reviews)
 * @param {Object} task - Task object
 * @param {Object} currentUser - Current user object
 * @returns {Array} Array of users that could potentially be reviewed
 */
export const getAllPotentialReviewees = (task, currentUser) => {
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

/**
 * Check if current user can review participants of a task (synchronous version for quick checks)
 * @param {Object} task - Task object
 * @param {Object} currentUser - Current user object
 * @returns {Array} Array of users that could potentially be reviewed (without filtering by existing reviews)
 */
export const getReviewableUsers = (task, currentUser) => {
  // Return all potential reviewees without checking existing reviews
  // This is used for quick permission checks in UI
  return getAllPotentialReviewees(task, currentUser);
};

/**
 * Check if current user can review participants of a task (async version with review filtering)
 * @param {Object} task - Task object
 * @param {Object} currentUser - Current user object
 * @param {Array} existingReviews - Optional array of existing reviews to filter out already reviewed users
 * @returns {Promise<Array>} Array of users that can be reviewed (excludes already reviewed users)
 */
export const getReviewableUsersAsync = async (task, currentUser, existingReviews = null) => {
  // Get all potential reviewees first
  const allPotentialReviewees = getAllPotentialReviewees(task, currentUser);
  
  if (allPotentialReviewees.length === 0) {
    return [];
  }

  // If no existing reviews provided, fetch them
  if (existingReviews === null) {
    try {
      const reviewsResponse = await getTaskReviews(task.id);
      existingReviews = reviewsResponse.data?.reviews || reviewsResponse.reviews || [];
    } catch (error) {
      console.warn('Could not fetch existing reviews, proceeding with all potential reviewees:', error);
      return allPotentialReviewees;
    }
  }

  // Filter out users who have already been reviewed by the current user
  const reviewableUsers = allPotentialReviewees.filter(user => {
    const hasExistingReview = existingReviews.some(review => {
      const reviewerId = review.reviewer?.id || review.reviewer_id;
      const revieweeId = review.reviewee?.id || review.reviewee_id;
      return reviewerId === currentUser.id && revieweeId === user.id;
    });
    
    console.log(`User ${user.name} ${user.surname} (ID: ${user.id}) - Already reviewed: ${hasExistingReview}`);
    return !hasExistingReview;
  });

  console.log('getReviewableUsersAsync debug:', {
    currentUserId: currentUser.id,
    taskStatus: task.status,
    allPotentialReviewees: allPotentialReviewees.length,
    existingReviews: existingReviews.length,
    reviewableUsers: reviewableUsers.length,
    reviewableUsersList: reviewableUsers
  });

  return reviewableUsers;
};

/**
 * Get all reviewees for a task with their review status
 * @param {Object} task - Task object
 * @param {Object} currentUser - Current user object
 * @returns {Promise<Array>} Array of users with their review status (reviewed: true/false)
 */
export const getAllRevieweesWithStatus = async (task, currentUser) => {
  // Get all potential reviewees
  const allPotentialReviewees = getAllPotentialReviewees(task, currentUser);
  
  if (allPotentialReviewees.length === 0) {
    return [];
  }

  // Fetch existing reviews to check status
  let existingReviews = [];
  try {
    const reviewsResponse = await getTaskReviews(task.id);
    existingReviews = reviewsResponse.data?.reviews || reviewsResponse.reviews || [];
  } catch (error) {
    console.warn('Could not fetch existing reviews:', error);
  }

  // Add review status to each user
  const usersWithStatus = allPotentialReviewees.map(user => {
    const hasExistingReview = existingReviews.some(review => {
      const reviewerId = review.reviewer?.id || review.reviewer_id;
      const revieweeId = review.reviewee?.id || review.reviewee_id;
      return reviewerId === currentUser.id && revieweeId === user.id;
    });
    
    return {
      ...user,
      reviewed: hasExistingReview
    };
  });

  console.log('getAllRevieweesWithStatus debug:', {
    currentUserId: currentUser.id,
    totalUsers: usersWithStatus.length,
    reviewedCount: usersWithStatus.filter(u => u.reviewed).length,
    unreviewed: usersWithStatus.filter(u => !u.reviewed).length,
    usersWithStatus
  });

  return usersWithStatus;
};

export default {
  submitReview,
  getTaskReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  getReviewableUsers,
  getReviewableUsersAsync,
  getAllPotentialReviewees,
  getAllRevieweesWithStatus,
};