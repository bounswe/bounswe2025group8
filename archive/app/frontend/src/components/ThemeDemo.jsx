import React from 'react';
//import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Paper,
  Divider,
  Avatar,
  Chip,
  TextField,
  IconButton,
} from '@mui/material';

// Import icons
import {
  HomeOutlined,
  PersonOutline,
  NotificationsOutlined,
  BookmarkBorderOutlined,
  VolunteerActivismOutlined,
  SearchOutlined,
  AddPhotoAlternateOutlined,
  LocalOfferOutlined,
  AddOutlined
} from '@mui/icons-material';

const ThemeDemo = () => {
  const theme = useTheme();
  
  // Custom hook to access custom theme values
  const useCustomTheme = () => {
    return {
      width: (key) => theme.customSizing.width[key],
      height: (key) => theme.customSizing.height[key],
      fontSize: (key) => theme.customSizing.fontSize[key]
    };
  };
  
  const ct = useCustomTheme();

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h2" color="primary.main" gutterBottom>
        Material UI with Custom Theme
      </Typography>
      <Typography variant="body1" paragraph>
        This is a demonstration of the custom theme created from your Tailwind configuration. 
        All components inherit the brand colors, typography, spacing, and other design tokens.
      </Typography>

      <Grid container spacing={4}>
        {/* Color Palette Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom>Color Palette</Typography>
            <Grid container spacing={2}>
              {['primary', 'secondary', 'error', 'warning', 'success', 'info'].map((color) => (
                <Grid item xs={6} sm={4} key={color}>
                  <Box sx={{ 
                    bgcolor: `${color}.main`, 
                    color: `${color}.contrastText`, 
                    p: 2,
                    borderRadius: 'l', 
                    textAlign: 'center',
                    boxShadow: 3
                  }}>
                    {color}
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    mt: 1, 
                    borderRadius: 'l', 
                    overflow: 'hidden' 
                  }}>
                    <Box sx={{ bgcolor: `${color}.light`, flexGrow: 1, p: 1, fontSize: '0.75rem', textAlign: 'center' }}>light</Box>
                    <Box sx={{ bgcolor: `${color}.dark`, flexGrow: 1, p: 1, color: 'white', fontSize: '0.75rem', textAlign: 'center' }}>dark</Box>
                  </Box>
                </Grid>
              ))}
              
              <Grid item xs={6} sm={4}>
                <Box sx={{ 
                  bgcolor: 'teal.main', 
                  color: 'white', 
                  p: 2,
                  borderRadius: 'l', 
                  textAlign: 'center',
                  boxShadow: 3
                }}>
                  teal
                </Box>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Box sx={{ 
                  bgcolor: 'purple.main', 
                  color: 'white', 
                  p: 2,
                  borderRadius: 'l', 
                  textAlign: 'center',
                  boxShadow: 3
                }}>
                  purple
                </Box>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Box sx={{ 
                  bgcolor: 'orange.main', 
                  color: 'white', 
                  p: 2,
                  borderRadius: 'l', 
                  textAlign: 'center',
                  boxShadow: 3
                }}>
                  orange
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Typography Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom>Typography</Typography>
            <Typography variant="h1">Heading 1</Typography>
            <Typography variant="h2">Heading 2</Typography>
            <Typography variant="h3">Heading 3</Typography>
            <Typography variant="h4">Heading 4</Typography>
            <Typography variant="h5">Heading 5</Typography>
            <Typography variant="h6">Heading 6</Typography>
            <Typography variant="subtitle1">Subtitle 1</Typography>
            <Typography variant="subtitle2">Subtitle 2</Typography>
            <Typography variant="body1">Body 1: Regular paragraph text</Typography>
            <Typography variant="body2">Body 2: Smaller paragraph text</Typography>
            <Typography variant="button" display="block">Button Text</Typography>
            <Typography variant="caption" display="block">Caption Text</Typography>
            <Typography variant="overline" display="block">Overline Text</Typography>
          </Paper>
        </Grid>

        {/* Buttons */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom>Buttons</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <Button variant="contained" color="primary">Primary</Button>
              <Button variant="contained" color="secondary">Secondary</Button>
              <Button variant="contained" color="error">Error</Button>
              <Button variant="contained" color="warning">Warning</Button>
              <Button variant="contained" color="info">Info</Button>
              <Button variant="contained" color="success">Success</Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <Button variant="outlined" color="primary">Primary</Button>
              <Button variant="outlined" color="secondary">Secondary</Button>
              <Button variant="outlined" color="error">Error</Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Button variant="text" color="primary">Primary</Button>
              <Button variant="text" color="secondary">Secondary</Button>
              <Button variant="text" color="error">Error</Button>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Custom Color Buttons</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Button variant="contained" sx={{ bgcolor: 'teal.main', '&:hover': { bgcolor: 'teal.dark' } }}>
                  Teal
                </Button>
                <Button variant="contained" sx={{ bgcolor: 'purple.main', '&:hover': { bgcolor: 'purple.dark' } }}>
                  Purple
                </Button>
                <Button variant="contained" sx={{ bgcolor: 'orange.main', '&:hover': { bgcolor: 'orange.dark' } }}>
                  Orange
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Cards and Form Elements */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom>Cards & Form Elements</Typography>
            
            <Card sx={{ mb: 3 }}>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: 'primary.main' }}>N</Avatar>
                }
                title="Card Title"
                subheader="May 7, 2025"
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  This card demonstrates the custom border radius and shadows defined in your theme.
                </Typography>
              </CardContent>
            </Card>
            
            <TextField 
              label="Text Field" 
              variant="outlined" 
              fullWidth 
              sx={{ mb: 2 }}
              placeholder="Enter text here..."
            />
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Chip label="Primary" color="primary" />
              <Chip label="Secondary" color="secondary" />
              <Chip label="With Icon" icon={<HomeOutlined />} color="primary" />
              <Chip label="Deletable" onDelete={() => {}} color="error" />
            </Box>
          </Paper>
        </Grid>

        {/* Feature Card Section */}
        <Grid item xs={12}>
          <Typography variant="h4" sx={{ mb: 3 }}>Feature Cards</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <VolunteerActivismOutlined />
                    </Avatar>
                    <Typography variant="h6">Volunteer Opportunities</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Find and join volunteer activities in your neighborhood to help those in need.
                  </Typography>
                  <Button variant="outlined" color="primary" startIcon={<AddOutlined />}>
                    View Opportunities
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                      <BookmarkBorderOutlined />
                    </Avatar>
                    <Typography variant="h6">Resource Bookmarks</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Save and organize important community resources and information.
                  </Typography>
                  <Button variant="outlined" color="secondary" startIcon={<AddOutlined />}>
                    Manage Bookmarks
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                      <LocalOfferOutlined />
                    </Avatar>
                    <Typography variant="h6">Community Tags</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Organize content with tags to make information easy to find and categorize.
                  </Typography>
                  <Button variant="outlined" sx={{ color: 'success.main', borderColor: 'success.main' }} startIcon={<AddOutlined />}>
                    Explore Tags
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Custom Sizing Demo */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Custom Sizing</Typography>
            <Typography variant="body2" paragraph>
              These boxes use the custom sizing from the Tailwind configuration
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, mb: 3 }}>
              <Box sx={{ 
                width: ct.width('Sz5'), 
                height: ct.height('Sz5'), 
                bgcolor: 'primary.main'
              }} />
              <Box sx={{ 
                width: ct.width('Sz9'), 
                height: ct.height('Sz9'), 
                bgcolor: 'secondary.main'
              }} />
              <Box sx={{ 
                width: ct.width('Sz13'), 
                height: ct.height('Sz13'), 
                bgcolor: 'error.main'
              }} />
              <Box sx={{ 
                width: ct.width('Sz17'), 
                height: ct.height('Sz17'), 
                bgcolor: 'success.main'
              }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ThemeDemo;