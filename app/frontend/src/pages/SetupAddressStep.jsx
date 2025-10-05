import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Box, 
  Typography, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl,
  FormHelperText,
  InputLabel,
  Grid,
  CircularProgress,
  Alert,
  Avatar,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { updateFormData } from '../features/request/store/createRequestSlice';
import * as createRequestService from '../features/request/services/createRequestService';

const SetupAddressStep = () => {
  const dispatch = useDispatch();
  const { formData } = useSelector((state) => state.createRequest);

  // State for location data
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState({
    countries: false,
    states: false,
    cities: false
  });
  const [error, setError] = useState(null);
    const { control, handleSubmit, watch, formState: { errors }, setValue } = useForm({
    defaultValues: {
      country: formData.country || '',
      state: formData.state || '',
      city: formData.city || '',
      neighborhood: formData.neighborhood || '',
      street: formData.street || '',
      buildingNo: formData.buildingNo || '',
      doorNo: formData.doorNo || '',
      addressDescription: formData.addressDescription || ''
    }
  });
  
  // Watch country, state, and city values for filtering
  const watchCountry = watch('country');
  const watchState = watch('state');
  const watchCity = watch('city');

  // Fetch countries when component mounts
  useEffect(() => {
    const fetchCountryData = async () => {
      try {
        setLoading(prev => ({ ...prev, countries: true }));
        setError(null);
        const countriesData = await createRequestService.fetchCountries();
        setCountries(countriesData);
      } catch (err) {
        console.error('Error fetching countries:', err);
        setError('Failed to load countries. Please try again later.');
      } finally {
        setLoading(prev => ({ ...prev, countries: false }));
      }
    };

    fetchCountryData();
  }, []);

  // Fetch states when country changes
  useEffect(() => {
    if (!watchCountry) {
      setStates([]);
      return;
    }

    const fetchStateData = async () => {
      try {
        setLoading(prev => ({ ...prev, states: true }));
        setError(null);
        
        // Get the country code from the selected country value
        const selectedCountry = countries.find(c => c.code === watchCountry);
        if (!selectedCountry) return;

        const statesData = await createRequestService.fetchStates(selectedCountry.name);
        setStates(statesData);
      } catch (err) {
        console.error('Error fetching states/provinces:', err);
        setError('Failed to load states/provinces. Please try again later.');
      } finally {
        setLoading(prev => ({ ...prev, states: false }));
      }
    };

    fetchStateData();
  }, [watchCountry, countries]);

  // Fetch cities when state changes
  useEffect(() => {
    if (!watchCountry || !watchState) {
      setCities([]);
      return;
    }

    const fetchCityData = async () => {
      try {
        setLoading(prev => ({ ...prev, cities: true }));
        setError(null);
        
        // Get the country name from the selected country code
        const selectedCountry = countries.find(c => c.code === watchCountry);
        if (!selectedCountry) return;

        const citiesData = await createRequestService.fetchCities(selectedCountry.name, watchState);
        setCities(citiesData);
      } catch (err) {
        console.error('Error fetching cities:', err);
        setError('Failed to load cities. Please try again later.');
      } finally {
        setLoading(prev => ({ ...prev, cities: false }));
      }
    };

    fetchCityData();
  }, [watchCountry, watchState, countries]);
    // Auto-save form data happens when fields change (handled by handleFieldChange)
  // Auto-save form data when fields change
  const handleFieldChange = (field, value) => {
    dispatch(updateFormData({ [field]: value }));
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box
        component="form"
        onSubmit={handleSubmit((data) => dispatch(updateFormData(data)))}
      >
        {/* Country | State/Province */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
          {/* Country */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Country
            </Typography>
            <Controller
              name="country"
              control={control}
              rules={{ required: 'Country is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.country}>
                  <Select
                    {...field}
                    displayEmpty                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange('country', e.target.value);
                      // Reset state and city when country changes
                      setValue('state', '');
                      setValue('city', '');
                      handleFieldChange('state', '');
                      handleFieldChange('city', '');
                    }}
                    startAdornment={loading.countries && (
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                    )}
                    disabled={loading.countries}
                    renderValue={(selected) => {
                      if (!selected) {
                        return <em>Select Country</em>;
                      }
                      const selectedCountry = countries.find(c => c.code === selected);
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {selectedCountry && (
                            <Avatar 
                              src={selectedCountry.flag} 
                              alt={selectedCountry.name} 
                              sx={{ width: 24, height: 24, mr: 1 }}
                            />
                          )}
                          {selectedCountry ? selectedCountry.name : selected}
                        </Box>
                      );
                    }}
                  >
                    <MenuItem value="">
                      <em>Select Country</em>
                    </MenuItem>
                    {countries.map((country) => (
                      <MenuItem key={country.code} value={country.code}>
                        <ListItemIcon>
                          <Avatar 
                            src={country.flag} 
                            alt={country.name} 
                            sx={{ width: 24, height: 24 }}
                          />
                        </ListItemIcon>
                        <ListItemText>{country.name}</ListItemText>
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.country && <FormHelperText>{errors.country.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Box>

          {/* State/Province */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              State/Province
            </Typography>
            <Controller
              name="state"
              control={control}
              rules={{ required: 'State/Province is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.state}>
                  <Select
                    {...field}
                    displayEmpty                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange('state', e.target.value);
                      // Reset city when state changes
                      setValue('city', '');
                      handleFieldChange('city', '');
                    }}
                    startAdornment={loading.states && (
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                    )}
                    disabled={!watchCountry || loading.states}
                  >
                    <MenuItem value="">
                      <em>Select State/Province</em>
                    </MenuItem>
                    {states.map((state) => (
                      <MenuItem key={state.code || state.name} value={state.name}>
                        {state.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.state && <FormHelperText>{errors.state.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Box>
        </Box>        {/* City */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              City/District
            </Typography>
            <Controller
              name="city"
              control={control}
              rules={{ required: 'City is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.city}>
                  <Select
                    {...field}
                    displayEmpty
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange('city', e.target.value);
                    }}
                    startAdornment={loading.cities && (
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                    )}
                    disabled={!watchState || loading.cities}
                  >
                    <MenuItem value="">
                      <em>Select City</em>
                    </MenuItem>
                    {cities.map((city) => (
                      <MenuItem key={city.name} value={city.name}>
                        {city.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.city && <FormHelperText>{errors.city.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Box>
        </Box>

        {/* Neighborhood | Street */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
          {/* Neighborhood */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Neighborhood
            </Typography>
            <Controller
              name="neighborhood"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  placeholder="Enter neighborhood"
                  onChange={(e) => {
                    field.onChange(e);
                    handleFieldChange('neighborhood', e.target.value);
                  }}
                  disabled={!watchCity}
                />
              )}
            />
          </Box>

          {/* Street */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Street
            </Typography>
            <Controller
              name="street"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  placeholder="Enter street"
                  onChange={(e) => {
                    field.onChange(e);
                    handleFieldChange('street', e.target.value);
                  }}
                  disabled={!watchCity}
                />
              )}
            />
          </Box>
        </Box>

        {/* Building No | Door No */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
          {/* Building No */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Building Number
            </Typography>
            <Controller
              name="buildingNo"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  placeholder="e.g. 14"
                  onChange={(e) => {
                    field.onChange(e);
                    handleFieldChange('buildingNo', e.target.value);
                  }}
                />
              )}
            />
          </Box>

          {/* Door No */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Door / Apartment Number
            </Typography>
            <Controller
              name="doorNo"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  placeholder="e.g. 5"
                  onChange={(e) => {
                    field.onChange(e);
                    handleFieldChange('doorNo', e.target.value);
                  }}
                />
              )}
            />
          </Box>
        </Box>

        {/* Additional Address Details */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Additional Address Details
          </Typography>
          <Controller
            name="addressDescription"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                multiline
                rows={4}
                placeholder="Add any additional details for finding the address..."
                onChange={(e) => {
                  field.onChange(e);
                  handleFieldChange('addressDescription', e.target.value);
                }}
              />
            )}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default SetupAddressStep;