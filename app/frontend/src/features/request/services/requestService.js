import api from '../../../services/api';

/**
 * Get a list of tasks with optional filtering
 *
 * @param {Object} filters - Query parameters for filtering tasks
 * @param {number} page - Page number for pagination
 * @returns {Promise} Promise that resolves to paginated tasks
 */
export const getTasks = async (filters = {}, page = 1) => {
  try {
    const apiFilters = { ...filters };
    
    // Convert from urgency_level to urgency parameter expected by the backend
    // Backend uses 'urgency' parameter to filter tasks with urgency_level >= specified value
    if (apiFilters.urgency_level) {
      apiFilters.urgency = apiFilters.urgency_level;
      delete apiFilters.urgency_level;
    }
    
    // Let the API handle pagination according to its default settings
    const response = await api.get('/tasks/', {
      params: {
        ...apiFilters,
        page
      }
    });
    // The response has a standard DRF pagination format as shown in the sample
    return {
      tasks: response.data.results || [],
      pagination: {
        page: page,
        totalPages: Math.ceil(
          response.data.count / (response.data.results?.length || 10)
        ),
        totalItems: response.data.count || 0,
        hasNextPage: !!response.data.next,
        hasPreviousPage: !!response.data.previous,
      },
    };
  } catch (error) {
    console.error("Error fetching tasks:", error);
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
    const response = await api.get("/tasks/popular/", {
      params: { limit },
    });
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching popular tasks:", error);
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
  getTaskById,
};
