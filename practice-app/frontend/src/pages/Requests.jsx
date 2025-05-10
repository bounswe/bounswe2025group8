import React from 'react';
import { Container, Grid, Typography, Box } from '@mui/material';
import RequestCard from '../components/RequestCard';
import { useNavigate } from 'react-router-dom';

// Sample request data - in a real app this would come from an API
const sampleRequests = [
  {
    id: '1',
    title: 'Help me to see a doctor',
    categories: ['Healthcare'],
    urgency: 'High',
    distance: '2 km away',
    postedTime: '3 hours ago',
    imageUrl: 'https://images.unsplash.com/photo-1631815588090-d1bcbe9b4b22?q=80&w=1632&auto=format&fit=crop'
  },
  {
    id: '2',
    title: 'Need help moving furniture to my new apartment',
    categories: ['Moving Help', 'Heavy Lifting'],
    urgency: 'Medium',
    distance: '1.5 km away',
    postedTime: '5 hours ago',
    imageUrl: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=1374&auto=format&fit=crop'
  },
  {
    id: '3',
    title: 'Looking for someone to help clean my house before guests arrive',
    categories: ['House Cleaning', 'Home Maintenance'],
    urgency: 'High',
    distance: '0.8 km away',
    postedTime: '2 hours ago',
  },
  {
    id: '4',
    title: 'Need help with grocery shopping for elderly parents',
    categories: ['Grocery Shopping', 'Elderly Care'],
    urgency: 'Medium',
    distance: '3 km away',
    postedTime: '1 day ago',
    imageUrl: 'https://images.unsplash.com/photo-1579113800032-c38bd7635818?q=80&w=1374&auto=format&fit=crop'
  },
  {
    id: '5',
    title: 'Math tutor needed for high school student',
    categories: ['Tutoring', 'Education'],
    urgency: 'Low',
    distance: '5 km away',
    postedTime: '2 days ago',
  },
  {
    id: '6',
    title: 'Need help fixing a leaky faucet and clogged drain',
    categories: ['Home Repair', 'Plumbing'],
    urgency: 'Medium',
    distance: '1 km away',
    postedTime: '6 hours ago',
    imageUrl: 'https://images.unsplash.com/photo-1615266508370-7778b0065abb?q=80&w=1470&auto=format&fit=crop'
  }
];

const Requests = () => {
  const navigate = useNavigate();
  const handleRequestClick = (requestId) => {
    // Navigate to individual request page
    navigate(`/requests/${requestId}`);
  };
  return (
    <>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Help Requests
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Browse open requests in your area and offer your help
        </Typography>
      </Box>
      
      <Grid container spacing={3} justifyContent="flex-start">
        {sampleRequests.map((request) => (
          <Grid item xs={12} sm={6} md={6} lg={4} key={request.id}>
            <RequestCard
              request={request}
              onClick={handleRequestClick}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default Requests;
