import React from 'react';
import { Box, Typography, Tooltip, CircularProgress } from '@mui/material';
import { Icon } from '@mui/material';
import { formatDate } from '../../utils/dateUtils';

const Badge = ({ badge }) => {
  const { title, description, icon, image, color, earned, earnedDate, progress } = badge;
  
  // Determine opacity based on earned status
  const opacity = earned ? 1 : 0.5;
  
  return (
    <Tooltip
      title={
        <Box>
          <Typography variant="subtitle2">{title}</Typography>
          <Typography variant="body2">{description}</Typography>
          {earned && earnedDate && (
            <Typography variant="caption">
              Earned on {formatDate(earnedDate, 'MMM d, yyyy')}
            </Typography>
          )}
          {!earned && progress !== undefined && (
            <Typography variant="caption">
              {progress}% complete
            </Typography>
          )}
        </Box>
      }
      arrow
    >
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: 70,
          height: 90,
          opacity,
          transition: 'transform 0.2s, opacity 0.2s',
          '&:hover': {
            transform: 'scale(1.05)',
            opacity: 1,
          },
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: earned ? '0 3px 8px rgba(0,0,0,0.2)' : 'none',
            mb: 1,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {!earned && progress !== undefined && (
            <CircularProgress
              variant="determinate"
              value={progress}
              size={56}
              thickness={4}
              sx={{
                position: 'absolute',
                color: color,
                opacity: 0.8,
              }}
            />
          )}
          
          {/* Display either image or icon based on what's provided */}
          {image ? (
            <Box
              component="img"
              src={image}
              alt={title}
              sx={{
                width: 36,
                height: 36,
                objectFit: 'cover',
                borderRadius: '50%',
              }}
            />
          ) : (
            <Icon sx={{ color: 'white', fontSize: 30 }}>{icon}</Icon>
          )}
        </Box>
        <Typography
          variant="caption"
          align="center"
          noWrap
          sx={{
            width: '100%',
            fontWeight: earned ? 'bold' : 'normal',
          }}
        >
          {title}
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default Badge;