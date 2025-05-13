import React from 'react';
import { Box, Container, AppBar, Toolbar } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Searchbar from '../components/Searchbar';

const SIDEBAR_WIDTH = 260;

const MainLayout = () => {
  const navigate = useNavigate();

  const handleSearch = (query) => {
    console.log('Search query:', query);
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
      <Sidebar />
        {/* Fixed Search AppBar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          width: `calc(100% - ${SIDEBAR_WIDTH}px)`, 
          ml: `${SIDEBAR_WIDTH}px`,
          boxShadow: 1,
          bgcolor: 'background.paper', // Use theme background color
          color: 'text.primary', // Use theme text color
          zIndex: (theme) => theme.zIndex.drawer - 1, // Below drawer but above content
        }}
      >
        <Toolbar>
          <Box
            sx={{
              width: {
                xs: '100%',
                sm: '400px',
                md: '500px',
              },
              mx: 'auto',
            }}
          >
            <Searchbar
              onSearch={handleSearch}
              placeholder="Search across the app"
              autoFocus={false}
              defaultValue=""
            />
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0, // Remove padding
          marginLeft: `${SIDEBAR_WIDTH}px`,
          minHeight: '100vh',
          overflow: 'auto',
          width: `calc(100% - ${SIDEBAR_WIDTH}px)`, // Set explicit width
          
          mt: '64px', // Add top margin equal to AppBar height
        }}
      >
        {/* Full-width container */}
        <Container 
          maxWidth={false} // Remove MUI's default max width
          disableGutters // Remove default padding
          sx={{
            px: 3, // Add horizontal padding inside container
            py: 3, // Add vertical padding inside container
          }}
        >          
          {/* Main content outlet */}
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;