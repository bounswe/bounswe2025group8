import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Divider,
} from '@mui/material';
import MockDataExplorer from '../components/MockDataExplorer';
import { 
  TaskListExample, 
  TaskDetailExample, 
  UserProfileExample,
  NotificationsExample,
  CategoriesExample
} from '../examples/MockDataExamples';

// The demo page that allows exploring mock data and viewing example components
const DemoPage = () => {
  const [tab, setTab] = useState(0);
  const [exampleTab, setExampleTab] = useState(0);

  // Handle main tab change
  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  // Handle example tab change
  const handleExampleTabChange = (event, newValue) => {
    setExampleTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Neighborhood Assistance Board Demo
      </Typography>
      
      <Typography variant="body1" paragraph>
        This page provides access to mock data and example components to demonstrate the application's functionality.
        Use the tabs below to explore the data and view sample implementations.
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tab} 
          onChange={handleTabChange} 
          aria-label="demo page tabs"
        >
          <Tab label="Mock Data Explorer" />
          <Tab label="Example Components" />
        </Tabs>
      </Box>
      
      {/* Mock Data Explorer Tab */}
      {tab === 0 && (
        <MockDataExplorer />
      )}
      
      {/* Example Components Tab */}
      {tab === 1 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Example Components
          </Typography>
          
          <Typography variant="body1" paragraph>
            These components demonstrate how to use the mock data services in your application.
            You can use these patterns in your own components to integrate with the mock data.
          </Typography>
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={exampleTab} 
              onChange={handleExampleTabChange} 
              aria-label="example components tabs"
            >
              <Tab label="Task List" />
              <Tab label="Task Detail" />
              <Tab label="User Profile" />
              <Tab label="Notifications" />
              <Tab label="Categories" />
            </Tabs>
          </Box>
          
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            {exampleTab === 0 && <TaskListExample />}
            {exampleTab === 1 && <TaskDetailExample taskId={103} />}
            {exampleTab === 2 && <UserProfileExample userId={3} />}
            {exampleTab === 3 && <NotificationsExample userId={1} />}
            {exampleTab === 4 && <CategoriesExample />}
          </Paper>
          
          <Typography variant="subtitle2" color="text.secondary">
            Note: These are functional components that use the actual mock data services.
            You can modify the component props (like taskId or userId) to view different data.
          </Typography>
        </Box>
      )}
      
      <Divider sx={{ my: 4 }} />
      
      <Typography variant="body2" color="text.secondary" align="center">
        Neighborhood Assistance Board - Demo Mode - {new Date().toLocaleDateString()}
      </Typography>
    </Container>
  );
};

export default DemoPage;
