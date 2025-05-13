import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, Stepper, Step, StepLabel, Paper } from '@mui/material';
import { fetchCategories, nextStep, prevStep, setStep, submitRequest } from '../../redux/slices/createRequestSlice';
import GeneralInformationStep from './Steps/GeneralInformationStep';
import UploadPhotosStep from './Steps/UploadPhotosStep';
import DetermineDeadlineStep from './Steps/DetermineDeadlineStep';
import SetupAddressStep from './Steps/SetupAddressStep';
import Sidebar from '../Sidebar/Sidebar';
import styles from './CreateRequestPage.module.css';

const steps = [
  'General Information',
  'Upload Photos',
  'Determine Deadline',
  'Setup Address'
];

const CreateRequestPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentStep, loading, success, error } = useSelector((state) => state.createRequest);
  
  useEffect(() => {
    // Fetch categories when component mounts
    dispatch(fetchCategories());
  }, [dispatch]);
  
  // Handle form submission
  const handleSubmit = () => {
    const { formData, uploadedPhotos } = useSelector((state) => state.createRequest);
    
    // Prepare data for submission
    const requestData = {
      ...formData,
      photos: uploadedPhotos.map(photo => photo.url)
    };
    
    dispatch(submitRequest(requestData));
  };
  
  // Handle step navigation
  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      handleSubmit();
    } else {
      dispatch(nextStep());
    }
  };
  
  const handleBack = () => {
    dispatch(prevStep());
  };
  
  // Navigate to home page if submission was successful
  useEffect(() => {
    if (success) {
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
  }, [success, navigate]);
  
  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <GeneralInformationStep />;
      case 1:
        return <UploadPhotosStep />;
      case 2:
        return <DetermineDeadlineStep />;
      case 3:
        return <SetupAddressStep />;
      default:
        return <Typography>Unknown step</Typography>;
    }
  };
  
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar navigation */}
      <Sidebar />
      
      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
        <Container maxWidth="lg">
          {/* Search input */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              maxWidth: '700px',
              p: '2px 4px',
              borderRadius: '25px',
              backgroundColor: '#f5f5f5'
            }}>
              <input 
                type="text" 
                placeholder="What do you need help with" 
                style={{ 
                  width: '100%',
                  padding: '10px',
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent'
                }}
              />
            </Box>
          </Box>
          
          {/* Form header */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 3 
          }}>
            <Typography variant="h5" component="h1">
              Create Request &gt; {steps[currentStep]}
            </Typography>
            
          </Box>
          
          {/* Stepper */}
          <Stepper 
            activeStep={currentStep} 
            alternativeLabel
            sx={{ mb: 4 }}
          >
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel 
                  onClick={() => dispatch(setStep(index))}
                  sx={{ cursor: 'pointer' }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {/* Success message */}
          {success ? (
            <Paper sx={{ p: 3, textAlign: 'center', mb: 3 }}>
              <Typography variant="h6" color="success.main">
                Your request has been submitted successfully!
              </Typography>
              <Typography variant="body1">
                You will be redirected to the home page shortly.
              </Typography>
            </Paper>
          ) : null}
          
          {/* Error message */}
          {error ? (
            <Paper sx={{ p: 3, textAlign: 'center', mb: 3, bgcolor: 'error.light' }}>
              <Typography variant="h6" color="error">
                Error: {error}
              </Typography>
            </Paper>
          ) : null}
          
          {/* Step content */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 4, 
              borderRadius: 2,
              border: '1px solid #f0f0f0'
            }}
          >
            {renderStep()}
          </Paper>
          
          {/* Navigation buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
            <Box>
              {currentStep > 0 && (
                <Button
                  variant="text"
                  color="inherit"
                  onClick={handleBack}
                  disabled={loading}
                >
                  Back
                </Button>
              )}
            </Box>
            <Box>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={loading}
                sx={{ 
                  borderRadius: '20px',
                  px: 4
                }}
              >
                {currentStep === steps.length - 1 ? 'Create Request' : 'Next'}
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default CreateRequestPage;