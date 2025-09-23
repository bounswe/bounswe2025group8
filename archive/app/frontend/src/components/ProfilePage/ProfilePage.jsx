import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Box, Container, Typography, Button, Tab, Tabs, Avatar, 
         Paper, Grid, Rating, Chip, IconButton, Badge as MuiBadge, 
         Divider, CircularProgress, Pagination } from '@mui/material';
import { Edit, Notifications, Settings, ArrowBack, People, EmojiEvents } from '@mui/icons-material';
import { 
  fetchUserProfile, 
  fetchUserReviews, 
  fetchUserCreatedRequests,
  fetchUserVolunteeredRequests,
  fetchUserBadges,
  uploadProfilePicture,
  clearUpdateSuccess
} from '../../store/slices/profileSlice';
import RequestCard from '../RequestCard';
import ReviewCard from '../ReviewCard/ReviewCard';
import Badge from '../Badge/Badge';
import EditProfileDialog from '../EditProfileDialog/EditProfileDialog';
// No need for CSS module import as we're using Material UI's sx prop

const ProfilePage = () => {
  const { userId } = useParams();
  
  // Get logged-in user data from localStorage and Redux store
  const loggedInUserId = localStorage.getItem('userId');
  const loggedInUserData = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const authState = useSelector(state => state.auth);
  
  // Debug helper function - call this in the browser console to see all auth-related info
  window.debugAuthState = () => {
    console.group('=== AUTH DEBUG INFO ===');
    console.log('URL userId param:', userId);
    console.log('localStorage userId:', localStorage.getItem('userId'));
    console.log('localStorage user:', localStorage.getItem('user'));
    console.log('localStorage token:', localStorage.getItem('token'));
    console.log('localStorage role:', localStorage.getItem('role'));
    console.log('Redux auth state:', authState);
    console.groupEnd();
    return "Auth debug info logged above ☝️";
  };
  
  console.log('DEBUGGING USER INFO:');
  console.log('Current profile userId from URL:', userId);
  console.log('Logged-in userId from localStorage:', loggedInUserId);
  console.log('Logged-in user object:', loggedInUserData);
  console.log('Auth state from Redux:', authState);
  console.log('Condition check for Edit button:', userId === 'current' || userId === 'me' || !userId || userId === loggedInUserId);
  
  const dispatch = useDispatch();
  const {
    user,
    reviews,
    createdRequests,
    volunteeredRequests,
    badges = [],
    loading,
    error
  } = useSelector((state) => state.profile);

  const [roleTab, setRoleTab] = useState(0); // 0 for Volunteer, 1 for Requester
  const [requestsTab, setRequestsTab] = useState(0); // 0 for Active, 1 for Past
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewsPerPage] = useState(5);
  const [refreshData, setRefreshData] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);  // Empty array for badges since we'll use API data
  const [mockBadges] = useState([]);
  
