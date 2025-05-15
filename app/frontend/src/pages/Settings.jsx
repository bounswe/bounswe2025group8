import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';

const Settings = () => {
  const navigate = useNavigate();
  
  const goToHome = () => {
    navigate('/');
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        my: 8,
        textAlign: 'center'
      }}
    >
      <Paper 
        elevation={2} 
        sx={{ 
          p: 4, 
          borderRadius: 2, 
          maxWidth: 600, 
          width: '100%' 
        }}
      >
        <SettingsIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        
        <Typography variant="h4" component="h1" gutterBottom>
          Settings Coming Soon
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          The settings page is currently under development. 
          Our team is working hard to implement this feature.
        </Typography>
        
        <Typography variant="body1" paragraph>
          Please check back soon for updates!
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          onClick={goToHome}
          sx={{ mt: 2 }}
        >
          Return to Home
        </Button>
      </Paper>
    </Box>
  );
};

export default Settings;
