import React from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Chip, 
  Button, 
  Divider, 
  Avatar,
  useTheme
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// This would come from an API in a real application
const getRequestById = (id) => {
  // Sample data - in a real app, this would fetch from an API
  const sampleRequests = [
    {
      id: '1',
      title: 'Help me to see a doctor',
      categories: ['Healthcare'],
      urgency: 'High',
      distance: '2 km away',
      postedTime: '3 hours ago',
      description: 'I need someone to accompany me to a doctor appointment tomorrow. I have difficulty walking and need assistance with transportation and getting around the hospital.',
      location: '123 Main Street',
      requesterName: 'Alex Johnson',
      requesterAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      imageUrl: 'https://images.unsplash.com/photo-1631815588090-d1bcbe9b4b22?q=80&w=1632&auto=format&fit=crop'
    },
    {
      id: '2',
      title: 'Need help moving furniture to my new apartment',
      categories: ['Moving Help', 'Heavy Lifting'],
      urgency: 'Medium',
      distance: '1.5 km away',
      postedTime: '5 hours ago',
      description: 'I\'m moving to a new apartment and need help with moving a couch, bed, and some boxes. The building has an elevator, so it shouldn\'t be too difficult.',
      location: '456 Oak Avenue',
      requesterName: 'Jamie Smith',
      requesterAvatar: 'https://randomuser.me/api/portraits/women/45.jpg',
      imageUrl: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=1374&auto=format&fit=crop'
    },
    {
      id: '3',
      title: 'Looking for someone to help clean my house before guests arrive',
      categories: ['House Cleaning', 'Home Maintenance'],
      urgency: 'High',
      distance: '0.8 km away',
      postedTime: '2 hours ago',
      description: 'I have family coming over this weekend and need help cleaning my 2-bedroom apartment. Tasks include vacuuming, dusting, bathroom cleaning, and kitchen cleaning.',
      location: '789 Pine Street',
      requesterName: 'Robin Taylor',
      requesterAvatar: 'https://randomuser.me/api/portraits/women/22.jpg',
    }
  ];

  return sampleRequests.find(request => request.id === id) || null;
};

const RequestDetail = () => {
  const { requestId } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Get request details
  const request = getRequestById(requestId);
  
  // Color mapping for urgency levels
  const urgencyColors = {
    'High': theme.palette.error.main,
    'Medium': theme.palette.warning.main,
    'Low': theme.palette.info.main
  };
  
  if (!request) {
    return (
      <>
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="h5">Request not found</Typography>
          <Button 
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/requests')}
            sx={{ mt: 2 }}
          >
            Back to Requests
          </Button>
        </Box>
      </>
    );
  }

  const handleCategoryClick = (category) => {
    navigate(`/categories/${category.toLowerCase().replace(' ', '-')}`);
  };

  return (
    <>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/requests')}
        sx={{ mb: 3 }}
      >
        Back to Requests
      </Button>
      
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Paper sx={{ p: 0, overflow: 'hidden', mb: 4, borderRadius: 2 }}>
          {/* Request Image (if available) */}
          {request.imageUrl && (
            <Box 
              component="img"
              src={request.imageUrl}
              alt={request.title}
              sx={{ 
                width: '100%',
                height: 250,
                objectFit: 'cover'
              }}
            />
          )}
          
          <Box sx={{ p: 3 }}>
            {/* Title - left aligned and bold */}
            <Typography variant="h5" component="h1" fontWeight="bold" align="left" gutterBottom>
              {request.title}
            </Typography>
              {/* Posted Time */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 2, mb: 2 }}>            
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Posted {request.postedTime}
                </Typography>
              </Box>
              
              {/* Location */}
              {request.location && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOnIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {request.location}
                  </Typography>
                </Box>
              )}
              
              {/* Urgency indicator */}
              {request.urgency === 'High' && (
                <Box 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: '16px',
                    bgcolor: urgencyColors[request.urgency],
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 'medium'
                  }}
                >
                  <PriorityHighIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
                  High Urgency
                </Box>
              )}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            {/* Description */}
            <Typography variant="body1" paragraph>
              {request.description}
            </Typography>
            
            {/* Categories */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Categories
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {request.categories.map((category) => (
                  <Chip
                    key={category}
                    label={category}
                    onClick={() => handleCategoryClick(category)}
                    sx={{ 
                      borderRadius: '16px',
                      bgcolor: theme.palette.action.hover,
                      '&:hover': {
                        bgcolor: theme.palette.action.selected,
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </Paper>
        
        {/* Requester Info */}
        <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight="500">
            Request Posted By
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            {request.requesterAvatar ? (
              <Avatar 
                src={request.requesterAvatar} 
                alt={request.requesterName}
                sx={{ width: 50, height: 50, mr: 2 }}
              />
            ) : (
              <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2, width: 50, height: 50 }}>
                <PersonIcon />
              </Avatar>
            )}
            
            <Typography variant="body1">
              {request.requesterName}
            </Typography>
          </Box>
        </Paper>
        
        {/* Action Button */}
        <Button 
          variant="contained" 
          size="large" 
          fullWidth 
          sx={{ 
            py: 1.5,
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '1.1rem',
            mb: 4
          }}
        >
          Offer Help
        </Button>
      </Box>
    </>
  );
};

export default RequestDetail;
