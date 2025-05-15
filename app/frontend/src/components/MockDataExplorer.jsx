import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Container,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  mockUsers,
  mockTasks,
  mockVolunteers,
  mockReviews,
  mockNotifications,
  categoryMapping,
  taskStatusTypes,
} from '../mock/mockData';

// Format function for JSON display
const formatJSON = (json) => {
  return JSON.stringify(json, null, 2);
};

// Mock Data Explorer Component
const MockDataExplorer = () => {
  const [tab, setTab] = useState(0);
  const [filter, setFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchText, setSearchText] = useState('');

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    setFilter('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSearchText('');
  };

  // Filter data based on current filters and search
  const getFilteredData = () => {
    let data;

    // Get base data for current tab
    switch (tab) {
      case 0: // Users
        data = [...mockUsers];
        break;
      case 1: // Tasks
        data = [...mockTasks];
        break;
      case 2: // Volunteers
        data = [...mockVolunteers];
        break;
      case 3: // Reviews
        data = [...mockReviews];
        break;
      case 4: // Notifications
        data = [...mockNotifications];
        break;
      default:
        data = [];
    }

    // Apply filters
    if (tab === 1) { // Tasks
      // Filter by category
      if (selectedCategory) {
        data = data.filter(item => item.category === selectedCategory);
      }

      // Filter by status
      if (selectedStatus) {
        data = data.filter(item => item.status === selectedStatus);
      }
    }

    // Apply text search if provided
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      
      // Different search logic based on data type
      switch (tab) {
        case 0: // Users
          data = data.filter(item => 
            item.name.toLowerCase().includes(searchLower) || 
            item.surname.toLowerCase().includes(searchLower) ||
            item.username.toLowerCase().includes(searchLower) ||
            item.email.toLowerCase().includes(searchLower)
          );
          break;
        case 1: // Tasks
          data = data.filter(item => 
            item.title.toLowerCase().includes(searchLower) || 
            item.description.toLowerCase().includes(searchLower) ||
            item.location.toLowerCase().includes(searchLower)
          );
          break;
        case 2: // Volunteers
          // Filter by task ID or user ID
          data = data.filter(item => 
            item.taskId.toString().includes(searchLower) || 
            item.userId.toString().includes(searchLower) ||
            item.status.toLowerCase().includes(searchLower)
          );
          break;
        case 3: // Reviews
          data = data.filter(item => 
            item.comment.toLowerCase().includes(searchLower) ||
            item.reviewerId.toString().includes(searchLower) ||
            item.revieweeId.toString().includes(searchLower)
          );
          break;
        case 4: // Notifications
          data = data.filter(item => 
            item.content.toLowerCase().includes(searchLower) ||
            item.type.toLowerCase().includes(searchLower)
          );
          break;
        default:
          break;
      }
    }

    // Apply ID filter if provided
    if (filter) {
      const filterId = parseInt(filter, 10);
      if (!isNaN(filterId)) {
        data = data.filter(item => item.id === filterId);
      }
    }

    return data;
  };

  // Get current data
  const currentData = getFilteredData();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Mock Data Explorer
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        This tool allows you to browse and search the mock data available in the application.
        Use it to find specific records or understand the data structure.
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tab} onChange={handleTabChange} aria-label="mock data tabs">
          <Tab label={`Users (${mockUsers.length})`} />
          <Tab label={`Tasks (${mockTasks.length})`} />
          <Tab label={`Volunteers (${mockVolunteers.length})`} />
          <Tab label={`Reviews (${mockReviews.length})`} />
          <Tab label={`Notifications (${mockNotifications.length})`} />
        </Tabs>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            label="Search by ID"
            variant="outlined"
            size="small"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{ width: 150 }}
          />

          <TextField
            label="Search text"
            variant="outlined"
            size="small"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ width: 250 }}
          />

          {tab === 1 && ( // Show category filter only for Tasks
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {Object.keys(categoryMapping).map((category) => (
                  <MenuItem key={category} value={category}>
                    {categoryMapping[category].name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {tab === 1 && ( // Show status filter only for Tasks
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={selectedStatus}
                label="Status"
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {taskStatusTypes.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Button 
            variant="outlined" 
            onClick={() => {
              setFilter('');
              setSelectedCategory('');
              setSelectedStatus('');
              setSearchText('');
            }}
          >
            Clear Filters
          </Button>
        </Box>
      </Paper>

      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          maxHeight: 'calc(100vh - 300px)',
          overflowY: 'auto',
          backgroundColor: '#f5f5f5'
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {currentData.length} records found
        </Typography>
        
        <Box component="pre" sx={{ overflow: 'auto', fontSize: '0.875rem' }}>
          {formatJSON(currentData)}
        </Box>
      </Paper>
    </Container>
  );
};

export default MockDataExplorer;
