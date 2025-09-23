/**
 * Mock Service Adapter
 * 
 * This file provides service functions that use either the real API or mock data
 * based on environment configuration. In development mode, it uses mock data by default.
 * 
 * To switch to real API, set USE_MOCK_DATA to false.
 */

import mockServices from '../mock/mockData';

// Toggle between mock data and real API
const USE_MOCK_DATA = true;

/**
 * Task Service
 */
export const taskService = {
  /**
   * Get all tasks with optional filtering
   * @param {Object} options - Query options
   * @param {number} options.page - Page number
   * @param {number} options.limit - Results per page
   * @param {string} options.status - Filter by status
   * @param {string} options.category - Filter by category
   * @param {number} options.creator - Filter by creator ID
   * @param {string} options.search - Search query
   * @returns {Promise<Object>} Tasks and pagination info
   */
  async getTasks(options = {}) {
    if (USE_MOCK_DATA) {
      return mockServices.tasks.getTasks(options);
    }
    
    // Implement real API call here when backend is ready
    // Example:
    // const response = await axios.get('/api/tasks', { params: options });
    // return response.data;
  },
  
  /**
   * Get a task by ID
   * @param {number|string} taskId - The task ID
   * @returns {Promise<Object>} Task details
   */
  async getTaskById(taskId) {
    if (USE_MOCK_DATA) {
      return mockServices.tasks.getTaskById(taskId);
    }
    
    // Implement real API call here
  },
  
  /**
   * Create a new task
   * @param {Object} taskData - The task data
   * @param {number|string} userId - User ID of creator
   * @returns {Promise<Object>} Created task
   */
  async createTask(taskData, userId) {
    if (USE_MOCK_DATA) {
      return mockServices.tasks.createTask(taskData, userId);
    }
    
    // Implement real API call here
  },
  
  /**
   * Update an existing task
   * @param {number|string} taskId - The task ID
   * @param {Object} taskData - Updated task data
   * @returns {Promise<Object>} Updated task
   */
  async updateTask(taskId, taskData) {
    if (USE_MOCK_DATA) {
      return mockServices.tasks.updateTask(taskId, taskData);
    }
    
    // Implement real API call here
  },
  
  /**
   * Delete a task
   * @param {number|string} taskId - The task ID
   * @returns {Promise<Object>} Result of deletion
   */
  async deleteTask(taskId) {
    if (USE_MOCK_DATA) {
      return mockServices.tasks.deleteTask(taskId);
    }
    
    // Implement real API call here
  },
};

/**
 * User Service
 */
export const userService = {
  /**
   * Get user by ID
   * @param {number|string} userId - The user ID
   * @returns {Promise<Object>} User details
   */
  async getUserById(userId) {
    if (USE_MOCK_DATA) {
      return mockServices.users.getUserById(userId);
    }
    
    // Implement real API call here
  },
  
  /**
   * Get full user profile with tasks and reviews
   * @param {number|string} userId - The user ID
   * @returns {Promise<Object>} User profile with related data
   */
  async getUserProfile(userId) {
    if (USE_MOCK_DATA) {
      return mockServices.users.getUserProfile(userId);
    }
    
    // Implement real API call here
  },
  
  /**
   * Update user profile
   * @param {number|string} userId - The user ID
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} Updated user profile
   */
  async updateUserProfile(userId, userData) {
    if (USE_MOCK_DATA) {
      return mockServices.users.updateUserProfile(userId, userData);
    }
    
    // Implement real API call here
  },
};

/**
 * Volunteer Service
 */
export const volunteerService = {
  /**
   * Get volunteers for a task
   * @param {number|string} taskId - The task ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Volunteers and pagination info
   */
  async getTaskVolunteers(taskId, options = {}) {
    if (USE_MOCK_DATA) {
      return mockServices.volunteers.getTaskVolunteers(taskId, options);
    }
    
    // Implement real API call here
  },
  
  /**
   * Volunteer for a task
   * @param {number|string} userId - The user ID
   * @param {number|string} taskId - The task ID
   * @returns {Promise<Object>} Created volunteer application
   */
  async volunteerForTask(userId, taskId) {
    if (USE_MOCK_DATA) {
      return mockServices.volunteers.volunteerForTask(userId, taskId);
    }
    
    // Implement real API call here
  },
  
  /**
   * Update volunteer status
   * @param {number|string} volunteerId - The volunteer ID
   * @param {string} status - New status ('ACCEPTED' or 'REJECTED')
   * @returns {Promise<Object>} Updated volunteer info
   */
  async updateVolunteerStatus(volunteerId, status) {
    if (USE_MOCK_DATA) {
      return mockServices.volunteers.updateVolunteerStatus(volunteerId, status);
    }
    
    // Implement real API call here
  },
  
  /**
   * Get tasks a user has volunteered for
   * @param {number|string} userId - The user ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Volunteered tasks and pagination info
   */
  async getUserVolunteeredTasks(userId, options = {}) {
    if (USE_MOCK_DATA) {
      return mockServices.volunteers.getUserVolunteeredTasks(userId, options);
    }
    
    // Implement real API call here
  },
};