const loadProfileData = useCallback(async () => {
  try {
    // Get user ID from multiple possible sources
    const loggedInUserId = localStorage.getItem('userId');
    const loggedInUserObj = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    const loggedInUserIdFromObj = loggedInUserObj?.id;
    const effectiveLoggedInUserId = loggedInUserId || loggedInUserIdFromObj;
    
    // If we have a URL userId parameter, use it, otherwise fall back to the logged-in user's ID
    const currentId = userId === 'current' ? effectiveLoggedInUserId : (userId || effectiveLoggedInUserId);
    
    console.log('loadProfileData - DEBUGGING:');
    console.log('- Profile userId param:', userId);
    console.log('- Logged-in userId from localStorage:', loggedInUserId);
    console.log('- Logged-in userId from user object:', loggedInUserIdFromObj);
    console.log('- ID actually used for API calls:', currentId);
    
    if (!currentId) {
      console.error('No user ID available - unable to load profile data');
      return;
    }
    
    await dispatch(fetchUserProfile(currentId)).unwrap();
    
    // Use object parameter for reviews to pass pagination info
    await dispatch(fetchUserReviews({
      userId: currentId,
      page: reviewPage,
      limit: reviewsPerPage
    })).unwrap();
      // For requester tab (roleTab = 1), fetch created tasks with appropriate status
    if (roleTab === 1) {
      // Determine which status to request based on the active/past tab
      const status = requestsTab === 0 ? 'active' : 'COMPLETED';
      
      await dispatch(fetchUserCreatedRequests({
        userId: currentId,
        page: 1,
        limit: 10,
        status: status
      })).unwrap();
    }
    
    // For volunteer tab (roleTab = 0), fetch volunteered tasks
    // For volunteer tab, we also need to handle active vs completed tasks
    if (roleTab === 0) {
      // If the API supports status parameter for volunteered tasks
      const status = requestsTab === 0 ? 'active' : 'COMPLETED';
      
      await dispatch(fetchUserVolunteeredRequests({
        userId: currentId,
        page: 1,
        limit: 10,
        status: status // Pass the status parameter for volunteered tasks too
      })).unwrap();
    }
    
    await dispatch(fetchUserBadges(currentId)).unwrap();
  } catch (err) {
    console.error('Failed to fetch profile data:', err);
  }
}, [dispatch, userId, reviewPage, reviewsPerPage, roleTab, requestsTab]);
  useEffect(() => {
    loadProfileData();
  }, [loadProfileData, refreshData, reviewPage, reviewsPerPage, roleTab, requestsTab]);
  
  // Reset data refresh flag after loading completes
  useEffect(() => {
    if (!loading && refreshData) {
      setRefreshData(false);
    }
  }, [loading, refreshData]);
  
  // Close edit profile dialog and refresh data when update is successful
  const { updateSuccess } = useSelector((state) => state.profile);
  useEffect(() => {
    if (updateSuccess) {
      setEditProfileOpen(false);
      setRefreshData(true);
      dispatch(clearUpdateSuccess());
    }
  }, [updateSuccess, dispatch]);
  
  // Update review page when user changes
  useEffect(() => {
    if (userId) {
      setReviewPage(1); // Reset to first page when user changes
    }
  }, [userId]);
  const handleRoleChange = (event, newValue) => {
    setRoleTab(newValue);
    setRequestsTab(0); // Reset to active requests whenever role changes
    // No need to trigger data reload here, as the effect hook will handle it
  };
  
  const handleRequestTabChange = (tabIndex) => {
    setRequestsTab(tabIndex);
    // Data reload will be handled by the effect hook
  };
  
  const handleReviewPageChange = (event, value) => {
    setReviewPage(value);
    
    // Fetch new page of reviews
    const currentId = userId || localStorage.getItem('userId');
    
    if (currentId) {
      dispatch(fetchUserReviews({ 
        userId: currentId, 
        page: value, 
        limit: reviewsPerPage 
      }));
    } else {
      console.error('No user ID available for fetching reviews');
    }
  };
  const getCurrentRequests = () => {
    // Check if response contains items list (pagination structure) or is an array directly
    const requests = roleTab === 0 ? volunteeredRequests : createdRequests;
    
    // Return an empty array if no data
    if (!requests) return [];
    
    // If it's an array, use it directly
    if (Array.isArray(requests)) return requests;
    
    // If it's a paginated response with 'tasks' field (from the API), return the tasks array
    if (requests.tasks && Array.isArray(requests.tasks)) return requests.tasks;
    
    // If it's a paginated response with 'items' field, return the items array
    if (requests.items && Array.isArray(requests.items)) return requests.items;
    
    // If it's a different structure, check for common fields like 'data'
    if (requests.data && Array.isArray(requests.data)) return requests.data;
    
    // If we can't determine the structure, return empty array
    console.warn('Unknown structure for requests:', requests);
    return [];
  };
  // Get active and past requests for the current role tab
  // We're now fetching requests directly from the API with appropriate status
  const activeRequests = getCurrentRequests();
  
  // Past requests are now also fetched from the API with status=COMPLETED
  const pastRequests = requestsTab === 1 ? getCurrentRequests() : [];
  
  // No need for client-side pagination since we're using server pagination now

  // Get earned and in-progress badges
  const badgesToUse = badges.length > 0 ? badges : mockBadges;
  const earnedBadges = badgesToUse.filter((badge) => badge.earned);
  const inProgressBadges = badgesToUse.filter((badge) => !badge.earned);

  // Handler for profile picture upload
  const handleProfilePictureUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      dispatch(uploadProfilePicture(file));
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" variant="h6" gutterBottom>
          Failed to load profile
        </Typography>
        <Typography color="text.secondary" paragraph>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => setRefreshData(true)}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
        <Container maxWidth="lg">
          {/* Profile header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar 
                  src={user.profilePicture} 
                  alt={user.name} 
                  sx={{ width: 80, height: 80 }} 
                />
                {/* Only show edit button for current user's profile */}
                {(() => {
                  // Get logged-in user ID with fallback to user object if direct ID is not available
                  const loggedInUserId = localStorage.getItem('userId');
                  const loggedInUserObj = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
                  const loggedInUserIdFromObj = loggedInUserObj?.id;
                  const effectiveLoggedInUserId = loggedInUserId || loggedInUserIdFromObj;
                  
                  // Check if viewing own profile through multiple possible conditions
                  const isOwnProfile = (
                    userId === 'current' || 
                    userId === 'me' || 
                    !userId || 
                    (effectiveLoggedInUserId && userId === effectiveLoggedInUserId) ||
                    // Also handle the case where no userId is directly available but user is authenticated
                    (!effectiveLoggedInUserId && authState?.isAuthenticated)
                  );
                  console.log('Profile pic edit button check:', { userId, loggedInUserId, isOwnProfile });
                  return isOwnProfile ? (
                    <IconButton 
                      component="label"
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        backgroundColor: 'rgba(255,255,255,0.8)',
                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' },
                      }}
                    >
                      <input 
                        type="file" 
                        accept="image/*" 
                        hidden 
                        onChange={handleProfilePictureUpload} 
                      />
                      <Edit fontSize="small" />
                    </IconButton>
                  ) : null;
                })()}
              </Box>
              <Box>
                <Typography variant="h5" component="h1" sx={{ textAlign: 'left' }}>{user.name} {user.surname}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating value={user.rating} precision={0.1} readOnly />
                  <Chip
                    label={`${user.rating} (${user.reviewCount || reviews.length} reviews)`}
                    color="secondary"
                    sx={{ backgroundColor: '#F06292', color: '#fff', '& .MuiChip-label': { px: 2 } }}
                  />
                </Box>
              </Box>
            </Box>
            {/* Only show edit profile button for current user */}
            {(() => {
              // Get logged-in user ID with fallback to user object if direct ID is not available
              const loggedInUserId = localStorage.getItem('userId');
              const loggedInUserObj = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
              const loggedInUserIdFromObj = loggedInUserObj?.id;
              const effectiveLoggedInUserId = loggedInUserId || loggedInUserIdFromObj;
              
              // Check if viewing own profile through multiple possible conditions
              const isOwnProfile = (
                userId === 'current' || 
                userId === 'me' || 
                !userId || 
                (effectiveLoggedInUserId && userId === effectiveLoggedInUserId) ||
                // Also handle the case where no userId is directly available but user is authenticated
                (!effectiveLoggedInUserId && authState?.isAuthenticated)
              );
              console.log('Edit button check:', { userId, loggedInUserId, isOwnProfile });
              return isOwnProfile ? (
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  sx={{ borderRadius: '20px', borderColor: '#ccc', color: '#333' }}
                  onClick={() => setEditProfileOpen(true)}
                >
                  Edit Profile
                </Button>
              ) : null;
            })()}
          </Box>

          {/* Badges section */}
          <Paper
            elevation={0}
            sx={{ p: 2, mb: 4, borderRadius: 2, border: '1px solid #f0f0f0', bgcolor: '#fcfcfc' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <EmojiEvents sx={{ color: '#FFD700', mr: 1 }} />
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                Badges
              </Typography>
              <MuiBadge badgeContent={earnedBadges.length} color="primary" sx={{ ml: 4 }} />
            </Box>

            {/* Earned badges */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                Earned Achievements
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                {earnedBadges.length > 0 ? (
                  earnedBadges.map((badge) => <Badge key={badge.id} badge={badge} />)
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No badges earned yet. Complete tasks to earn badges!
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Divider if there are in-progress badges */}
            {inProgressBadges.length > 0 && <Divider sx={{ my: 2 }} />}

            {/* In-progress badges */}
            {inProgressBadges.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                  In Progress
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {inProgressBadges.map((badge) => <Badge key={badge.id} badge={badge} />)}
                </Box>
              </Box>
            )}
          </Paper>

          {/* Role tabs */}
          <Box sx={{ width: '100%', mb: 4 }}>
            <Box
              sx={{
                borderBottom: 0,
                display: 'flex',
                '& .MuiTabs-flexContainer': { justifyContent: 'center', width: '100%', gap: 2 },
              }}
            >
              <Tabs
                value={roleTab}
                onChange={handleRoleChange}
                centered
                sx={{ width: '100%' }}
                TabIndicatorProps={{ style: { display: 'none' } }}
              >
                <Tab
                  label="Volunteer"
                  sx={{
                    borderRadius: '4px',
                    backgroundColor: roleTab === 0 ? '#5C69FF' : 'transparent',
                    color: roleTab === 0 ? 'white' : 'inherit',
                    width: '50%',
                    '&.Mui-selected': { color: 'white' },
                  }}
                />
                <Tab
                  label="Requester"
                  sx={{
                    borderRadius: '4px',
                    backgroundColor: roleTab === 1 ? '#5C69FF' : 'transparent',
                    color: roleTab === 1 ? 'white' : 'inherit',
                    width: '50%',
                    '&.Mui-selected': { color: 'white' },
                  }}
                />
              </Tabs>
            </Box>
          </Box>

          {/* Requests section */}
          <Box sx={{ mb: 4 }}>
            {/* Active/Past Requests Header */}            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {requestsTab === 1 && (
                <IconButton onClick={() => handleRequestTabChange(0)} sx={{ mr: -1 }}>
                </IconButton>
              )}
              <Typography
                variant="h6"
                component="h2"
                onClick={() => handleRequestTabChange(0)}
                sx={{ cursor: 'pointer', fontWeight: requestsTab === 0 ? 'bold' : 'normal', mr: 4 }}
              >
                {roleTab === 0 ? 'Active Volunteering' : 'Active Requests'}
              </Typography>
              <Typography
                variant="h6"
                component="h2"
                onClick={() => handleRequestTabChange(1)}
                sx={{ cursor: 'pointer', fontWeight: requestsTab === 1 ? 'bold' : 'normal' }}
              >
                {roleTab === 0 ? 'Past Volunteering' : 'Past Requests'}
              </Typography>
            </Box>

            {/* Requester-specific instructions when no requests */}
            {roleTab === 1 && activeRequests.length === 0 && requestsTab === 0 && (
              <Box sx={{ textAlign: 'center', py: 4, mb: 2 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  You haven't made any requests yet
                </Typography>
                <Button
                  variant="contained"
                  sx={{ mt: 2, borderRadius: '20px', px: 3, py: 1 }}
                  href="/create-request"
                >
                  Create New Request
                </Button>
              </Box>
            )}

            {/* Volunteer-specific instructions when no volunteering */}
            {roleTab === 0 && activeRequests.length === 0 && requestsTab === 0 && (
              <Box sx={{ textAlign: 'center', py: 4, mb: 2 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  You're not volunteering for any tasks yet
                </Typography>
                <Button
                  variant="contained"
                  sx={{ mt: 2, borderRadius: '20px', px: 3, py: 1 }}
                  href="/requests"
                >
                  Find Tasks to Help With
                </Button>
              </Box>
            )}

            {/* Active/Past Requests Grid Layout */}
            <Box sx={{ mb: 4 }}>
              {requestsTab === 0 ? (
                <Grid container spacing={2} sx={{justifyContent: 'center'}}>
                  {activeRequests.length > 0 ? (
                    activeRequests.map((request) => (
                      <Grid sx={{ gridColumn: {xs: "span 12", sm: "span 6"} }} key={request.id}>
                        <RequestCard
                          request={request}
                          userRole={roleTab === 0 ? 'volunteer' : 'requester'}
                          onUpdate={() => setRefreshData(true)}
                        />
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>{/* Empty state content is above */}</Grid>
                  )}
                </Grid>
              ) : (
                <Grid container spacing={2}>
                  {pastRequests.length > 0 ? (
                    pastRequests.map((request) => (
                      <Grid sx={{ gridColumn: {xs: "span 12", sm: "span 6"} }} key={request.id}>
                        <RequestCard
                          request={request}
                          userRole={roleTab === 0 ? 'volunteer' : 'requester'}
                          onUpdate={() => setRefreshData(true)}
                        />
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Typography align="center" color="text.secondary" sx={{ mb: 4, mt:2}}>
                        No past {roleTab === 0 ? 'volunteering' : 'requests'}.
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              )}
            </Box>
          </Box>            {/* Reviews section */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mr: 2 }}>
                Reviews
              </Typography>
              <Chip
                label={`${user.rating || 0} (${reviews?.reviews?.length || 0} reviews)`}
                color="primary"
                size="small"
                sx={{ backgroundColor: '#FFB6C1', color: '#333', '& .MuiChip-label': { px: 1 } }}
              />
            </Box>
            <Box>
              {reviews && reviews.reviews && reviews.reviews.length > 0 ? (
                <>
                  {reviews.reviews.map((review) => (
                    <Box key={review.id} sx={{ mb: 2 }}>
                      <ReviewCard review={review} />
                    </Box>
                  ))}
                  {/* Pagination controls for reviews */}
                  {reviews.pagination && reviews.pagination.total_pages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                      <Pagination
                        count={reviews.pagination.total_pages}
                        page={reviewPage}
                        onChange={handleReviewPageChange}
                        color="primary"
                      />
                    </Box>
                  )}
                </>
              ) : (
                <Typography>No reviews yet.</Typography>
              )}
            </Box>
          </Box>
        </Container>
      </Box>
      
      {/* Edit Profile Dialog */}
      <EditProfileDialog 
        open={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        user={user}
      />
    </Box>
  );
};

export default ProfilePage;