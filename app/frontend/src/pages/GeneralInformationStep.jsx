import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Box, 
  Typography, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { 
  updateFormData, 
  incrementRequiredPeople, 
  decrementRequiredPeople 
} from '../features/request/store/createRequestSlice';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CreateIcon from '@mui/icons-material/Create';
import {urgencyLevels} from '../constants/urgency_level';



const GeneralInformationStep = () => {
  const dispatch = useDispatch();
  const { formData, categories } = useSelector((state) => state.createRequest);
  
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      urgency: formData.urgency,
      requiredPeople: formData.requiredPeople
    }
  });
  
  // Handle form data changes
  const onSubmit = (data) => {
    dispatch(updateFormData(data));
  };
  
  // Auto-save form data when fields change
  const handleFieldChange = (field, value) => {
    dispatch(updateFormData({ [field]: value }));
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 4 }}>
          {/* Left Column */}
          <Box sx={{ flex: 1 }}>
            {/* Title */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Title
              </Typography>
              <Controller
                name="title"
                control={control}
                rules={{ 
                  required: 'Title is required',
                  minLength: {
                    value: 3,
                    message: 'Title must be at least 3 characters'
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    placeholder="Help me to see a doctor"
                    variant="outlined"
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange('title', e.target.value);
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CreateIcon sx={{ color: '#5C69FF' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Box>
              {/* Category */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Category
              </Typography>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth variant="outlined">
                    <Select
                      {...field}
                      displayEmpty
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange('category', e.target.value);
                      }}
                    >
                      {/* Add "Other" as a fallback option even if API doesn't return it */}
                      <MenuItem value="OTHER">Other Services</MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category.value} value={category.value}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Box>
          </Box>
          
          {/* Right Column */}
          <Box sx={{ flex: 1 }}>
            {/* Description */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Description
              </Typography>
              <Controller
                name="description"
                control={control}
                rules={{ 
                  required: 'Description is required'
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={1}  // To set the height of the "Description" part same with the "Title" part
                    placeholder="Input text"
                    variant="outlined"
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange('description', e.target.value);
                    }}
                  />
                )}
              />
            </Box>
            
            {/* Urgency */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Urgency
              </Typography>
              <Controller
                name="urgency"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth variant="outlined">
                    <Select
                      {...field}
                      displayEmpty                        onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange('urgency', e.target.value);
                        }} > {Object.entries(urgencyLevels).map(([key, value]) => (
                        <MenuItem key={key} value={String(key)}>{value.name}</MenuItem>
                        ))}
                      </Select>
                      </FormControl>
                    )}
                    />
                  </Box>
                  </Box>
                </Box>
                
                {/* Required number of people - Full width */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ textAlign: 'left'}}>
            Required number of people
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              onClick={() => dispatch(decrementRequiredPeople())}
              disabled={formData.requiredPeople <= 1}
              sx={{ 
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
                padding: '8px',
                '&:hover': {
                  backgroundColor: '#e0e0e0',
                }
              }}
            >
              <RemoveIcon />
            </IconButton>
            
            <Typography 
              sx={{ 
                mx: 2, 
                width: 30, 
                textAlign: 'center',
                fontWeight: 'bold'
              }}
            >
              {formData.requiredPeople}
            </Typography>
            
            <IconButton 
              onClick={() => dispatch(incrementRequiredPeople())}
              sx={{ 
                backgroundColor: '#5C69FF',
                color: 'white',
                borderRadius: '4px',
                padding: '8px',
                '&:hover': {
                  backgroundColor: '#4C58E0',
                }
              }}
            >
              <AddIcon />
            </IconButton>
          </Box>
        </Box>
      </form>
    </Box>
  );
};

export default GeneralInformationStep