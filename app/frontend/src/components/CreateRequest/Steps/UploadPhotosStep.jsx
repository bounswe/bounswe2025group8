import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Box, 
  Typography, 
  Button,
  Grid,
  Paper,
  IconButton
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { uploadPhotos, removePhoto } from '../../../store/slices/createRequestSlice';

const UploadPhotosStep = () => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const { uploadedPhotos, loading } = useSelector((state) => state.createRequest);
  const [dragActive, setDragActive] = useState(false);
  
  // Handle file upload
  const handleFileUpload = (files) => {
    if (files.length > 0) {
      dispatch(uploadPhotos(Array.from(files)));
    }
  };
  
  // Handle file selection through browse button
  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };
  
  const handleFileChange = (e) => {
    handleFileUpload(e.target.files);
    // Reset the input to allow uploading the same file again
    e.target.value = null;
  };
  
  // Handle drag and drop events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };
  
  // Remove a photo
  const handleRemovePhoto = (photoId) => {
    dispatch(removePhoto(photoId));
  };
  
  return (
    <Box>
      {/* Upload area */}
      <Box
        sx={{
          p: 3,
          mb: 3,
          border: '2px dashed',
          borderColor: dragActive ? 'primary.main' : '#e0e0e0',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          minHeight: 200,
          backgroundColor: dragActive ? 'rgba(92, 105, 255, 0.05)' : '#f8f8f8',
          transition: 'all 0.3s ease',
        }}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        
        <CloudUploadIcon 
          sx={{ 
            fontSize: 48, 
            color: dragActive ? 'primary.main' : '#9e9e9e', 
            mb: 2 
          }} 
        />
        
        <Typography variant="h6" gutterBottom>
          Drop files here
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          or
        </Typography>
        
        <Button 
          variant="text" 
          color="primary" 
          onClick={handleBrowseClick}
          disabled={loading}
          sx={{
            fontWeight: 'bold',
            mt: 1
          }}
        >
          Browse photos
        </Button>
      </Box>
      
      {/* Uploaded photos preview */}
      {uploadedPhotos.length > 0 && (
        <Grid container spacing={2}>
          {uploadedPhotos.map((photo) => (
            <Grid item xs={12} sm={6} key={photo.id}>
              <Paper
                elevation={0}
                sx={{
                  p: 1,
                  borderRadius: 2,
                  overflow: 'hidden',
                  position: 'relative',
                  border: '1px solid #eee',
                }}
              >
                <Box
                  component="img"
                  src={photo.url}
                  alt={photo.name}
                  sx={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover',
                    borderRadius: 1,
                  }}
                />
                
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      maxWidth: '80%',
                    }}
                  >
                    ✓ {photo.name}
                  </Typography>
                  
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemovePhoto(photo.id)}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default UploadPhotosStep;