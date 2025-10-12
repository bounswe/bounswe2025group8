import api from './api';

/**
 * Get all task categories with their popularity data
 * 
 * @returns {Promise} Promise that resolves to an array of categories with popularity metrics
 */
export const getCategories = async () => {
  try {
    const response = await api.get('/tasks/categories/');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Get popular categories sorted by task count
 * 
 * @param {number} limit - Maximum number of categories to return
 * @returns {Promise} Promise that resolves to an array of popular categories
 */
export const getPopularCategories = async (limit = 5) => {
  try {
    const categories: { task_count: number }[] = await getCategories();
    
    // Sort by task count (most popular first) and limit
    return categories
      .sort((a, b) => b.task_count - a.task_count)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching popular categories:', error);
    throw error;
  }
};

export default {
  getCategories,
  getPopularCategories
};