/**
 * Notification Service
 */
export const notificationService = {
  /**
   * Get user notifications
   * @param {number|string} userId - The user ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Notifications and pagination info
   */
  async getUserNotifications(userId, options = {}) {
    if (USE_MOCK_DATA) {
      return mockServices.notifications.getUserNotifications(userId, options);
    }
    
    // Implement real API call here
  },
  
  /**
   * Mark notification as read
   * @param {number|string} notificationId - The notification ID
   * @returns {Promise<Object>} Updated notification
   */
  async markNotificationAsRead(notificationId) {
    if (USE_MOCK_DATA) {
      return mockServices.notifications.markNotificationAsRead(notificationId);
    }
    
    // Implement real API call here
  },
  
  /**
   * Mark all notifications as read
   * @param {number|string} userId - The user ID
   * @returns {Promise<Object>} Result
   */
  async markAllNotificationsAsRead(userId) {
    if (USE_MOCK_DATA) {
      return mockServices.notifications.markAllNotificationsAsRead(userId);
    }
    
    // Implement real API call here
  },
};

/**
 * Review Service
 */
export const reviewService = {
  /**
   * Get reviews for a user
   * @param {number|string} userId - The user ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Reviews and pagination info
   */
  async getUserReviews(userId, options = {}) {
    if (USE_MOCK_DATA) {
      return mockServices.reviews.getUserReviews(userId, options);
    }
    
    // Implement real API call here
  },
  
  /**
   * Get reviews for a task
   * @param {number|string} taskId - The task ID
   * @returns {Promise<Array>} List of reviews
   */
  async getTaskReviews(taskId) {
    if (USE_MOCK_DATA) {
      return mockServices.reviews.getTaskReviews(taskId);
    }
    
    // Implement real API call here
  },
  
  /**
   * Create a new review
   * @param {Object} reviewData - Review data
   * @returns {Promise<Object>} Created review
   */
  async createReview(reviewData) {
    if (USE_MOCK_DATA) {
      return mockServices.reviews.createReview(reviewData);
    }
    
    // Implement real API call here
  },
};

/**
 * Category Service
 */
export const categoryService = {
  /**
   * Get all categories
   * @returns {Promise<Array>} List of categories
   */
  async getAllCategories() {
    if (USE_MOCK_DATA) {
      return mockServices.categories.getAllCategories();
    }
    
    // Implement real API call here
  },
  
  /**
   * Get tasks by category
   * @param {string} categoryId - Category ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Tasks and pagination info
   */
  async getTasksByCategory(categoryId, options = {}) {
    if (USE_MOCK_DATA) {
      return mockServices.categories.getTasksByCategory(categoryId, options);
    }
    
    // Implement real API call here
  },
};

/**
 * Statistics Service
 */
export const statisticsService = {
  /**
   * Get application statistics
   * @returns {Promise<Object>} Statistics data
   */
  async getStatistics() {
    if (USE_MOCK_DATA) {
      return Promise.resolve(mockServices.mockStatistics);
    }
    
    // Implement real API call here
  },
};

// Export category mapping from mock data
export { categoryMapping } from '../mock/mockData';

// Export all services with both original names and mock prefixed names for the demo
export const mockTaskService = taskService;
export const mockUserService = userService;
export const mockVolunteerService = volunteerService;
export const mockNotificationService = notificationService;
export const mockReviewService = reviewService;
export const mockCategoryService = categoryService;
export const mockStatisticsService = statisticsService;

// Export all services
export default {
  taskService,
  userService,
  volunteerService,
  notificationService,
  reviewService,
  categoryService,
  statisticsService,
};
