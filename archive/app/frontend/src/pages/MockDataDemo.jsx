import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Chip,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Rating,
  Badge
} from '@mui/material';

// Import mock service adapter for data
import { 
  mockTaskService,
  mockUserService,
  mockVolunteerService,
  mockNotificationService,
  mockReviewService,
  categoryMapping
} from '../services/mockServiceAdapter';

// Import formatting utilities
import { 
  formatDate, 
  formatTimeAgo, 
  getStatusColor, 
  getStatusText,
  truncateText
} from '../utils/formatUtils';

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function MockDataDemo() {
  const [tabValue, setTabValue] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [userTasks, setUserTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    // Reset data when changing tabs
    setTasks([]);
    setUser(null);
    setUserTasks([]);
    setNotifications([]);
    setVolunteers([]);
    setReviews([]);
  };

  // Load sample tasks
  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const response = await mockTaskService.getTasks({});
      setTasks(response.tasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load user profile
  const loadUserProfile = async (userId = 1) => {
    setIsLoading(true);
    try {
      const profile = await mockUserService.getUserProfile(userId);
      setUser(profile);
    } catch (error) {
      console.error("Error loading user profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load user tasks
  const loadUserTasks = async (userId = 1) => {
    setIsLoading(true);
    try {
      const response = await mockTaskService.getTasks({ creator: userId });
      setUserTasks(response.tasks);
    } catch (error) {
      console.error("Error loading user tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load notifications
  const loadNotifications = async (userId = 1) => {
    setIsLoading(true);
    try {
      const response = await mockNotificationService.getUserNotifications(userId, {});
      setNotifications(response.notifications);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load task volunteers
  const loadTaskVolunteers = async (taskId = 103) => {
    setIsLoading(true);
    try {
      const response = await mockVolunteerService.getTaskVolunteers(taskId, {});
      setVolunteers(response.volunteers);
    } catch (error) {
      console.error("Error loading volunteers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load reviews
  const loadReviews = async (userId = 3) => {
    setIsLoading(true);
    try {
      const response = await mockReviewService.getUserReviews(userId, {});
      setReviews(response.reviews);
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Neighborhood Assistance App Demo
      </Typography>
      <Typography variant="subtitle1" paragraph align="center" color="text.secondary" gutterBottom>
        This demo page showcases the mock data and service adapters for development purposes.
      </Typography>

      <Paper sx={{ mt: 4, mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Tasks" />
          <Tab label="User Profile" />
          <Tab label="Notifications" />
          <Tab label="Volunteers" />
          <Tab label="Reviews" />
        </Tabs>

        {/* Tasks Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              onClick={loadTasks}
              disabled={isLoading}
            >
              Load Sample Tasks
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            {tasks.map((task) => (
              <Grid item xs={12} md={6} key={task.id}>
                <Card sx={{ height: '100%' }}>
                  <CardHeader
                    title={task.title}
                    subheader={
                      <>
                        <Chip 
                          label={categoryMapping[task.category].name} 
                          size="small" 
                          sx={{ mr: 1 }}
                        />
                        <Chip 
                          label={getStatusText(task.status)} 
                          size="small"
                          sx={{ bgcolor: getStatusColor(task.status), color: 'white' }}
                        />
                      </>
                    }
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {truncateText(task.description, 150)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Location:</strong> {task.location}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Deadline:</strong> {formatDate(task.deadline)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Created:</strong> {formatTimeAgo(task.createdAt)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {tasks.length === 0 && !isLoading && (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography color="text.secondary">
                Click the button above to load sample tasks
              </Typography>
            </Box>
          )}
          
          {isLoading && (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography>Loading tasks...</Typography>
            </Box>
          )}
        </TabPanel>

        {/* User Profile Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              onClick={() => loadUserProfile(1)}
              disabled={isLoading}
            >
              Load Sarah's Profile
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => loadUserTasks(1)}
              disabled={isLoading}
            >
              Load Sarah's Tasks
            </Button>
          </Box>

          {user && (
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar src={user.avatar} sx={{ width: 80, height: 80, mr: 2 }} />
                <Box>
                  <Typography variant="h5">{user.name} {user.surname}</Typography>
                  <Typography variant="body2" color="text.secondary">@{user.username}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Rating value={user.rating} precision={0.1} readOnly size="small" />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {user.rating.toFixed(1)} • {user.completedTaskCount} tasks completed
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1"><strong>Email:</strong> {user.email}</Typography>
                  <Typography variant="subtitle1"><strong>Phone:</strong> {user.phoneNumber}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1"><strong>Location:</strong> {user.location}</Typography>
                  <Typography variant="subtitle1"><strong>Role:</strong> {user.role}</Typography>
                </Grid>
              </Grid>
            </Paper>
          )}

          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>User Tasks</Typography>
          <Grid container spacing={2}>
            {userTasks.map((task) => (
              <Grid item xs={12} md={6} key={task.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{task.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {truncateText(task.description, 100)}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip 
                        label={getStatusText(task.status)} 
                        size="small"
                        sx={{ bgcolor: getStatusColor(task.status), color: 'white', mr: 1 }}
                      />
                      <Chip 
                        label={categoryMapping[task.category].name} 
                        size="small" 
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {!user && !userTasks.length && !isLoading && (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography color="text.secondary">
                Click a button above to load user data
              </Typography>
            </Box>
          )}
          
          {isLoading && (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography>Loading user data...</Typography>
            </Box>
          )}
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              onClick={() => loadNotifications(1)}
              disabled={isLoading}
            >
              Load Sarah's Notifications
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => loadNotifications(3)}
              disabled={isLoading}
            >
              Load Emma's Notifications
            </Button>
          </Box>
          
          <List sx={{ width: '100%' }}>
            {notifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Badge color="error" variant={notification.isRead ? "standard" : "dot"}>
                      <Avatar>{notification.type.charAt(0)}</Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={notification.content}
                    secondary={
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {formatTimeAgo(notification.timestamp)}
                      </Typography>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
          
          {notifications.length === 0 && !isLoading && (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography color="text.secondary">
                Click a button above to load notifications
              </Typography>
            </Box>
          )}
          
          {isLoading && (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography>Loading notifications...</Typography>
            </Box>
          )}
        </TabPanel>

        {/* Volunteers Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              onClick={() => loadTaskVolunteers(103)}
              disabled={isLoading}
            >
              Load Kitchen Sink Volunteers
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => loadTaskVolunteers(104)}
              disabled={isLoading}
            >
              Load Moving Help Volunteers
            </Button>
          </Box>
          
          <List sx={{ width: '100%' }}>
            {volunteers.map((volunteer) => (
              <React.Fragment key={volunteer.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar src={volunteer.user.avatar} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${volunteer.user.name} ${volunteer.user.surname}`}
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                          sx={{ display: 'block' }}
                        >
                          Application Status: 
                          <Chip 
                            label={volunteer.status} 
                            size="small"
                            sx={{ ml: 1 }}
                            color={
                              volunteer.status === 'ACCEPTED' ? 'success' :
                              volunteer.status === 'REJECTED' ? 'error' : 'default'
                            }
                          />
                        </Typography>
                        <Typography variant="body2">
                          Applied {formatTimeAgo(volunteer.volunteeredAt)}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
          
          {volunteers.length === 0 && !isLoading && (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography color="text.secondary">
                Click a button above to load volunteers
              </Typography>
            </Box>
          )}
          
          {isLoading && (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography>Loading volunteers...</Typography>
            </Box>
          )}
        </TabPanel>

        {/* Reviews Tab */}
        <TabPanel value={tabValue} index={4}>
          <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              onClick={() => loadReviews(3)}
              disabled={isLoading}
            >
              Load Emma's Reviews
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => loadReviews(4)}
              disabled={isLoading}
            >
              Load David's Reviews
            </Button>
          </Box>
          
          <Grid container spacing={2}>
            {reviews.map((review) => (
              <Grid item xs={12} md={6} key={review.id}>
                <Card>
                  <CardHeader
                    avatar={<Avatar src={review.reviewer.avatar} />}
                    title={`${review.reviewer.name} ${review.reviewer.surname}`}
                    subheader={<>
                      <Rating value={review.score} precision={0.1} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(review.timestamp)}
                      </Typography>
                    </>}
                  />
                  <CardContent>
                    <Typography variant="body2">{review.comment}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      For task: {review.task.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {reviews.length === 0 && !isLoading && (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography color="text.secondary">
                Click a button above to load reviews
              </Typography>
            </Box>
          )}
          
          {isLoading && (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography>Loading reviews...</Typography>
            </Box>
          )}
        </TabPanel>
      </Paper>
    </Container>
  );
}
