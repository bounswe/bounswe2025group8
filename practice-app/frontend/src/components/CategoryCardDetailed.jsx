import React from 'react';
import { 
  Card, 
  Typography, 
  Box,
  useTheme 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

/**
 * CategoryCardDetailed component displays a category with an image and request count
 * 
 * @param {Object} props
 * @param {string} props.title - The title of the category
 * @param {string} props.imageUrl - The URL of the image to display
 * @param {number} props.requestCount - Number of requests in this category
 * @param {string} props.categoryId - ID used for navigation when card is clicked
 * @param {Function} props.onClick - Optional custom click handler
 * @param {Object} props.sx - Additional MUI sx styles to apply
 */
const CategoryCardDetailed = ({ 
  title, 
  imageUrl, 
  requestCount = 0,
  categoryId,
  onClick,
  sx = {} 
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(categoryId);
    } else if (categoryId) {
      // Default navigation to category page if no custom handler provided
      navigate(`/categories/${categoryId}`);
    }
  };

  return (
    <Card
      onClick={handleClick}
      elevation={1}
      sx={{
        display: 'flex',
        alignItems: 'center',
        borderRadius: 4,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        overflow: 'hidden',
        backgroundColor: 'white',
        p: 1.5,        width: {
          xs: '100%',    // Full width on mobile
          sm: '400px'    // Adjusted width to better fit two per row
        },
        height: '90px',  // Fixed height for consistent appearance
        maxWidth: '100%',  // Ensure it doesn't overflow its container
        '&:hover': {
          boxShadow: theme.shadows[3],
          transform: 'translateY(-2px)'
        },
        ...sx
      }}
    >
      {/* Image Container - Left Side */}
      <Box
        sx={{
          width: 70,
          height: 70,
          borderRadius: 2.5,
          overflow: 'hidden',
          border: `1px solid ${theme.palette.grey[200]}`,
          flexShrink: 0,
          mr: 2,
          backgroundColor: theme.palette.grey[100]
        }}
      >
        {imageUrl ? (
          <Box
            component="img"
            src={imageUrl}
            alt={title}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.palette.grey[200]
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No Image
            </Typography>
          </Box>
        )}
      </Box>

      {/* Content Container - Right Side */}
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {/* Title */}
        <Typography
          variant="subtitle1"
          component="div"
          fontWeight="bold"
          sx={{
            color: theme.palette.text.primary,
            mb: 0.5
          }}
        >
          {title}
        </Typography>

        {/* Request Count */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ 
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {requestCount} {requestCount === 1 ? 'request' : 'requests'}
        </Typography>
      </Box>
    </Card>
  );
};

export default CategoryCardDetailed;