import React from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Alert,
  AlertTitle
} from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';

const UploadPhotosStep = () => {
  return (
    <Box>

      
      {/* Information box */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          textAlign: 'center',
          border: '1px dashed #ccc',
          borderRadius: 2,
          backgroundColor: '#f9f9f9',
          mb: 4
        }}
      >
        <ConstructionIcon sx={{ fontSize: 60, color: '#9e9e9e', mb: 2 }} />
        
        <Typography variant="h6" gutterBottom>
          Feature Not Implemented
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          We're working on implementing the photo upload functionality.
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          Please proceed to the next step to continue creating your request.
        </Typography>
      </Paper>
      
      {/* Instructions */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Note:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your request can still be submitted without photos. You can add photos to your request later when this feature becomes available.
        </Typography>
      </Box>
    </Box>
  );
};

export default UploadPhotosStep;