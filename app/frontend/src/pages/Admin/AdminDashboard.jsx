import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../features/authentication/hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import {
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Box,
  Alert,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FlagIcon from '@mui/icons-material/Flag';
import PeopleIcon from '@mui/icons-material/People';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth();
  const { colors } = useTheme();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (userRole !== 'admin') {
      navigate('/');
      return;
    }
    setIsAdmin(true);
  }, [userRole, navigate]);

  if (!isAdmin) {
    return null;
  }

  const dashboardItems = [
    {
      title: 'All Requests',
      description: 'View and manage all requests/tasks in the system',
      icon: <AssignmentIcon sx={{ fontSize: 48, color: colors.primary }} />,
      path: '/admin/requests',
      color: '#4CAF50',
    },
    {
      title: 'Task Reports',
      description: 'View and manage reports filed against tasks/requests',
      icon: <FlagIcon sx={{ fontSize: 48, color: colors.primary }} />,
      path: '/admin/task-reports',
      color: '#2196F3',
    },
    {
      title: 'Reported Users',
      description: 'View users who have been reported and need review',
      icon: <PeopleIcon sx={{ fontSize: 48, color: colors.primary }} />,
      path: '/admin/reported-users',
      color: '#F44336',
    },
  ];

  return (
    <Box sx={{ backgroundColor: colors.background, minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <h1 style={{ color: colors.text, marginBottom: '8px' }}>Admin Dashboard</h1>
          <p style={{ color: colors.textSecondary, fontSize: '16px' }}>
            Welcome back, {currentUser?.name || 'Admin'}. Manage reports and content here.
          </p>
        </Box>

        {/* Alert */}
        <Alert severity="info" sx={{ mb: 4 }}>
          You have admin access to manage all requests and reports. Please handle reports
          responsibly.
        </Alert>

        {/* Dashboard Grid */}
        <Grid container spacing={1}>
          {dashboardItems.map((item, index) => (
            <Grid item xs={12} sm={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  },
                  backgroundColor: colors.card,
                  borderLeft: `4px solid ${item.color}`,
                }}
              >
                <CardHeader
                  avatar={<div style={{ transform: 'scale(0.6)', transformOrigin: 'left' }}>{item.icon}</div>}
                  title={item.title}
                  titleTypographyProps={{
                    variant: 'subtitle1',
                    sx: { color: colors.text, fontWeight: 'bold', fontSize: '16px' },
                  }}
                  sx={{ pb: 1, pt: 1.5, px: 2 }}
                />
                <CardContent sx={{ flexGrow: 1, py: 0.5, px: 2 }}>
                  <p
                    style={{
                      color: colors.textSecondary,
                      fontSize: '12px',
                      marginBottom: '8px',
                      margin: 0,
                    }}
                  >
                    {item.description}
                  </p>
                </CardContent>
                <Box sx={{ p: 1.5, pt: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      backgroundColor: item.color,
                      color: 'white',
                      width: '100%',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      '&:hover': {
                        backgroundColor: item.color,
                        opacity: 0.9,
                      },
                    }}
                    onClick={() => navigate(item.path)}
                  >
                    View
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Quick Stats */}
        <Box sx={{ mt: 6 }}>
          <h2 style={{ color: colors.text, marginBottom: '16px' }}>Quick Stats</h2>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: colors.card,
                  borderTop: `4px solid #4CAF50`,
                }}
              >
                <p
                  style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#4CAF50',
                    margin: '0 0 8px 0',
                  }}
                >
                  -
                </p>
                <p
                  style={{
                    color: colors.textSecondary,
                    fontSize: '14px',
                    margin: 0,
                  }}
                >
                  Total Requests
                </p>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: colors.card,
                  borderTop: `4px solid #2196F3`,
                }}
              >
                <p
                  style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#2196F3',
                    margin: '0 0 8px 0',
                  }}
                >
                  -
                </p>
                <p
                  style={{
                    color: colors.textSecondary,
                    fontSize: '14px',
                    margin: 0,
                  }}
                >
                  Pending Reports
                </p>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: colors.card,
                  borderTop: `4px solid #FF9800`,
                }}
              >
                <p
                  style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#FF9800',
                    margin: '0 0 8px 0',
                  }}
                >
                  -
                </p>
                <p
                  style={{
                    color: colors.textSecondary,
                    fontSize: '14px',
                    margin: 0,
                  }}
                >
                  Reported Users
                </p>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: colors.card,
                  borderTop: `4px solid #F44336`,
                }}
              >
                <p
                  style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#F44336',
                    margin: '0 0 8px 0',
                  }}
                >
                  -
                </p>
                <p
                  style={{
                    color: colors.textSecondary,
                    fontSize: '14px',
                    margin: 0,
                  }}
                >
                  Total Users
                </p>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
