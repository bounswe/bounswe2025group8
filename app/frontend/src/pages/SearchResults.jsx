import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Tab, Tabs, Paper, Divider, CircularProgress } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import RequestCard from '../components/RequestCard';
import CategoryCardDetailed from '../components/CategoryCardDetailed';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Mock search results - in a real app, these would come from API calls
  const [results, setResults] = useState({
    requests: [],
    categories: [],
    users: []
  });
  
  // Simulate API call for search
  useEffect(() => {
    const fetchResults = async () => {
      // In a real app, this would be an API call
      setLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock results based on query
      // This is just for demonstration, in a real app you would fetch from backend
      const mockRequests = [
        { 
          id: '1', 
          title: `Request matching "${query}"`, 
          categories: ['Home Repair'], 
          urgency: 'Medium',
          distance: '1.2 km away',
          postedTime: '2 hours ago',
          imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1470&auto=format&fit=crop'
        },
        { 
          id: '2', 
          title: `Another result for "${query}"`, 
          categories: ['Technical Support'], 
          urgency: 'Low',
          distance: '3 km away',
          postedTime: '1 day ago'
        }
      ];
      
      const mockCategories = [
        { id: 1, title: 'Home Cleaning', image: 'https://via.placeholder.com/100', requestCount: 24 },
        { id: 2, title: 'Technical Support', image: 'https://via.placeholder.com/100', requestCount: 18 }
      ];
      
      const mockUsers = [
        { id: 1, name: 'John Doe', role: 'Admin', activity: 'System management' },
        { id: 2, name: 'Jane Smith', role: 'User', requests: 5 }
      ];
      
      setResults({
        requests: mockRequests,
        categories: mockCategories,
        users: mockUsers
      });
      
      setLoading(false);
    };
    
    fetchResults();
  }, [query]);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (activeTab === 0) { // All results
      return (
        <>
          {results.requests.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Requests</Typography>
              <Grid container spacing={3}>
                {results.requests.map(request => (
                  <Grid item xs={12} sm={6} md={6} lg={4} key={request.id}>
                    <RequestCard request={request} onClick={() => {}} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          
          <Divider sx={{ my: 3 }} />
          
          {results.categories.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Categories</Typography>
              <Grid container spacing={4}>
                {results.categories.map(category => (
                  <Grid item xs={12} sm={12} md={6} lg={6} key={category.id}>
                    <CategoryCardDetailed 
                      title={category.title}
                      imageUrl={category.image}
                      requestCount={category.requestCount}
                      categoryId={category.id}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          
          <Divider sx={{ my: 3 }} />
          
          {results.users.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Users</Typography>
              <Grid container spacing={2}>
                {results.users.map(user => (
                  <Grid item xs={12} sm={6} md={4} key={user.id}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1">{user.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.role} • {user.role === 'Admin' ? user.activity : `${user.requests} requests`}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          
          {results.requests.length === 0 && results.categories.length === 0 && results.users.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6">No results found for "{query}"</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Try a different search term or browse categories
              </Typography>
            </Box>
          )}
        </>
      );
    } else if (activeTab === 1) { // Requests
      return (
        <>
          {results.requests.length > 0 ? (
            <Grid container spacing={3}>
              {results.requests.map(request => (
                <Grid item xs={12} sm={6} md={4} key={request.id}>
                  <RequestCard request={request} onClick={() => {}} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6">No request results found for "{query}"</Typography>
            </Box>
          )}
        </>
      );
    } else if (activeTab === 2) { // Categories
      return (
        <>
          {results.categories.length > 0 ? (
            <Grid container spacing={4}>
              {results.categories.map(category => (
                <Grid item xs={12} sm={12} md={6} lg={6} key={category.id}>
                  <CategoryCardDetailed 
                    title={category.title}
                    imageUrl={category.image}
                    requestCount={category.requestCount}
                    categoryId={category.id}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6">No category results found for "{query}"</Typography>
            </Box>
          )}
        </>
      );
    } else { // Users
      return (
        <>
          {results.users.length > 0 ? (
            <Grid container spacing={2}>
              {results.users.map(user => (
                <Grid item xs={12} sm={6} md={4} key={user.id}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1">{user.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.role} • {user.role === 'Admin' ? user.activity : `${user.requests} requests`}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6">No user results found for "{query}"</Typography>
            </Box>
          )}
        </>
      );
    }
  };

  return (
    <>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Search Results
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {loading ? 'Searching...' : `Found results for "${query}"`}
        </Typography>
      </Box>
      
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="All" />
          <Tab label={`Requests (${results.requests.length})`} />
          <Tab label={`Categories (${results.categories.length})`} />
          <Tab label={`Users (${results.users.length})`} />
        </Tabs>
      </Paper>
      
      {renderContent()}
    </>
  );
};

export default SearchResults;
