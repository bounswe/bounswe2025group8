import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Chip, 
  Button, 
  Divider, 
  Avatar,
  useTheme,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  IconButton,
  Alert,
  Snackbar
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import { getTaskById as getRequestById } from '../features/request/services/requestService';
import { cancelTask } from '../features/request/services/createRequestService'; // Add this import
import { useAppSelector } from '../store/hooks';
import { selectCurrentUser, selectIsAuthenticated } from '../features/authentication/store/authSlice';
import Sidebar from '../components/Sidebar';




const RequestDetail = () => {
  const { requestId } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Authentication state
  const currentUser = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  
  // State for request data, loading, and error
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Add these new state variables
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  
  // Fetch request details
  useEffect(() => {
    const fetchRequest = async () => {
      try {
        console.log('Fetching request with ID:', requestId);
        setLoading(true);
        setError(null);
        const requestData = await getRequestById(requestId);
        console.log('Received request data:', requestData);
        setRequest(requestData);
      } catch (err) {
        console.error('Error fetching request:', err);
        console.error('Error details:', err.response?.data);
        
        // Fallback to mock data for development
        console.log('Falling back to mock data...');
        try {
          const { getMockTaskById } = await import('../features/request/services/requestService');
          const mockData = getMockTaskById(requestId);
          if (mockData) {
            console.log('Using mock data:', mockData);
            setRequest(mockData);
          } else {
            setError(err.response?.data?.message || err.message || 'Failed to fetch request details');
          }
        } catch (mockError) {
          console.error('Mock data fallback failed:', mockError);
          setError(err.response?.data?.message || err.message || 'Failed to fetch request details');
        }
      } finally {
        setLoading(false);
      }
    };

    if (requestId) {
      fetchRequest();
    }
  }, [requestId]);

  // Urgency level mapping
  const getUrgencyLevel = (level) => {
    if (level >= 3) return { label: 'High', color: '#f44336' };
    if (level >= 2) return { label: 'Medium', color: '#ff9800' };
    return { label: 'Low', color: '#4caf50' };
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Get time ago
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress />
        <Typography variant="body1" color="text.secondary">
          Loading request details...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
            <Typography variant="h5" color="error" gutterBottom>
              Error loading request
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {error}
            </Typography>
            <Button 
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/requests')}
              sx={{ mt: 2 }}
            >
              Back to Requests
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  // Request not found
  if (!request) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
            <Typography variant="h5" gutterBottom>
              Request not found
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              The request you're looking for doesn't exist or has been removed.
            </Typography>
            <Button 
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/requests')}
              sx={{ mt: 2 }}
            >
              Back to Requests
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  const urgency = getUrgencyLevel(request.urgency_level);

  // Permission checks
  const isTaskCreator = currentUser && request && currentUser.id === request.creator?.id;
  const canEdit = isAuthenticated && isTaskCreator;
  const canDelete = isAuthenticated && isTaskCreator;
  const canVolunteer = isAuthenticated && !isTaskCreator && request?.status === 'POSTED';

  // Button handlers
  const handleEditTask = () => {
    if (canEdit) {
      console.log('Edit task:', request.id);
      // TODO: Navigate to edit page or open edit modal
      navigate(`/requests/${request.id}/edit`);
    }
  };

  const handleDeleteTask = async () => {
    if (canDelete) {
      if (window.confirm('Are you sure you want to delete this task?')) {
        try {
          setIsDeleting(true);
          setDeleteError(null);
          
          await cancelTask(request.id);
          
          setDeleteSuccess(true);
          // Redirect after a short delay
          setTimeout(() => {
            navigate('/requests');
          }, 1500);
        } catch (err) {
          console.error('Error deleting request:', err);
          setDeleteError(err.response?.data?.message || err.message || 'Failed to delete request');
        } finally {
          setIsDeleting(false);
        }
      }
    }
  };

  const handleVolunteer = () => {
    if (canVolunteer) {
      console.log('Volunteer for task:', request.id);
      // TODO: Implement volunteer API call
      console.log('Volunteering for task...');
    }
  };

  const handleSelectVolunteer = () => {
    if (canEdit) {
      console.log('Select volunteer for task:', request.id);
      // TODO: Navigate to volunteer selection page or open modal
      console.log('Opening volunteer selection...');
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Sidebar */}
      <Sidebar />
      
      {/* Success message */}
      <Snackbar
        open={deleteSuccess}
        autoHideDuration={5000}
        onClose={() => setDeleteSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Request deleted successfully! Redirecting...
        </Alert>
      </Snackbar>
      
      {/* Error message */}
      <Snackbar
        open={!!deleteError}
        autoHideDuration={5000}
        onClose={() => setDeleteError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          {deleteError}
        </Alert>
      </Snackbar>
      
      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Back Button and Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton 
            onClick={() => navigate('/requests')}
            sx={{ mr: 2, color: 'text.secondary' }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            {request.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip 
              label={request.category_display}
              sx={{ 
                bgcolor: '#e3f2fd', 
                color: '#1976d2',
                fontWeight: 'medium'
              }}
            />
            <Chip 
              label={`${urgency.label} Urgency`}
              sx={{ 
                bgcolor: urgency.color,
                color: 'white',
                fontWeight: 'medium'
              }}
            />
            <IconButton>
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Main Content Card */}
        <Card sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}>
          <Grid container>
            {/* Left Column - Image */}
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src={request.photos?.[0]?.image || request.photos?.[0]?.photo_url || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop'}
                alt={request.title}
                sx={{
                  width: '100%',
                  height: 400,
                  objectFit: 'cover'
                }}
              />
            </Grid>
            
            {/* Right Column - Details */}
            <Grid item xs={12} md={6}>
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Requester Info */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar 
                    sx={{ 
                      width: 50, 
                      height: 50, 
                      mr: 2,
                      bgcolor: theme.palette.primary.main
                    }}
                  >
                    {request.creator.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="medium">
                      {request.creator.name} {request.creator.surname}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {getTimeAgo(request.created_at)}
                    </Typography>
                  </Box>
                </Box>

                {/* Description */}
                <Typography variant="body1" paragraph sx={{ flexGrow: 1 }}>
                  {request.description}
                </Typography>

                {/* Details */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {formatDate(request.deadline)} - {formatTime(request.deadline)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {request.location}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {request.volunteer_number} person{request.volunteer_number > 1 ? 's' : ''} required
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {request.creator.phone_number}
                    </Typography>
                  </Box>
                </Box>

                {/* Status */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {request.status === 'POSTED' ? 'Waiting for Volunteers' : 
                   request.status === 'ASSIGNED' ? 'Task Assigned' :
                   request.status === 'IN_PROGRESS' ? 'In Progress' :
                   request.status === 'COMPLETED' ? 'Completed' : 'Unknown Status'}
                </Typography>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Primary Action Button */}
                  {canEdit && request.status === 'POSTED' && (
                    <Button 
                      variant="contained" 
                      size="large"
                      onClick={handleSelectVolunteer}
                      sx={{ 
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '1rem',
                        bgcolor: '#7c4dff',
                        '&:hover': {
                          bgcolor: '#6a3de8'
                        }
                      }}
                    >
                      Select Volunteer
                    </Button>
                  )}

                  {canVolunteer && (
                    <Button 
                      variant="contained" 
                      size="large"
                      startIcon={<VolunteerActivismIcon />}
                      onClick={handleVolunteer}
                      sx={{ 
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '1rem',
                        bgcolor: '#4caf50',
                        '&:hover': {
                          bgcolor: '#45a049'
                        }
                      }}
                    >
                      Volunteer for this Task
                    </Button>
                  )}

                  {!isAuthenticated && (
                    <Button 
                      variant="contained" 
                      size="large"
                      onClick={() => navigate('/login')}
                      sx={{ 
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '1rem',
                        bgcolor: '#2196f3',
                        '&:hover': {
                          bgcolor: '#1976d2'
                        }
                      }}
                    >
                      Login to Volunteer
                    </Button>
                  )}
                  
                  {/* Secondary Action Buttons - Only for Task Creator */}
                  {canEdit && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={handleEditTask}
                        sx={{ 
                          flex: 1,
                          textTransform: 'none',
                          borderColor: '#ffc107',
                          color: '#ff8f00',
                          '&:hover': {
                            borderColor: '#ff8f00',
                            bgcolor: '#fff3e0'
                          }
                        }}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outlined"
                        startIcon={isDeleting ? <CircularProgress size={20} /> : <DeleteIcon />}
                        onClick={handleDeleteTask}
                        disabled={isDeleting}
                        sx={{ 
                          flex: 1,
                          textTransform: 'none',
                          borderColor: '#f44336',
                          color: '#f44336',
                          '&:hover': {
                            borderColor: '#d32f2f',
                            bgcolor: '#ffebee'
                          }
                        }}
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </Button>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Grid>
          </Grid>
        </Card>
      </Box>
    </Box>
  );
};

export default RequestDetail;
