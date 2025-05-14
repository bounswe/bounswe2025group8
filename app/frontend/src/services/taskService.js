import api from './api';

/**
 * Get a list of tasks with optional filtering
 * 
 * @param {Object} filters - Query parameters for filtering tasks
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of items per page
 * @returns {Promise} Promise that resolves to paginated tasks
 */
export const getTasks = async (filters = {}, page = 1, limit = 20) => {
  try {
    const response = await api.get('/tasks/', {
      params: {
        ...filters,
        page,
        limit
      }
    });
    return response.data.data || { tasks: [], pagination: {} };
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

/**
 * Get popular tasks
 * 
 * @param {number} limit - Maximum number of tasks to return
 * @returns {Promise} Promise that resolves to an array of popular tasks
 */
export const getPopularTasks = async (limit = 6) => {
  try {
    const response = await api.get('/tasks/popular/', {
      params: { limit }
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching popular tasks:', error);
    throw error;
  }
};

/**
 * Get a single task by ID
 * 
 * @param {string|number} taskId - ID of the task to retrieve
 * @returns {Promise} Promise that resolves to a task object
 */
export const getTaskById = async (taskId) => {
  try {
    const response = await api.get(`/tasks/${taskId}/`);
    return response.data.data || {};
  } catch (error) {
    console.error(`Error fetching task ${taskId}:`, error);
    throw error;
  }
};

export default {
  getTasks,
  getPopularTasks,
  getTaskById
};
