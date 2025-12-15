import api from '../../../services/api';

/**
 * Fetch all available badge definitions.
 * GET /api/badges/
 */
export const getAllBadges = async () => {
    try {
        const response = await api.get('/badges/');
        return response.data;
    } catch (error) {
        console.error('Error fetching all badges:', error);
        throw error;
    }
};

/**
 * Fetch all badge type enums.
 * GET /api/badges/types/
 */
export const getBadgeTypes = async () => {
    try {
        const response = await api.get('/badges/types/');
        return response.data;
    } catch (error) {
        console.error('Error fetching badge types:', error);
        throw error;
    }
};

/**
 * Fetch earned badges for a specific user.
 * GET /api/user-badges/?user_id={userId}
 */
export const getUserBadges = async (userId) => {
    try {
        const response = await api.get('/user-badges/', { params: { user_id: userId } });
        return response.data;
    } catch (error) {
        console.error('Error fetching user badges:', error);
        throw error;
    }
};

/**
 * Fetch authenticated user's badges (simplified format).
 * GET /api/user-badges/my_badges/
 */
export const getMyBadges = async () => {
    try {
        const response = await api.get('/user-badges/my_badges/');
        return response.data;
    } catch (error) {
        console.error('Error fetching my badges:', error);
        throw error;
    }
};

/**
 * Manually trigger badge check for authenticated user.
 * POST /api/user-badges/check_all/
 */
export const checkBadges = async () => {
    try {
        const response = await api.post('/user-badges/check_all/');
        return response.data;
    } catch (error) {
        console.error('Error checking badges:', error);
        throw error;
    }
};
