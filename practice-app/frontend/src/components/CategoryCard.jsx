import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, useTheme } from '@mui/material';

/**
 * CategoryCard component that displays a category with an image
 * @param {Object} props
 * @param {string} props.title - The title of the category
 * @param {string} props.image - The URL of the image to display
 * @param {Function} props.onClick - Function called when card is clicked
 * @param {Object} props.sx - Additional MUI sx styles to apply
 */
const CategoryCard = ({ title, image, onClick, sx = {} }) => {
  const theme = useTheme();

  return (
    <Card
      elevation={2}
      onClick={onClick}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3, // Slightly reduced radius (12px) to match design
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        // Fixed dimensions that adjust responsively
        width: {
          xs: '100%', // Full width on mobile
          sm: '200px', // Fixed width on tablet and up
        },
        height: '270px', // Increased height to accommodate padding
        backgroundColor: 'white',
        mx: 'auto', // Center the card horizontally
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
        ...sx,
      }}
    >
      {/* Title at top with proper padding and styling */}{' '}
      <CardContent
        sx={{
          p: 1.5,
          pt: 2,
          pb: 0,
          pl: 3,
          height: 'auto', // Remove fixed height to eliminate gaps
          display: 'flex',
          alignItems: 'flex-start', // Align to top instead of center
          justifyContent: 'flex-start', // Left align content
        }}
      >
        {' '}
        <Typography
          variant="h6"
          component="div"
          fontWeight="bold"
          align="left"
          sx={{
            fontSize: '1.1rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            mt: 2,
            mb: 1,
            lineHeight: 1.3, // Tighter line height
          }}
        >
          {title}
        </Typography>
      </CardContent>{' '}
      {/* Image below title with proper sizing and rounded corners */}
      <Box
        sx={{
          px: 3, // Add horizontal padding
          pb: 3, // Add bottom padding
          pt: 1, // Top padding
          flexGrow: 1,
          display: 'flex',
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            borderRadius: 3, // Add rounded corners
            overflow: 'hidden',
            flexGrow: 1,
          }}
        >
          <CardMedia
            component="img"
            image={image}
            alt={`${title} category`}
            sx={{
              height: '100%',
              width: '100%',
              objectFit: 'cover',
            }}
          />{' '}
        </Box>
      </Box>
    </Card>
  );
};

export default CategoryCard;
