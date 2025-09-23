import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchPopularCategories,
  selectPopularCategories,
  selectCategoriesLoading,
  selectCategoriesError
} from '../../store/slices/categorySlice';
import { Box, Typography, Chip, Skeleton, Alert } from '@mui/material';

const PopularCategories = ({ limit = 5, onCategoryClick }) => {
  const dispatch = useDispatch();
  const popularCategories = useSelector(selectPopularCategories);
  const loading = useSelector(selectCategoriesLoading);
  const error = useSelector(selectCategoriesError);

  useEffect(() => {
    dispatch(fetchPopularCategories(limit));
  }, [dispatch, limit]);

  const handleCategoryClick = (categoryValue) => {
    if (onCategoryClick) {
      onCategoryClick(categoryValue);
    }
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load categories: {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Popular Categories
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {loading ? (
          // Loading skeletons
          Array.from(new Array(limit)).map((_, index) => (
            <Skeleton key={index} variant="rounded" width={100} height={32} />
          ))
        ) : popularCategories.length > 0 ? (
          // Display categories as clickable chips
          popularCategories.map((category) => (
            <Chip
              key={category.value}
              label={`${category.name} (${category.task_count})`}
              onClick={() => handleCategoryClick(category.value)}
              clickable
              color="primary"
              variant="outlined"
            />
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No categories found
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default PopularCategories;
