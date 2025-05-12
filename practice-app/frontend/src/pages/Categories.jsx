import React from 'react';
import { Grid, Typography, Box, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CategoryCardDetailed from '../components/CategoryCardDetailed';

// Sample category images - in a real app these would likely come from an API
const CATEGORY_IMAGES = {
  GROCERY_SHOPPING:
    'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1374&auto=format&fit=crop',
  TUTORING:
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1470&auto=format&fit=crop',
  HOME_REPAIR:
    '',
  MOVING_HELP:
    '',
  HOUSE_CLEANING:
    'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=1374&auto=format&fit=crop',
  OTHER:
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1374&auto=format&fit=crop',
};

// Categories data - in a real app, this would come from an API
const categories = [
  { id: 'GROCERY_SHOPPING', title: 'Grocery Shopping', image: CATEGORY_IMAGES.GROCERY_SHOPPING },
  { id: 'TUTORING', title: 'Tutoring', image: CATEGORY_IMAGES.TUTORING },
  { id: 'HOME_REPAIR', title: 'Home Repair', image: CATEGORY_IMAGES.HOME_REPAIR },
  { id: 'MOVING_HELP', title: 'Moving Help', image: CATEGORY_IMAGES.MOVING_HELP },
  { id: 'HOUSE_CLEANING', title: 'House Cleaning', image: CATEGORY_IMAGES.HOUSE_CLEANING },
  { id: 'OTHER', title: 'Other Services', image: CATEGORY_IMAGES.OTHER },
];

const Categories = () => {
  const navigate = useNavigate();

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

      {/* All Categories in Detailed Format */}
      <Grid container spacing={4} sx={{ mt: 2 }} justifyContent="center">
        {categories.map((category) => (
          <Grid item xs={12} sm={12} md={6} lg={6} key={category.id}>
            <CategoryCardDetailed
              title={category.title}
              imageUrl={category.image}
              requestCount={Math.floor(Math.random() * 30) + 5} // Random number for demo
              categoryId={category.id}
              onClick={() => handleCategoryClick(category.id)}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default Categories;
