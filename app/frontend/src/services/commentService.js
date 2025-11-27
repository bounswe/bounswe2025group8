import api from './api';

/**
 * Get comments for a specific task
 * 
 * @param {number} taskId - The task ID
 * @param {Object} params - Query parameters (page, limit)
 * @returns {Promise} Promise that resolves to comments data
 */
export const getTaskComments = async (taskId, params = {}) => {
  try {
    const response = await api.get(`/tasks/${taskId}/comments/`, {
      params: {
        page: params.page || 1,
        limit: params.limit || 20,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching task comments:', error);
    throw error;
  }
};

/**
 * Create a new comment on a task
 * 
 * @param {number} taskId - The task ID
 * @param {string} content - The comment content
 * @returns {Promise} Promise that resolves to the created comment
 */
export const createComment = async (taskId, content) => {
  try {
    const response = await api.post('/comments/', {
      task_id: taskId,
      content: content
    });
    return response.data;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
};

/**
 * Update a comment
 * 
 * @param {number} commentId - The comment ID
 * @param {string} content - The updated comment content
 * @returns {Promise} Promise that resolves to the updated comment
 */
export const updateComment = async (commentId, content) => {
  try {
    const response = await api.patch(`/comments/${commentId}/`, {
      content: content
    });
    return response.data;
  } catch (error) {
    console.error('Error updating comment:', error);
    throw error;
  }
};

/**
 * Delete a comment
 * 
 * @param {number} commentId - The comment ID
 * @returns {Promise} Promise that resolves when comment is deleted
 */
export const deleteComment = async (commentId) => {
  try {
    const response = await api.delete(`/comments/${commentId}/`);
    return response.data;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};
