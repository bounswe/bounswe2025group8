import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
} from '@mui/material';
import RequestCard from '../components/RequestCard';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import TuneIcon from '@mui/icons-material/Tune';
import ClearIcon from '@mui/icons-material/Clear';

// Sample request data - in a real app this would come from an API
const sampleRequests = [
  {
    id: '1',
    title: 'Help me to see a doctor',
    categories: ['Healthcare'],
    urgency: 'High',
    distance: '2 km away',
    postedTime: '3 hours ago',
    imageUrl:
      'https://images.unsplash.com/photo-1631815588090-d1bcbe9b4b22?q=80&w=1632&auto=format&fit=crop',
  },
  {
    id: '2',
    title: 'Need help moving furniture to my new apartment',
    categories: ['Moving Help', 'Heavy Lifting'],
    urgency: 'Medium',
    distance: '1.5 km away',
    postedTime: '5 hours ago',
    imageUrl:
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=1374&auto=format&fit=crop',
  },
  {
    id: '3',
    title: 'Looking for someone to help clean my house before guests arrive',
    categories: ['House Cleaning', 'Home Maintenance'],
    urgency: 'High',
    distance: '0.8 km away',
    postedTime: '2 hours ago',
  },
  {
    id: '4',
    title: 'Need help with grocery shopping for elderly parents',
    categories: ['Grocery Shopping', 'Elderly Care'],
    urgency: 'Medium',
    distance: '3 km away',
    postedTime: '1 day ago',
    imageUrl:
      'https://images.unsplash.com/photo-1579113800032-c38bd7635818?q=80&w=1374&auto=format&fit=crop',
  },
  {
    id: '5',
    title: 'Math tutor needed for high school student',
    categories: ['Tutoring', 'Education'],
    urgency: 'Low',
    distance: '5 km away',
    postedTime: '2 days ago',
  },
  {
    id: '6',
    title: 'Need help fixing a leaky faucet and clogged drain',
    categories: ['Home Repair', 'Plumbing'],
    urgency: 'Medium',
    distance: '1 km away',
    postedTime: '6 hours ago',
    imageUrl:
      'https://images.unsplash.com/photo-1615266508370-7778b0065abb?q=80&w=1470&auto=format&fit=crop',
  },
];

// Category mapping - could be expanded with proper data
const categoryMapping = {
  GROCERY_SHOPPING: 'Grocery Shopping',
  TUTORING: 'Tutoring',
  HOME_REPAIR: 'Home Repair',
  MOVING_HELP: 'Moving Help',
  HOUSE_CLEANING: 'House Cleaning',
  OTHER: 'Other Services',
};

