import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout, selectIsAuthenticated, selectUserRole, selectCurrentUser } from '../store/slices/authSlice';
import { Box, Button, Typography, Paper, Collapse, Alert } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import NoAccountsIcon from '@mui/icons-material/NoAccounts';
import { useNavigate } from 'react-router-dom';


// Mock user data for different roles
const mockUsers = {
  guest: {
    name: 'Guest User',
    role: 'guest',
    isAuthenticated: false,
    icon: <NoAccountsIcon fontSize="small" />
  },
  user: {
    id: 'user-123',
    name: 'Regular User',
    email: 'user@example.com',
    avatar: null,
    role: 'user',
    icon: <PersonIcon fontSize="small" />,
    description: 'Can both create requests and provide services'
  },
  admin: {
    id: 'admin-789',
    name: 'Admin User',
    email: 'admin@example.com',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    role: 'admin',
    icon: <AdminPanelSettingsIcon fontSize="small" />,
    description: 'Has access to admin panel and all features'
  }
};

const DevUserPanel = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get current authentication state from Redux
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUserRole = useSelector(selectUserRole);
  const currentUser = useSelector(selectCurrentUser);
  
  // Set the selected role to match current user
  const [selectedRole, setSelectedRole] = useState(isAuthenticated ? currentUserRole : 'guest');
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState({ text: '', type: 'info' });
  
  // Update the selected role when auth state changes
  useEffect(() => {
    if (isAuthenticated && currentUserRole) {
      setSelectedRole(currentUserRole);
    } else {
      setSelectedRole('guest');
    }
  }, [isAuthenticated, currentUserRole]);

  const handleRoleSelect = (role) => {
    console.log("Selected role changed to:", role);
    setSelectedRole(role);
  };

  const handleLogin = () => {
    const selectedUser = mockUsers[selectedRole];
    console.log("Logging in as:", selectedUser);
    
    if (selectedRole === 'guest') {
      // Logout if guest is selected
      dispatch(logout());
      localStorage.removeItem('token');
      displayMessage("Logged out successfully", "success");
      //navigate to home
      navigate('/');
    } else {
      // Login with the selected user
      dispatch(login({
        user: {
          id: selectedUser.id,
          name: selectedUser.name,
          email: selectedUser.email,
          avatar: selectedUser.avatar
        },
        role: selectedUser.role,
        token: `mock-token-${selectedUser.role}-${Date.now()}`
      }));
      
      // Store token in localStorage for persistence
      localStorage.setItem('token', `mock-token-${selectedUser.role}-${Date.now()}`);
      
      displayMessage(`Logged in as ${selectedUser.name}`, "success");
    }
  };

  const displayMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setShowMessage(true);
    
    // Auto-hide message after 3 seconds
    setTimeout(() => {
      setShowMessage(false);
    }, 3000);
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        position: 'fixed', 
        bottom: '20px', 
        right: '20px', 
        zIndex: 9999,
        padding: 2,
        width: 300,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid #ffcc00',
        borderRadius: 2
      }}
    >
      <Typography variant="subtitle1" fontWeight="bold" mb={1}>
        Development User Switcher
      </Typography>
      
      <Collapse in={showMessage}>
        <Alert 
          severity={message.type} 
          sx={{ mb: 2 }}
          onClose={() => setShowMessage(false)}
        >
          {message.text}
        </Alert>
      </Collapse>
      
      {/* Display current user info */}
      {isAuthenticated && (
        <Box sx={{ mb: 2, p: 1, bgcolor: 'rgba(0, 0, 0, 0.04)', borderRadius: 1 }}>
          <Typography variant="caption" display="block" color="text.secondary">
            Currently logged in as:
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            {currentUser?.name || "Unknown User"} ({currentUserRole})
          </Typography>
        </Box>
      )}
      
      {/* Use buttons for user selection */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
          Select User Type:
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {Object.entries(mockUsers).map(([role, user]) => (
            <Button
              key={role}
              variant={selectedRole === role ? "contained" : "outlined"}
              size="small"
              startIcon={user.icon}
              onClick={() => handleRoleSelect(role)}
              sx={{ 
                textTransform: 'none',
                justifyContent: 'flex-start',
                backgroundColor: selectedRole === role ? undefined : 'transparent',
                textAlign: 'left'
              }}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
              {user.description && (
                <Typography 
                  component="span" 
                  variant="caption" 
                  sx={{ 
                    display: 'block', 
                    ml: 1,
                    color: selectedRole === role ? 'inherit' : 'text.secondary',
                    opacity: selectedRole === role ? 0.9 : 0.7
                  }}
                >
                  {user.description}
                </Typography>
              )}
            </Button>
          ))}
        </Box>
      </Box>
      
      <Button 
        onClick={handleLogin} 
        variant="contained" 
        color={selectedRole === 'guest' ? 'error' : 'primary'}
        fullWidth
        disableElevation
        size="medium"
      >
        {selectedRole === 'guest' ? 'Logout' : (
          isAuthenticated && selectedRole === currentUserRole
            ? 'Refresh Login'
            : `Login as ${selectedRole}`
        )}
      </Button>
      
      <Box sx={{ mt: 1, p: 1, bgcolor: 'rgba(0, 0, 0, 0.04)', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          Note: In this application, regular users can both create requests and provide services. There is no separate "provider" role.
        </Typography>
      </Box>
    </Paper>
  );
};

export default DevUserPanel;