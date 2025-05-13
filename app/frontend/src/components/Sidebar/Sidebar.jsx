import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Button, Typography } from '@mui/material';
import { Home, Category, List as ListIcon, Add, Notifications, Settings } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const navigate = useNavigate();
  
  // Handle navigation to user profile
  const handleProfileClick = () => {
    navigate('/profile/current');
  };
  
  return (
    <Box
      sx={{
        width: 240,
        flexShrink: 0,
        borderRight: '1px solid #eee',
        display: { xs: 'none', sm: 'block' },
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
      }}
    >
      <Box sx={{ p: 2, pb:1, display: 'flex', justifyContent: 'center' }}>
        <img src="/images/logo.png" alt="Logo" width={102} height={71} />
      </Box>
      <List>
        <ListItem button component={Link} to="/">
          <ListItemIcon>
            <Home sx={{ color: '#5C69FF' }} />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem button component={Link} to="/categories">
          <ListItemIcon>
            <Category sx={{ color: '#5C69FF' }} />
          </ListItemIcon>
          <ListItemText primary="Categories" />
        </ListItem>
        <ListItem button component={Link} to="/requests">
          <ListItemIcon>
            <ListIcon sx={{ color: '#5C69FF' }} />
          </ListItemIcon>
          <ListItemText primary="Requests" />
        </ListItem>
      </List>
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<Add />}
          sx={{
            backgroundColor: '#5C69FF',
            borderRadius: '30px',
            py: 1,
            textTransform: 'none',
          }}
          component={Link}
          to="/create-request"
        >
          Create Request
        </Button>
      </Box>
      
      {/* User info at bottom */}
      <Box 
        onClick={handleProfileClick}
        sx={{ 
          position: 'absolute', 
          bottom: 0, 
          width: '100%', 
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
          transition: 'background-color 0.2s',
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
          borderTop: '1px dashed #eee'
        }}
      >
        <Box
          component="img"
          src="https://randomuser.me/api/portraits/men/32.jpg"
          alt="User"
          sx={{ 
            width: 40, 
            height: 40, 
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />
        <Box>
          <Typography variant="subtitle2">Batuhan Buber</Typography>
        </Box>
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          <Notifications 
            fontSize="small" 
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering the parent onClick
              // Handle notifications click
            }} 
            sx={{ 
              '&:hover': {
                backgroundColor: '#d5d5d5',
                borderRadius: '50%'
              },
            }}
          />
          <Settings 
            fontSize="small" 
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering the parent onClick
              navigate('/settings');
            }}
            sx={{ 
              '&:hover': {
                backgroundColor: '#d5d5d5',
                borderRadius: '50%'
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;