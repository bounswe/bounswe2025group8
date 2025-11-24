import api from './api';

/**
 * Report Service
 * Handles all report-related API calls
 */

/**
 * Submit a report for a task
 * @param {number} taskId - ID of the task to report
 * @param {string} reportType - Type of report (SPAM, INAPPROPRIATE_CONTENT, etc.)
 * @param {string} description - Description/details of the report
 * @returns {Promise} API response
 */
export const submitReport = async (taskId, reportType, description) => {
  try {
    const response = await api.post('/task-reports/', {
      task_id: taskId,
      report_type: reportType,
      description,
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting report:', error);
    throw error;
  }
};

/**
 * Get task reports for the current user
 * @param {Object} params - Query parameters (page, limit, status, etc.)
 * @returns {Promise} API response with reports
 */
export const getTaskReports = async (params = {}) => {
  try {
    const response = await api.get('/task-reports/', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching task reports:', error);
    throw error;
  }
};

/**
 * Get all reports for the current user
 * @param {Object} params - Query parameters (page, limit, status, etc.)
 * @returns {Promise} API response with reports
 */
export const getUserReports = async (params = {}) => {
  try {
    const response = await api.get('/task-reports/', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching user reports:', error);
    throw error;
  }
};
