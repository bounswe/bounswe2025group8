import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Avatar,
  IconButton,
  Grid
} from '@mui/material';
import { Close, PhotoCamera } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfileDetails, uploadProfilePicture } from '../../store/slices/profileSlice';

const EditProfileDialog = ({ open, onClose, user }) => {
  const dispatch = useDispatch();
  const { loading, error, updateSuccess } = useSelector((state) => state.profile);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    phone: '',
    address: '',
  });
  
  // Initialize form with user data when dialog opens
  useEffect(() => {
    if (user && open) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user, open]);
  
  // Close dialog when update is successful
  useEffect(() => {
    if (updateSuccess) {
      onClose();
    }
  }, [updateSuccess, onClose]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateUserProfileDetails(formData));
  };
  
  const handleProfilePictureUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      dispatch(uploadProfilePicture(file));
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 0 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">Edit Profile</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {/* Profile Picture Upload */}
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <Box position="relative">
              <Avatar 
                src={user?.profilePicture} 
                alt={user?.name} 
                sx={{ width: 100, height: 100, mb: 1 }} 
              />
              <IconButton 
                component="label"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: 'white',
                  boxShadow: 1,
                  '&:hover': { backgroundColor: '#f5f5f5' },
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleProfilePictureUpload}
                />
                <PhotoCamera />
              </IconButton>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Click the camera icon to change your profile picture
            </Typography>
          </Box>
          
          {/* Error message */}
          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          
          {/* Form Fields */}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Full Name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="email"
                label="Email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                type="email"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="phone"
                label="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="address"
                label="Address"
                value={formData.address}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="bio"
                label="Bio"
                value={formData.bio}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                multiline
                rows={3}
                placeholder="Tell others a bit about yourself..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={onClose} 
            color="inherit"
            sx={{ borderRadius: '20px', px: 3 }}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            variant="contained" 
            color="primary"
            disabled={loading}
            sx={{ borderRadius: '20px', px: 3 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditProfileDialog;
