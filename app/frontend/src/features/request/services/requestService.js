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

export default {
  getTasks,
  getPopularTasks,
  getTaskById,
};
