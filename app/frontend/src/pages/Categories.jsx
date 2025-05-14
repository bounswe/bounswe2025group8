import React, { useState, useEffect } from 'react';
import { Grid, Typography, Box, Divider, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CategoryCardDetailed from '../components/CategoryCardDetailed';
import * as categoryService from '../services/categoryService';
import { getCategoryImage, categoryMapping } from '../constants/categories';

const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const categoriesData = await categoryService.getCategories();
        
        // Transform API response to match UI component expectations
        const formattedCategories = categoriesData.map((category) => ({
          id: category.value,
          title: categoryMapping[category.value] || category.name,
          image: getCategoryImage(category.value),
          requestCount: category.task_count || 0,
        }));
        
        setCategories(formattedCategories);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Failed to load categories. Please try again later.");
        // Clear categories on error
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId) => {
    // Navigate to requests filtered by this category
    navigate(`/requests?category=${categoryId}`);
  };

  return (
    <>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Categories
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Browse available service categories and find help with your tasks
        </Typography>
      </Box>

      <Divider sx={{ my: 4 }} />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      ) : (
        /* All Categories in Detailed Format */
        <Grid container spacing={4} sx={{ mt: 2 }} justifyContent="center">
          {categories.length > 0 ? (
            categories.map((category) => (
              <Grid item xs={12} sm={12} md={6} lg={6} key={category.id}>
                <CategoryCardDetailed
                  title={category.title}
                  imageUrl={category.image}
                  requestCount={category.requestCount}
                  categoryId={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                />
              </Grid>
            ))
          ) : (
            <Box sx={{ width: "100%", textAlign: "center", py: 6 }}>
              <Typography color="text.secondary">No categories available</Typography>
            </Box>
          )}
        </Grid>
      )}
    </>
  );
};

export default Categories;
