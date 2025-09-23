import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchUserProfile, 
  fetchUserReviews, 
  fetchUserCreatedRequests,
  fetchUserVolunteeredRequests,
  fetchUserBadges,
  uploadProfilePicture,
  clearProfileErrors
} from '../store/slices/profileSlice';

/**
 * Custom hook for managing profile data and operations
 * @param {string} userId - The ID of the user or 'current' for logged-in user
 * @returns {Object} Profile methods and state
 */
const useProfile = (userId = 'current') => {
  const dispatch = useDispatch();
  const { 
    user, 
    reviews, 
    createdRequests, 
    volunteeredRequests, 
    badges,
    loading, 
    error 
  } = useSelector(state => state.profile);

  /**
   * Load all profile data
   * @param {Object} options - Optional parameters for data fetching
   * @param {number} options.reviewsPage - Page number for reviews
   * @param {number} options.reviewsLimit - Number of reviews per page
   */
  const loadProfileData = useCallback(async (options = {}) => {
    try {
      const currentId = userId || 'current';
      
      // Get current user ID from localStorage if 'current'
      const currentUserId = currentId === 'current' ? localStorage.getItem('userId') : currentId;
      
      if (!currentUserId) {
        console.error('No user ID available. Please log in.');
        return false;
      }
      
      // Fetch profile data
      await dispatch(fetchUserProfile(currentUserId)).unwrap();
      
      // Fetch reviews with pagination
      const { reviewsPage = 1, reviewsLimit = 20 } = options;
      await dispatch(fetchUserReviews({ 
        userId: currentUserId,
        page: reviewsPage,
        limit: reviewsLimit
      })).unwrap();
      
      // Fetch tasks created by user
      await dispatch(fetchUserCreatedRequests({
        userId: currentUserId,
        page: 1,
        limit: 10
      })).unwrap();
      
      // Fetch tasks user volunteered for
      await dispatch(fetchUserVolunteeredRequests({
        userId: currentUserId,
        page: 1, 
        limit: 10
      })).unwrap();
      
      // Fetch badges
      await dispatch(fetchUserBadges(currentUserId)).unwrap();
      
      return true;
    } catch (err) {
      console.error('Failed to fetch profile data:', err);
      return false;
    }
  }, [dispatch, userId]);

  /**
   * Upload a new profile picture
   * @param {File} file - The image file to upload
   */
  const updateProfilePicture = useCallback(async (file) => {
    if (!file) return false;
    
    try {
      await dispatch(uploadProfilePicture(file)).unwrap();
      return true;
    } catch (err) {
      console.error('Failed to upload profile picture:', err);
      return false;
    }
  }, [dispatch]);

  /**
   * Clear any profile-related errors
   */
  const clearErrors = useCallback(() => {
    dispatch(clearProfileErrors());
  }, [dispatch]);

  // Return the hook interface
  return {
    // State
    user,
    reviews,
    createdRequests,
    volunteeredRequests,
    badges,
    loading,
    error,
    
    // Methods
    loadProfileData,
    updateProfilePicture,
    clearErrors
  };
};

export default useProfile;
