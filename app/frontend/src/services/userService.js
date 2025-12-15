import api from './api';

/**
 * User service for handling user-related API calls
 */
const userService = {
  /**
   * Follow a user
   * @param {number|string} userId - ID of the user to follow
   * @returns {Promise} API response
   */
  followUser: async (userId) => {
    try {
      const response = await api.post(`/users/${userId}/follow/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Unfollow a user
   * @param {number|string} userId - ID of the user to unfollow
   * @returns {Promise} API response
   */
  unfollowUser: async (userId) => {
    try {
      const response = await api.post(`/users/${userId}/unfollow/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get list of followers for a user
   * @param {number|string} userId - ID of the user
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 20)
   * @returns {Promise} API response with followers list
   */
  getFollowers: async (userId, page = 1, limit = 20) => {
    try {
      const response = await api.get(`/users/${userId}/followers/`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get list of users that this user is following
   * @param {number|string} userId - ID of the user
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 20)
   * @returns {Promise} API response with following list
   */
  getFollowing: async (userId, page = 1, limit = 20) => {
    try {
      const response = await api.get(`/users/${userId}/following/`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default userService;
