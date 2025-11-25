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
    // Backend uses 'urgency' parameter to filter tasks with exact urgency_level match
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
    console.log("getPopularTasks called with limit:", limit);
    const response = await api.get("/tasks/popular/", {
      params: { limit },
    });
    console.log("getPopularTasks API response:", response.data);
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching popular tasks:", error);
    console.error("Error details:", error.response?.data);
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
    console.log(`Fetching task with ID: ${taskId}`);
    const response = await api.get(`/tasks/${taskId}/`);
    console.log('Task API response:', response.data);
    
    // Handle different response formats
    // Some endpoints use format_response (with data wrapper), others return data directly
    let taskData;
    if (response.data.data) {
      // Response uses format_response wrapper
      taskData = response.data.data;
    } else {
      // Response returns data directly
      taskData = response.data;
    }
    
    console.log('Task data status from API:', taskData?.status);
    
    // Fetch photos for the task
    try {
      console.log(`Fetching photos for task ${taskId}`);
      const photosResponse = await api.get(`/tasks/${taskId}/photo/`);
      console.log('Photos API response:', photosResponse.data);
      
      // Handle photos response format
      if (photosResponse.data.data?.photos) {
        taskData.photos = photosResponse.data.data.photos;
      } else if (photosResponse.data.photos) {
        taskData.photos = photosResponse.data.photos;
      } else {
        taskData.photos = [];
      }
    } catch (photoError) {
      console.warn(`No photos found for task ${taskId}:`, photoError);
      taskData.photos = [];
    }
    
    console.log('Final task data:', taskData);
    return taskData;
  } catch (error) {
    console.error(`Error fetching task ${taskId}:`, error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

/**
 * Mock data for development - matches backend API structure
 */
export const getMockTaskById = (taskId) => {
  const mockTasks = {
    '1': {
      id: 1,
      title: "I need to clean my house",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      category: "HOUSE_CLEANING",
      category_display: "House Cleaning",
      location: "848 King Street, Denver, CO 80204",
      deadline: "2025-05-16T16:30:00Z",
      requirements: "Need someone with cleaning experience",
      urgency_level: 1,
      volunteer_number: 1,
      status: "POSTED",
      status_display: "Posted",
      is_recurring: false,
      created_at: "2025-01-15T13:30:00Z",
      updated_at: "2025-01-15T13:30:00Z",
      creator: {
        id: 2,
        name: "Ashley",
        surname: "Robinson",
        username: "ashley_robinson",
        email: "ashley.robinson@email.com",
        phone_number: "+1 121 542 593",
        location: "Denver, CO",
        rating: 4.8,
        completed_task_count: 12,
        is_active: true
      },
      assignee: null,
      photos: [
        {
          id: 1,
          image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop",
          uploaded_at: "2025-01-15T13:30:00Z"
        }
      ]
    }
  };
  
  return mockTasks[taskId] || null;
};

/**
 * Get volunteers for a specific task
 *
 * @param {string|number} taskId - ID of the task
 * @returns {Promise} Promise that resolves to volunteers array
 */
export const getTaskVolunteers = async (taskId) => {
  try {
    console.log(`Fetching volunteers for task ${taskId}`);
    const response = await api.get(`/tasks/${taskId}/volunteers/`);
    console.log('Volunteers API response:', response.data);
    
    // Handle different response formats
    let volunteers;
    if (response.data.data?.volunteers) {
      volunteers = response.data.data.volunteers;
    } else if (response.data.volunteers) {
      volunteers = response.data.volunteers;
    } else if (Array.isArray(response.data.data)) {
      volunteers = response.data.data;
    } else if (Array.isArray(response.data)) {
      volunteers = response.data;
    } else {
      volunteers = [];
    }
    
    console.log('Final volunteers data:', volunteers);
    return volunteers;
  } catch (error) {
    console.error(`Error fetching volunteers for task ${taskId}:`, error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

/**
 * Volunteer for a task
 *
 * @param {string|number} taskId - ID of the task to volunteer for
 * @returns {Promise} Promise that resolves to volunteer result
 */
export const volunteerForTask = async (taskId) => {
  try {
    console.log(`Volunteering for task ${taskId}`);
    const response = await api.post(`/volunteers/`, {
      task_id: taskId
    });
    console.log('Volunteer API response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error volunteering for task ${taskId}:`, error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

/**
 * Check if current user has volunteered for a task
 * Uses a simple approach: try to get all volunteers and filter by task
 *
 * @param {string|number} taskId - ID of the task
 * @returns {Promise} Promise that resolves to volunteer record or null
 */
export const checkUserVolunteerStatus = async (taskId) => {
  try {
    console.log(`Checking volunteer status for task ${taskId}`);
    
    // Get all volunteers for the current user (including all statuses)
    // Add volunteer_status=all to get all volunteer records, not just ACCEPTED ones
    const response = await api.get(`/volunteers/?volunteer_status=all`);
    console.log('All volunteers API response:', response.data);
    
    // Handle different response formats
    let volunteers;
    if (response.data.data?.volunteers) {
      volunteers = response.data.data.volunteers;
    } else if (response.data.volunteers) {
      volunteers = response.data.volunteers;
    } else if (Array.isArray(response.data.data)) {
      volunteers = response.data.data;
    } else if (Array.isArray(response.data)) {
      volunteers = response.data;
    } else {
      volunteers = [];
    }
    
    console.log('All volunteers:', volunteers);

    // Filter by task ID to find if user has volunteered for this specific task
    // Exclude WITHDRAWN status as those should not count as current volunteering
    const volunteerRecord = volunteers.find(volunteer => {
      // Check both possible field names for task ID
      const volunteerTaskId = volunteer.task?.id || volunteer.task_id || volunteer.task;
      const isMatchingTask = volunteerTaskId === parseInt(taskId);
      const isActiveVolunteer = volunteer.status !== 'WITHDRAWN';
      
      console.log('Comparing task IDs:', volunteerTaskId, 'with', taskId, 'Status:', volunteer.status, 'Match:', isMatchingTask, 'Active:', isActiveVolunteer);
      return isMatchingTask && isActiveVolunteer;
    });

    console.log('Found volunteer record for task:', volunteerRecord);
    return volunteerRecord || null;
    
  } catch (error) {
    console.error(`Error checking volunteer status for task ${taskId}:`, error);
    console.error('Error response:', error.response?.data);
    // Return null if there's an error (user hasn't volunteered)
    return null;
  }
};

/**
 * Withdraw from volunteering for a task
 *
 * @param {string|number} volunteerId - ID of the volunteer record
 * @returns {Promise} Promise that resolves to withdrawal result
 */
export const withdrawFromTask = async (volunteerId) => {
  try {
    console.log(`Withdrawing from volunteer record ${volunteerId}`);
    const response = await api.delete(`/volunteers/${volunteerId}/`);
    console.log('Withdraw API response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error withdrawing from task:`, error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

/**
 * Assign volunteers to a task
 *
 * @param {string|number} taskId - ID of the task
 * @param {Array} volunteerIds - Array of volunteer IDs to assign
 * @returns {Promise} Promise that resolves to assignment result
 */
export const assignVolunteers = async (taskId, volunteerIds) => {
  try {
    console.log(`Assigning volunteers to task ${taskId}:`, volunteerIds);
    const response = await api.post(`/tasks/${taskId}/volunteers/`, {
      volunteer_ids: volunteerIds
    });
    console.log('Assign volunteers API response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error assigning volunteers to task ${taskId}:`, error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

/**
 * Mark a task as completed
 *
 * @param {string|number} taskId - ID of the task to mark as completed
 * @returns {Promise} Promise that resolves to the updated task
 */
export const markTaskAsCompleted = async (taskId) => {
  try {
    console.log(`Marking task ${taskId} as completed`);
    
    // Use the dedicated status update endpoint
    const response = await api.post(`/tasks/${taskId}/update-status/`, {
      status: 'COMPLETED'
    });
    console.log('Mark as completed API response:', response.data);
    console.log('Response status:', response.status);
    
    // Handle different response formats
    let taskData;
    if (response.data.data) {
      taskData = response.data.data;
    } else {
      taskData = response.data;
    }
    
    // Ensure the status is explicitly set to COMPLETED in the returned data
    if (taskData) {
      taskData.status = 'COMPLETED';
      console.log('Final task data after marking complete:', taskData);
    }
    
    return taskData;
  } catch (error) {
    console.error(`Error marking task ${taskId} as completed:`, error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

/**
 * Mock volunteers data for development
 */
export const getMockTaskVolunteers = (taskId) => {
  const mockVolunteers = [
    {
      id: 1,
      name: 'Anthony',
      surname: 'Moore',
      rating: 4.8,
      reviewCount: 9,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      skills: ['Cleaning', 'Organization'],
      completedTasks: 15,
      user: {
        id: 1,
        name: 'Anthony',
        surname: 'Moore',
        email: 'anthony.moore@email.com',
        phone_number: '+1 234 567 8901',
        rating: 4.8,
        completed_task_count: 15
      }
    },
    {
      id: 2,
      name: 'Elizabeth',
      surname: 'Bailey',
      rating: 4.4,
      reviewCount: 5,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      skills: ['Housekeeping', 'Time Management'],
      completedTasks: 8,
      user: {
        id: 2,
        name: 'Elizabeth',
        surname: 'Bailey',
        email: 'elizabeth.bailey@email.com',
        phone_number: '+1 234 567 8902',
        rating: 4.4,
        completed_task_count: 8
      }
    },
    {
      id: 3,
      name: 'Ashley',
      surname: 'Robinson',
      rating: 4.1,
      reviewCount: 7,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      skills: ['Cleaning', 'Attention to Detail'],
      completedTasks: 12,
      user: {
        id: 3,
        name: 'Ashley',
        surname: 'Robinson',
        email: 'ashley.robinson@email.com',
        phone_number: '+1 234 567 8903',
        rating: 4.1,
        completed_task_count: 12
      }
    }
  ];
  
  return mockVolunteers;
};

export default {
  getTasks,
  getPopularTasks,
  getTaskById,
  getTaskVolunteers,
  volunteerForTask,
  checkUserVolunteerStatus,
  withdrawFromTask,
  assignVolunteers,
  markTaskAsCompleted,
  getMockTaskVolunteers,
};
