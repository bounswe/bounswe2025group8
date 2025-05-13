import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Box, Container, Typography, Button, Tab, Tabs, Avatar, 
         Paper, Grid, Rating, Chip, IconButton, Badge as MuiBadge, Divider } from '@mui/material';
import { Edit, Notifications, Settings, ArrowBack, People, EmojiEvents } from '@mui/icons-material';
import { 
  fetchUserProfile, 
  fetchUserReviews, 
  fetchUserCreatedRequests,
  fetchUserVolunteeredRequests,
  fetchUserBadges
} from '../../redux/slices/profileSlice';
import RequestCard from '../RequestCard/RequestCard';
import ReviewCard from '../ReviewCard/ReviewCard';
import Badge from '../Badge/Badge';
import Sidebar from '../Sidebar/Sidebar';
import styles from './ProfilePage.module.css';

const ProfilePage = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const { 
    user, 
    reviews, 
    createdRequests, 
    volunteeredRequests, 
    badges = [], // Default to empty array if not in state yet
    loading 
  } = useSelector((state) => state.profile);
  
  const [roleTab, setRoleTab] = useState(0); // 0 for Volunteer, 1 for Requester
  const [requestsTab, setRequestsTab] = useState(0); // 0 for Active, 1 for Past

  // Temporary mock badges with images for testing
  const [mockBadges] = useState([
      {
        id: 'badge1',
        title: 'First Steps',
        description: 'Completed 5 tasks',
        image: 'https://cdn-icons-png.flaticon.com/128/8382/8382248.png', // Minimalist badge
        color: '#FF9800',
        earned: true,
        earnedDate: '2025-02-15'
      },
      {
        id: 'badge2',
        title: 'Helping Hand',
        description: 'Completed 10 tasks',
        image: 'https://cdn-icons-png.flaticon.com/128/1067/1067357.png', // Handshake icon
        color: '#4CAF50',
        earned: true,
        earnedDate: '2025-03-22'
      },
      {
        id: 'badge3',
        title: 'Community Pillar',
        description: 'Completed 25 tasks',
        image: 'https://cdn-icons-png.flaticon.com/128/3588/3588611.png', // Community icon
        color: '#5C69FF',
        earned: false,
        progress: 68,
        requiredAmount: 25
      },
      {
        id: 'badge4',
        title: 'Neighborhood Hero',
        description: 'Completed 50 tasks',
        image: 'https://cdn-icons-png.flaticon.com/128/1756/1756636.png', // Medal icon
        color: '#F06292',
        earned: false,
        progress: 34,
        requiredAmount: 50
      },
      {
        id: 'badge5',
        title: 'Excellent Rating',
        description: 'Maintained 4.5+ rating for 3 months',
        image: 'https://cdn-icons-png.flaticon.com/128/992/992001.png', // Star icon
        color: '#FFD700',
        earned: true,
        earnedDate: '2025-04-18'
      }
  ]);
  
  useEffect(() => {
    // Fetch profile data when component mounts or userId changes
    dispatch(fetchUserProfile(userId || 'current'));
    dispatch(fetchUserReviews(userId || 'current'));
    dispatch(fetchUserCreatedRequests(userId || 'current'));
    dispatch(fetchUserVolunteeredRequests(userId || 'current'));
    dispatch(fetchUserBadges(userId || 'current'));
  }, [dispatch, userId]);
  
  const handleRoleChange = (event, newValue) => {
    setRoleTab(newValue);
    // Reset to active requests whenever role changes
    setRequestsTab(0);
  };
  
  // Get current requests based on role
  const getCurrentRequests = () => {
    return roleTab === 0 ? volunteeredRequests : createdRequests;
  };
  
  // Filter requests based on active status and current role
  const activeRequests = getCurrentRequests().filter(request => !request.completed);
  const pastRequests = getCurrentRequests().filter(request => request.completed);
  
  // Get earned and in-progress badges
  const badgesToUse = badges.length > 0 ? badges : mockBadges;
  const earnedBadges = badgesToUse.filter(badge => badge.earned);
  const inProgressBadges = badgesToUse.filter(badge => !badge.earned);
  
  if (loading) {
    return <Typography>Loading profile...</Typography>;
  }
  
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar navigation */}
      <Sidebar />
      
      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
        <Container maxWidth="lg">
          {/* Search input */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              maxWidth: '700px',
              p: '2px 4px',
              borderRadius: '25px',
              backgroundColor: '#f5f5f5'
            }}>
              <IconButton sx={{ p: '10px' }} aria-label="search">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="#5C69FF"/>
                </svg>
              </IconButton>
              <input 
                type="text" 
                placeholder="What do you need help with" 
                style={{ 
                  width: '100%',
                  padding: '10px',
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent'
                }}
              />
            </Box>
          </Box>
          
          {/* Profile header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar 
                src={user.profilePicture}
                alt={user.name}
                sx={{ width: 80, height: 80 }}
              />
              <Box>
                <Typography variant="h5" component="h1">{user.name}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating value={user.rating} precision={0.1} readOnly />
                  <Chip 
                    label={`${user.rating} (${user.reviewCount} reviews)`}
                    color="secondary"
                    sx={{ 
                      backgroundColor: '#F06292', 
                      color: '#fff',
                      '& .MuiChip-label': { px: 2 } 
                    }}
                  />
                </Box>
              </Box>
            </Box>
            <Button 
              variant="outlined" 
              startIcon={<Edit />}
              sx={{ 
                borderRadius: '20px', 
                borderColor: '#ccc',
                color: '#333'
              }}
            >
              Edit Profile
            </Button>
          </Box>
          
          {/* Badges section */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              mb: 4, 
              borderRadius: 2,
              border: '1px solid #f0f0f0',
              bgcolor: '#fcfcfc' 
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <EmojiEvents sx={{ color: '#FFD700', mr: 1 }} />
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                Badges
              </Typography>
              <MuiBadge 
                badgeContent={earnedBadges.length} 
                color="primary"
                sx={{ ml: 2 }}
              />
            </Box>
            
            {/* Earned badges */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                Earned Achievements
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                {earnedBadges.length > 0 ? (
                  earnedBadges.map((badge) => (
                    <Badge key={badge.id} badge={badge} />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No badges earned yet. Complete tasks to earn badges!
                  </Typography>
                )}
              </Box>
            </Box>
            
            {/* Divider if there are in-progress badges */}
            {inProgressBadges.length > 0 && (
              <Divider sx={{ my: 2 }} />
            )}
            
            {/* In-progress badges */}
            {inProgressBadges.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                  In Progress
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {inProgressBadges.map((badge) => (
                    <Badge key={badge.id} badge={badge} />
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
          
          {/* Role tabs */}
          <Box sx={{ width: '100%', mb: 4 }}>
            <Box sx={{ 
              borderBottom: 0,
              display: 'flex',
              '& .MuiTabs-flexContainer': { 
                justifyContent: 'center',
                width: '100%',
                gap: 2
              }
            }}>
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
                    '&.Mui-selected': { color: 'white' }
                  }}
                />
                <Tab 
                  label="Requester" 
                  sx={{ 
                    borderRadius: '4px',
                    backgroundColor: roleTab === 1 ? '#5C69FF' : 'transparent',
                    color: roleTab === 1 ? 'white' : 'inherit',
                    width: '50%',
                    '&.Mui-selected': { color: 'white' }
                  }}
                />
              </Tabs>
            </Box>
          </Box>
          
          {/* Requests section */}
          <Box sx={{ mb: 4 }}>
            {/* Active/Past Requests Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {requestsTab === 1 && (
                <IconButton 
                  onClick={() => setRequestsTab(0)} 
                  sx={{ mr: -1 }}
                >
                </IconButton>
              )}
              <Typography 
                variant="h6" 
                component="h2" 
                onClick={() => setRequestsTab(0)}
                sx={{ 
                  cursor: 'pointer',
                  fontWeight: requestsTab === 0 ? 'bold' : 'normal',
                  mr: 4
                }}
              >
                {roleTab === 0 ? 'Active Volunteering' : 'Active Requests'}
              </Typography>
              <Typography 
                variant="h6" 
                component="h2"
                onClick={() => setRequestsTab(1)}
                sx={{ 
                  cursor: 'pointer',
                  fontWeight: requestsTab === 1 ? 'bold' : 'normal'
                }}
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
                  sx={{ 
                    mt: 2, 
                    borderRadius: '20px',
                    px: 3,
                    py: 1
                  }}
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
                  sx={{ 
                    mt: 2, 
                    borderRadius: '20px',
                    px: 3,
                    py: 1
                  }}
                >
                  Find Tasks to Help With
                </Button>
              </Box>
            )}
            
            {/* Active/Past Requests Grid Layout */}
            <Box sx={{ mb: 4 }}>
              {requestsTab === 0 ? (
                <Grid container spacing={2}>
                  {activeRequests.length > 0 ? (
                    activeRequests.map((request) => (
                      <Grid item xs={12} sm={6} key={request.id}>
                        <RequestCard 
                          request={request} 
                          userRole={roleTab === 0 ? 'volunteer' : 'requester'}
                        />
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      {/* Empty state content is above */}
                    </Grid>
                  )}
                </Grid>
              ) : (
                <Grid container spacing={2}>
                  {pastRequests.length > 0 ? (
                    pastRequests.map((request) => (
                      <Grid item xs={12} sm={6} key={request.id}>
                        <RequestCard 
                          request={request}
                          userRole={roleTab === 0 ? 'volunteer' : 'requester'}
                        />
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Typography align="center" color="text.secondary">
                        No past {roleTab === 0 ? 'volunteering' : 'requests'}.
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              )}
            </Box>
          </Box>
          
          {/* Reviews section */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mr: 2 }}>
                Reviews
              </Typography>
              <Chip 
                label={`${user.rating} (${reviews.length} reviews)`}
                color="primary"
                size="small"
                sx={{ 
                  backgroundColor: '#FFB6C1', 
                  color: '#333',
                  '& .MuiChip-label': { px: 1 } 
                }}
              />
            </Box>
            <Box>
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <Box key={review.id} sx={{ mb: 2 }}>
                    <ReviewCard review={review} />
                  </Box>
                ))
              ) : (
                <Typography>No reviews yet.</Typography>
              )}
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default ProfilePage;