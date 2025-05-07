import { Box, Button, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, useTheme, Divider } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import CategoryIcon from '@mui/icons-material/Category';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser, selectUserRole, logout } from '../store/slices/authSlice.js';
import LogoutIcon from '@mui/icons-material/Logout';
import { Tooltip, IconButton } from '@mui/material';
import UserAvatar from './UserAvatar.jsx';
import logo from '../assets/logo.png'; 

const Sidebar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Get auth state from Redux
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  const userRole = useSelector(selectUserRole);

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Categories', icon: <CategoryIcon />, path: '/categories' },
    { text: 'Requests', icon: <AssignmentIcon />, path: '/requests' },
  ];

  // Add role-based menu items
  if (userRole === 'admin') {
    menuItems.push({ 
      text: 'Admin Panel',
      icon: <AdminPanelSettingsIcon />, 
      path: '/admin' 
    });
  }

  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Dispatch logout action
    dispatch(logout());
    
    // Navigate to home page after logout
    navigate('/');
  };

  return (
    <Box
      sx={{
        width: 260,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        borderRight: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        position: "fixed",  // Make the sidebar fixed
        left: 0,           // Align to left edge
        top: 0,            // Align to top edge
        zIndex: 1200,      // Ensure it appears above other content
        overflowY: "auto"  // Allow scrolling if sidebar content is too tall
      }}
    >
      {/* Logo */}
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          height: 80,
          cursor: 'pointer',  // Add pointer cursor to indicate it's clickable
          '&:hover': {
            opacity: 0.9,     // Optional: add hover effect
          }
        }}
        onClick={() => navigate('/')}
      >
        <Box
          component="img"
          src={logo}
          alt="Logo"
          sx={{ 
            maxHeight: '100px', 
            maxWidth: '100%' 
          }}
        />
      </Box>

      {/* Navigation Menu */}
      <List sx={{ px: 2, py: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={isActive}
                onClick={() => navigate(item.path)}
                sx={{ 
                  borderRadius: theme.shape.borderRadius,
                  mb: 1,
                  '&:hover': { 
                    backgroundColor: theme.palette.action.hover 
                  },
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.light,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.light,
                    },
                  }
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    minWidth: '40px', 
                    color: isActive ? theme.palette.primary.main : 'inherit'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontWeight: isActive ? 500 : 400,
                    color: isActive ? theme.palette.primary.main : 'inherit',
                  }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Create Request Button - Only show if authenticated or move to a public section */}
      <Box sx={{ flexGrow: 1, p: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => {
            // If not logged in, redirect to login
            if (!isAuthenticated) {
              navigate('/login', { state: { from: '/create-request' } });
            } else {
              navigate('/create-request');
            }
          }}
          fullWidth
          sx={{
            textTransform: 'none',
            borderRadius: '24px',
            py: 1.2,
            boxShadow: theme.shadows[3],
          }}
        >
          Create Request
        </Button>
      </Box>

      {/* User Profile or Auth Buttons based on authentication status */}
      {isAuthenticated ? (
        // Show user profile for authenticated users
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          borderTop: `1px solid ${theme.palette.divider}` 
        }}>
          <UserAvatar user={currentUser} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
              {currentUser?.name || "User"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </Typography>
          </Box>
          <Tooltip title="Logout">
            <IconButton 
              onClick={handleLogout}
              color="error"
              size="small"
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ) : (
        // Show login/signup buttons for guests
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          flexDirection: 'column',
          gap: 1,
          borderTop: `1px solid ${theme.palette.divider}` 
        }}>
          <Button 
            variant="outlined" 
            startIcon={<LoginIcon />}
            onClick={() => navigate('/login')}
            fullWidth
            sx={{ textTransform: 'none' }}
          >
            Login
          </Button>
          <Button 
            variant="text" 
            startIcon={<PersonAddIcon />}
            onClick={() => navigate('/signup')}
            fullWidth
            sx={{ textTransform: 'none' }}
          >
            Sign Up
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Sidebar;