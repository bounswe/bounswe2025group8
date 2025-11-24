import api from '../../../services/api';

/**
 * Fetch all reports (both task and user reports)
 * @param {string} reportType - 'task', 'user', or 'all'
 * @param {string} status - Filter by status: PENDING, UNDER_REVIEW, RESOLVED, DISMISSED
 * @param {number} page - Page number for pagination
 * @returns {Promise} Promise that resolves to paginated reports
 */
export const getReports = async (reportType = 'all', status = null, page = 1) => {
  try {
    const params = { page };
    if (reportType !== 'all') {
      params.type = reportType;
    }
    if (status) {
      params.status = status;
    }

    const response = await api.get('/admin/reports/', { params });
    return {
      reports: response.data.results || [],
      pagination: {
        page,
        totalPages: Math.ceil((response.data.count || 0) / (response.data.results?.length || 10)),
        totalItems: response.data.count || 0,
        hasNextPage: !!response.data.next,
        hasPreviousPage: !!response.data.previous,
      },
      stats: response.data.stats || {},
    };
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

/**
 * Fetch task reports only
 * @param {string} status - Filter by status
 * @param {number} page - Page number for pagination
 * @returns {Promise} Promise that resolves to paginated task reports
 */
export const getTaskReports = async (status = null, page = 1) => {
  return getReports('task', status, page);
};

/**
 * Fetch user reports only
 * @param {string} status - Filter by status
 * @param {number} page - Page number for pagination
 * @returns {Promise} Promise that resolves to paginated user reports
 */
export const getUserReports = async (status = null, page = 1) => {
  return getReports('user', status, page);
};

/**
 * Fetch all requests/tasks
 * @param {Object} filters - Query parameters for filtering tasks
 * @param {number} page - Page number for pagination
 * @returns {Promise} Promise that resolves to paginated tasks
 */
export const getAllRequests = async (filters = {}, page = 1) => {
  try {
    const response = await api.get('/tasks/', {
      params: {
        ...filters,
        page,
      },
    });
    return {
      tasks: response.data.results || [],
      pagination: {
        page,
        totalPages: Math.ceil((response.data.count || 0) / (response.data.results?.length || 10)),
        totalItems: response.data.count || 0,
        hasNextPage: !!response.data.next,
        hasPreviousPage: !!response.data.previous,
      },
    };
  } catch (error) {
    console.error('Error fetching all requests:', error);
    throw error;
  }
};

/**
 * Fetch reported users
 * @param {number} page - Page number for pagination
 * @returns {Promise} Promise that resolves to paginated reported users
 */
export const getReportedUsers = async (page = 1) => {
  try {
    const response = await api.get('/admin/reported-users/', {
      params: { page },
    });
    return {
      users: response.data.results || [],
      pagination: {
        page,
        totalPages: Math.ceil((response.data.count || 0) / (response.data.results?.length || 10)),
        totalItems: response.data.count || 0,
        hasNextPage: !!response.data.next,
        hasPreviousPage: !!response.data.previous,
      },
    };
  } catch (error) {
    console.error('Error fetching reported users:', error);
    throw error;
  }
};

/**
 * Update report status with admin notes
 * @param {string} reportType - 'task' or 'user'
 * @param {number} reportId - ID of the report
 * @param {string} status - New status (UNDER_REVIEW, RESOLVED, DISMISSED)
 * @param {string} notes - Admin notes (optional)
 * @returns {Promise} Promise that resolves to updated report
 */
export const updateReportStatus = async (reportType, reportId, status, notes = '') => {
  try {
    const endpoint = reportType === 'task' ? 'task-reports' : 'user-reports';
    const response = await api.patch(`/${endpoint}/${reportId}/update_status/`, {
      status,
      notes,
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating ${reportType} report status:`, error);
    throw error;
  }
};

/**
 * Ban a user
 * @param {number} userId - ID of the user to ban
 * @param {string} reason - Reason for ban
 * @returns {Promise} Promise that resolves to ban result
 */
export const banUser = async (userId, reason) => {
  try {
    const response = await api.post(`/admin/users/${userId}/ban/`, {
      reason,
    });
    return response.data;
  } catch (error) {
    console.error(`Error banning user ${userId}:`, error);
    throw error;
  }
};

/**
 * Delete a task
 * @param {number} taskId - ID of the task to delete
 * @param {string} reason - Reason for deletion (optional)
 * @returns {Promise} Promise that resolves to deletion result
 */
export const deleteTask = async (taskId, reason = '') => {
  try {
    const response = await api.delete(`/admin/tasks/${taskId}/delete/`, {
      data: { reason },
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Get detailed admin view of a user
 * @param {number} userId - ID of the user
 * @returns {Promise} Promise that resolves to user details
 */
export const getAdminUserDetail = async (userId) => {
  try {
    const response = await api.get(`/admin/users/${userId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching admin user detail:`, error);
    throw error;
  }
};

export default {
  getReports,
  getTaskReports,
  getUserReports,
  getAllRequests,
  getReportedUsers,
  updateReportStatus,
  banUser,
  deleteTask,
  getAdminUserDetail,
};
