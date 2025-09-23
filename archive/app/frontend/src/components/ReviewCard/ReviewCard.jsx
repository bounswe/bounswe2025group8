import React from 'react';
import { Box, Typography, Avatar, Rating, Paper } from '@mui/material';
import { formatDate, formatRelativeTime } from '../../utils/dateUtils';

const ReviewCard = ({ review }) => {

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 2, 
        mb: 2, 
        borderRadius: 2,
        border: '1px solid #f0f0f0'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar 
            src={review.reviewer?.profilePicture || `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 100)}.jpg`} 
            alt={review.reviewer?.name || 'User'} 
          />
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">
              {review.reviewer?.name || 'Anonymous User'}
            </Typography>
            <Rating value={review.score || 0} readOnly size="small" />
          </Box>
        </Box>
        <Typography variant="caption" color="text.secondary">
          {review.timestamp ? formatDate(review.timestamp) : 'N/A'}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ mt: 1 }}>
        {review.comment || 'No comment provided'}
      </Typography>
    </Paper>
  );
};

export default ReviewCard;