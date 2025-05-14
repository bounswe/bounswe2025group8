import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, Stepper, Step, StepLabel, Paper } from '@mui/material';
import { fetchCategories, nextStep, prevStep, setStep, submitRequest, resetForm } from '../../store/slices/createRequestSlice';
import GeneralInformationStep from './Steps/GeneralInformationStep';
import UploadPhotosStep from './Steps/UploadPhotosStep';
import DetermineDeadlineStep from './Steps/DetermineDeadlineStep';
import SetupAddressStep from './Steps/SetupAddressStep';
// CSS styles are imported in the main CSS file

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
    // Get form data from redux store
  const { formData } = useSelector((state) => state.createRequest);// Handle form submission
  const handleSubmit = () => {
    // Prepare data for submission
    // Note: Photo upload functionality is temporarily disabled
    const requestData = {
      ...formData,
      photos: [] // Photo upload is disabled, so we pass an empty array
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
      // Reset the form data immediately when the submission is successful
      dispatch(resetForm());
      
      // Navigate to home page after a short delay to show success message
      setTimeout(() => {
        navigate('/');
      }, 1000);
    }
  }, [success, navigate, dispatch]);
  
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
      
      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
        <Container maxWidth="lg">
          
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