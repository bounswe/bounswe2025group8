import api from "../../../services/api";

/**
 * Submit a new task/request to the backend
 * 
 * @param {Object} taskData - Data for creating a new task
 * @param {string} taskData.title - Task title
 * @param {string} taskData.description - Task description
 * @param {string} taskData.category - Task category code (e.g., GROCERY_SHOPPING, TUTORING)
 * @param {string} taskData.location - Location where the task will take place
 * @param {string} taskData.deadline - Deadline for the task (ISO format date string)
 * @param {string} taskData.requirements - Optional requirements for the task
 * @param {number} taskData.urgency_level - Urgency level (1-5)
 * @param {number} taskData.volunteer_number - Number of volunteers needed
 * @param {boolean} taskData.is_recurring - Whether the task is recurring
 * @returns {Promise<Object>} The created task data
 */
export const createTask = async (taskData) => {
  try {
    const response = await api.post('/tasks/', taskData);
    
    if (response.data && response.data.status === 'success') {
      return response.data.data;
    }
    
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

/**
 * Upload photos for a task
 * 
 * @param {number|string} taskId - ID of the task to upload photos for
 * @param {File[]} photos - Array of photo files to upload
 * @returns {Promise<Object>} Upload result data
 */
export const uploadTaskPhotos = async (taskId, photos) => {
  try {
    // Create a FormData object to send files
    const formData = new FormData();
    
    // Add each photo to the form data
    photos.forEach((photo, index) => {
      formData.append(`photo${index}`, photo);
    });
    
    const response = await api.post(`/tasks/${taskId}/photo/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading task photos:', error);
    throw error;
  }
};

/**
 * Update an existing task
 * 
 * @param {number|string} taskId - ID of the task to update
 * @param {Object} taskData - Updated task data
 * @returns {Promise<Object>} The updated task data
 */
export const updateTask = async (taskId, taskData) => {
  try {
    const response = await api.patch(`/tasks/${taskId}/`, taskData);
    
    if (response.data && response.data.status === 'success') {
      return response.data.data;
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Cancel a task
 * 
 * @param {number|string} taskId - ID of the task to cancel
 * @returns {Promise<Object>} Cancellation result
 */
export const cancelTask = async (taskId) => {
  try {
    const response = await api.delete(`/tasks/${taskId}/`);
    
    return response.data;
  } catch (error) {
    console.error(`Error cancelling task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Mark a task as completed
 * 
 * @param {number|string} taskId - ID of the task to mark as completed
 * @returns {Promise<Object>} Completion result
 */
export const completeTask = async (taskId) => {
  try {
    const response = await api.post(`/tasks/${taskId}/complete/`);
    
    return response.data;
  } catch (error) {
    console.error(`Error completing task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Update task status
 * 
 * @param {number|string} taskId - ID of the task to update status
 * @param {string} status - New status value (e.g., 'ASSIGNED', 'IN_PROGRESS')
 * @returns {Promise<Object>} Status update result
 */
export const updateTaskStatus = async (taskId, status) => {
  try {
    const response = await api.post(`/tasks/${taskId}/update-status/`, {
      status
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error updating task status for ${taskId}:`, error);
    throw error;
  }
};

/**
 * Fetch available task categories
 * 
 * @returns {Promise<Array>} List of categories with name, value and task count
 */
export const fetchCategories = async () => {
  try {
    const response = await api.get('/tasks/categories');
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};



/**
 * Temporary implementation for fetchDistricts to maintain backward compatibility
 * @deprecated Use the new country/state/city API methods instead
 */
export const fetchDistricts = async () => {
  // Dummy implementation to maintain compatibility with existing code
  return [];
};

/**
 * Temporary implementation for fetchNeighborhoods to maintain backward compatibility
 * @deprecated Use the new country/state/city API methods instead
 */
export const fetchNeighborhoods = async () => {
  // Dummy implementation to maintain compatibility with existing code
  return [];
};

/**
 * Temporary implementation for fetchStreets to maintain backward compatibility
 * @deprecated Use the new country/state/city API methods instead
 */
export const fetchStreets = async () => {
  // Dummy implementation to maintain compatibility with existing code
  return [];
};

export default {
  createTask,
  uploadTaskPhotos,
  updateTask,
  cancelTask,
  completeTask,
  updateTaskStatus,
  fetchCategories,
  fetchDistricts,
  fetchNeighborhoods,
  fetchStreets
};