const Requests = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredRequests, setFilteredRequests] = useState(sampleRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    urgency: '',
    distance: '',
  });

  // Apply filters based on URL parameters and state
  useEffect(() => {
    // Get updated parameters from URL whenever they change
    const currentCategoryParam = searchParams.get('category') || '';
    const currentUrgencyParam = searchParams.get('urgency') || '';

    // Update our filter state if URL parameters change
    if (currentCategoryParam !== filters.category || currentUrgencyParam !== filters.urgency) {
      setFilters((prev) => ({
        ...prev,
        category: currentCategoryParam,
        urgency: currentUrgencyParam,
      }));
    }

    // Filter requests based on all current filters
    let results = [...sampleRequests];

    // Apply category filter using current URL parameter
    if (currentCategoryParam) {
      results = results.filter((request) =>
        request.categories.some(
          (cat) =>
            cat.toLowerCase() === categoryMapping[currentCategoryParam]?.toLowerCase() ||
            cat.toLowerCase() === currentCategoryParam.toLowerCase()
        )
      );
    }

    // Apply urgency filter using current URL parameter
    if (currentUrgencyParam) {
      results = results.filter(
        (request) => request.urgency.toLowerCase() === currentUrgencyParam.toLowerCase()
      );
    }

    // Apply search term if present
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        (request) =>
          request.title.toLowerCase().includes(term) ||
          request.categories.some((cat) => cat.toLowerCase().includes(term))
      );
    }

    setFilteredRequests(results);
  }, [searchParams, filters, searchTerm]);

  const handleRequestClick = (requestId) => {
    navigate(`/requests/${requestId}`);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    // Update our filter state
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Update URL parameters for the category and urgency filters
    const newSearchParams = new URLSearchParams(searchParams);

    if (value) {
      // Add or update the parameter
      newSearchParams.set(name, value);
    } else {
      // If value is empty, remove the parameter
      newSearchParams.delete(name);
    }

    setSearchParams(newSearchParams);
  };

  const handleClearFilters = () => {
    setFilters({
      category: '',
      urgency: '',
      distance: '',
    });
    setSearchTerm('');
    setSearchParams({});
  };

  const hasActiveFilters = React.useMemo(() => {
    return filters.category || filters.urgency || filters.distance || searchTerm;
  }, [filters.category, filters.urgency, filters.distance, searchTerm]);

  const getCategoryDisplayName = (categoryId) => {
    return categoryMapping[categoryId] || categoryId;
  };

  return (
    <>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Help Requests
          {filters.category && (
            <Typography
              component="span"
              variant="h5"
              color="primary.main"
              sx={{ ml: 1, fontWeight: 'normal' }}
            >
              • {getCategoryDisplayName(filters.category)}
            </Typography>
          )}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {filters.category
            ? `Browse ${getCategoryDisplayName(filters.category)} requests in your area`
            : 'Browse open requests in your area and offer your help'}
        </Typography>
      </Box>

      {/* Search and Filters Section */}
      <Paper
        elevation={2}
        sx={{
          mb: 4,
          p: 2,
          borderRadius: 2,
          backgroundColor: 'background.paper',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Search */}
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search requests"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
              size="small"
            />
          </Grid>

          {/* Category Filter */}
          <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
            <FormControl sx={{ minWidth: 180, width: 'auto' }} size="small">
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                {Object.entries(categoryMapping).map(([id, name]) => (
                  <MenuItem key={id} value={id}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Urgency Filter */}
          <Grid item xs={12} sm={6} md={2} sx={{ display: 'flex' }}>
            <FormControl sx={{ minWidth: 180, width: 'auto' }} size="small">
              <InputLabel>Urgency</InputLabel>
              <Select
                name="urgency"
                value={filters.urgency}
                onChange={handleFilterChange}
                label="Urgency"
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleClearFilters}
                startIcon={<ClearIcon />}
                size="small"
              >
                Clear Filters
              </Button>
            </Grid>
          )}
        </Grid>

        {/* Active Filters */}
        {hasActiveFilters && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mr: 1, display: 'flex', alignItems: 'center' }}
            >
              <FilterListIcon fontSize="small" sx={{ mr: 0.5 }} />
              Active filters:
            </Typography>

            {filters.category && (
              <Chip
                label={`Category: ${getCategoryDisplayName(filters.category)}`}
                size="small"
                onDelete={() => handleFilterChange({ target: { name: 'category', value: '' } })}
              />
            )}

            {filters.urgency && (
              <Chip
                label={`Urgency: ${filters.urgency}`}
                size="small"
                onDelete={() => handleFilterChange({ target: { name: 'urgency', value: '' } })}
              />
            )}

            {searchTerm && (
              <Chip
                label={`Search: ${searchTerm}`}
                size="small"
                onDelete={() => setSearchTerm('')}
              />
            )}
          </Box>
        )}
      </Paper>

      {/* Results section */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'medium', mb: 1 }}>
          {filteredRequests.length} {filteredRequests.length === 1 ? 'request' : 'requests'} found
        </Typography>
      </Box>

      {/* Request Cards */}
      {filteredRequests.length > 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Box sx={{ width: '100%', maxWidth: '1200px' }}>
            {' '}
            {/* Same max width as filters section */}
            <Grid
              container
              spacing={3}
              sx={{
                mb: 4,
                justifyContent: 'center', // Centers grid items when they don't fill the row
              }}
            >
              {filteredRequests.map((request) => (
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={6}
                  lg={4}
                  key={request.id}
                  sx={{ display: 'flex', justifyContent: 'center' }} // Centers each card
                >
                  <Box sx={{ width: '100%', maxWidth: '400px' }}>
                    {' '}
                    {/* Constrains card width */}
                    <RequestCard request={request} onClick={() => handleRequestClick(request.id)} />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No requests found matching your criteria
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your filters or search term
          </Typography>
          <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={handleClearFilters}>
            Clear All Filters
          </Button>
        </Box>
      )}
    </>
  );
};

export default Requests;
