import React from 'react';
import { Box, Typography, Chip, Paper, Avatar, Badge } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import styles from './RequestCard.module.css';

const RequestCard = ({ request, userRole = 'requester' }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/requests/${request.id}`);
  };
  
  // Style based on urgency
  const getUrgencyStyle = (urgency) => {
    switch (urgency.toLowerCase()) {
      case 'high':
        return {
          bgcolor: '#F44336',
          color: 'white'
        };
      case 'medium':
        return {
          bgcolor: '#FF9800',
          color: 'white'
        };
      case 'low':
        return {
          bgcolor: '#4CAF50',
          color: 'white'
        };
      default:
        return {
          bgcolor: '#9E9E9E',
          color: 'white'
        };
    }
  };
  
  // Style based on status
  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return {
          bgcolor: '#5C69FF',
          color: 'white'
        };
      case 'pending':
        return {
          bgcolor: 'white',
          color: '#5C69FF',
          border: '1px solid #5C69FF'
        };
      case 'rejected':
        return {
          bgcolor: 'white',
          color: '#F44336',
          border: '1px solid #F44336'
        };
      case 'completed':
        return {
          bgcolor: '#4CAF50',
          color: 'white'
        };
      default:
        return {
          bgcolor: '#9E9E9E',
          color: 'white'
        };
    }
  };
  
  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 1.5, 
        borderRadius: 2,
        cursor: 'pointer',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        },
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      onClick={handleClick}
    >
      {/* Header with image and arrow */}
      <Box sx={{ display: 'flex', mb: 1 }}>
        <Box 
          component="img"
          src={request.image}
          alt={request.title}
          sx={{ 
            width: 70, 
            height: 70, 
            borderRadius: 2,
            objectFit: 'cover'
          }}
        />
        <Box sx={{ flexGrow: 1, ml: 1.5 }}>
          {/* Title */}
          <Typography variant="subtitle1" fontWeight="bold" mb={0.5}>
            {request.title}
          </Typography>
          
          {/* Distance and Time */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 1.5 }}>
              <LocationOnIcon fontSize="small" sx={{ color: '#9E9E9E', mr: 0.5 }} />
              <Typography variant="body2" color="text.secondary">
                {request.distance}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTimeIcon fontSize="small" sx={{ color: '#9E9E9E', mr: 0.5 }} />
              <Typography variant="body2" color="text.secondary">
                {request.timeAgo}
              </Typography>
            </Box>
          </Box>
          
          {/* Requester info (only shown when user is a volunteer) */}
          {userRole === 'volunteer' && request.requesterName && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PersonIcon fontSize="small" sx={{ color: '#9E9E9E' }} />
              <Typography variant="body2" color="text.secondary">
                {request.requesterName} ({request.requesterRating}★)
              </Typography>
            </Box>
          )}
          
          {/* Volunteer count (only shown when user is a requester) */}
          {userRole === 'requester' && request.volunteersCount !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PeopleIcon fontSize="small" sx={{ color: '#9E9E9E' }} />
              <Typography variant="body2" color="text.secondary">
                {request.volunteersCount} {request.volunteersCount === 1 ? 'volunteer' : 'volunteers'}
              </Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ArrowForwardIosIcon sx={{ color: '#9E9E9E' }} />
        </Box>
      </Box>
      
      {/* Category */}
      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
        <Chip
          label={request.category}
          size="small"
          sx={{ 
            bgcolor: '#EFF1FF', 
            color: '#5C69FF',
            width: '100%',
            borderRadius: '4px'
          }}
        />
      </Box>
      
      {/* Status and Urgency */}
      <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
        <Chip
          label={request.urgency + ' Urgency'}
          size="small"
          sx={{ 
            ...getUrgencyStyle(request.urgency), 
            flexGrow: 1,
            borderRadius: '4px'
          }}
        />
        <Chip
          label={request.status}
          size="small"
          sx={{ 
            ...getStatusStyle(request.status), 
            flexGrow: 1,
            borderRadius: '4px'
          }}
        />
      </Box>
    </Paper>
  );
};

export default RequestCard;