import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Button, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CategoryCard from '../components/categoryCard';
import RequestCard from '../components/RequestCard'; // Import the RequestCard component

const Home = () => {
  const navigate = useNavigate();

  // Mock popular categories data - in a real app, this would come from an API
  const popularCategories = useMemo(
    () => [
      { id: 1, title: 'Home Cleaning', image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf', requestCount: 24 },
      {
        id: 2,
        title: 'Technical Support',
        image: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&w=500&q=80',
        requestCount: 18,
      },
      { id: 3, title: 'Home Repairs', image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39', requestCount: 32 },
      {
        id: 4,
        title: 'Professional Advice',
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40',
        requestCount: 15,
      },
    ],
    []
  );

  // Mock popular requests data
  const popularRequests = useMemo(
    () => [
      {
        id: 101,
        title: 'Need help with plumbing repairs',
        description: 'Leaking sink that needs immediate attention',
        categories: ['HOME_REPAIR', 'PLUMBING'],
        imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a',
        urgency: 'High',
        location: 'Downtown',
        date: '2023-06-15',
        status: 'Open',
        postedTime: '2 days ago',
        distance: '1.2 km away',
      },
      {
        id: 102,
        title: 'Computer not starting after update',
        description: 'My laptop won\'t boot after the latest Windows update',
        categories: ['TECHNICAL_SUPPORT'],
        urgency: 'Medium',
        location: 'Remote',
        date: '2023-06-14',
        status: 'Open',
        postedTime: '3 days ago',
        distance: '3.5 km away',
      },
      {
        id: 103,
        title: 'Deep cleaning for 2-bedroom apartment',
        description: 'Need thorough cleaning of my apartment including carpets',
        categories: ['HOME_CLEANING'],
        urgency: 'Low',
        location: 'North Side',
        date: '2023-06-18',
        status: 'Open',
        postedTime: '1 day ago',
        distance: '2.1 km away',
      },
      {
        id: 104,
        title: 'Tax advice for small business',
        description: 'Need consultation about tax deductions for my new business',
        categories: ['PROFESSIONAL_ADVICE'],
        urgency: 'Medium',
        location: 'Remote',
        date: '2023-06-16',
        status: 'Open',
        postedTime: '5 hours ago',
        distance: 'Remote',
      },
      {
        id: 105,
        title: 'Kitchen cabinet installation',
        description: 'Need help installing new kitchen cabinets and countertop',
        categories: ['HOME_REPAIR'],
        urgency: 'Medium',
        location: 'West End',
        date: '2023-06-20',
        status: 'Open',
        postedTime: '12 hours ago',
        distance: '4.7 km away',
      },
      {
        id: 106,
        title: 'WiFi network setup for home office',
        description: 'Need help setting up a secure network for remote work',
        categories: ['TECHNICAL_SUPPORT'],
        urgency: 'Low',
        location: 'Southside',
        date: '2023-06-19',
        status: 'Open',
        postedTime: '1 day ago',
        distance: '3.0 km away',
      },
    ],
    []
  );

  const [categories, setCategories] = useState([]);
  const [requests, setRequests] = useState([]);

  // Simulate fetching categories and requests from an API
  useEffect(() => {
    // In a real app, these would be API calls
    setCategories(popularCategories);
    setRequests(popularRequests);
  }, [popularCategories, popularRequests]);

  return (
    <>
      {/* Popular Categories Section */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'medium' }}>
            Popular Categories
          </Typography>
          {categories.length > 4 && (
            <Button
              variant="text"
              color="primary"
              onClick={() => navigate('/categories')}
              size="small"
            >
              See All
            </Button>
          )}
        </Box>

        <Grid container spacing={2} sx={{ mt: 2, justifyContent: 'center' }}>
          {categories.slice(0, 4).map((category) => (
            <Grid item xs={6} sm={6} md={3} lg={3} key={category.id}>
              <CategoryCard
                title={category.title}
                image={category.image}
                categoryId={category.id}
                onClick={() => navigate(`/categories/${category.id}`)}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Popular Requests Section */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'medium' }}>
            Popular Requests
          </Typography>
          {requests.length > 6 && (
            <Button
              variant="text"
              color="primary"
              onClick={() => navigate('/requests')}
              size="small"
            >
              See All
            </Button>
          )}
        </Box>

        <Grid container spacing={3} sx={{ mt: 2 , justifyContent:'center'}}>
          {requests.slice(0, 6).map((request) => (
            <Grid item xs={12} sm={6} key={request.id}>
              <RequestCard
                request={request}
                onClick={() => navigate(`/requests/${request.id}`)}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
};

export default Home;