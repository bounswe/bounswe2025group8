import api from '../../../services/api';
import { toAbsoluteUrl } from '../../../utils/url';

/**
 * Normalize user data to ensure consistent profile photo handling
 */
const normalizeUserData = (user) => {
  if (!user || typeof user !== 'object') return user;

  const resolvedPhoto =
    user.profile_photo ||
    user.profilePhoto ||
    user.profilePicture ||
    user.photo ||
    user.avatar ||
    null;
  const normalizedPhoto = toAbsoluteUrl(resolvedPhoto) || null;

  return {
    ...user,
    profile_photo: normalizedPhoto,
    profilePhoto: normalizedPhoto,
    profilePicture: normalizedPhoto,
  };
};

/**
 * Search for users by name, surname, or username
 * @param {string} query - The search query
 * @param {number} page - Page number for pagination (default: 1)
 * @param {number} limit - Number of results per page (default: 10)
 * @returns {Promise<Object>} - Search results with users and pagination info
 */
export const searchUsers = async (query, page = 1, limit = 10) => {
  try {
    if (!query || !query.trim()) {
      return { users: [], pagination: { totalItems: 0, totalPages: 0, currentPage: 1 } };
    }

    const params = { search: query.trim(), page, limit };
    const response = await api.get('/users/', { params });

    // Handle different response structures
    const data = response.data?.data || response.data;

    // Extract users array from response
    let users = [];
    if (Array.isArray(data)) {
      users = data;
    } else if (data?.results) {
      users = data.results;
    } else if (data?.users) {
      users = data.users;
    }

    // Normalize user data
    users = users.map(normalizeUserData);

    // Extract pagination info
    const pagination = {
      totalItems: data?.count || users.length,
      totalPages: data?.count ? Math.ceil(data.count / limit) : 1,
      currentPage: page,
      hasNextPage: !!data?.next,
      hasPreviousPage: !!data?.previous,
    };

    return { users, pagination };
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};
