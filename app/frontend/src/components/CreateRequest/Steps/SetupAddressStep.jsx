import React from 'react';
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
  Grid
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { updateFormData } from '../../../store/slices/createRequestSlice';

// Mock address data
const addressData = {
  districts: [
    { id: '1', name: 'SARIYER' },
    { id: '2', name: 'BEŞIKTAŞ' },
    { id: '3', name: 'KADIKOY' },
    { id: '4', name: 'SISLI' },
    { id: '5', name: 'USKUDAR' }
  ],
  neighborhoods: [
    { id: '1', name: 'HISARUSTU', districtId: '1' },
    { id: '2', name: 'EMIRGAN', districtId: '1' },
    { id: '3', name: 'BEBEK', districtId: '2' },
    { id: '4', name: 'ORTAKOY', districtId: '2' },
    { id: '5', name: 'MODA', districtId: '3' }
  ],
  streets: [
    { id: '1', name: 'BAL', neighborhoodId: '1' },
    { id: '2', name: 'SELVI', neighborhoodId: '1' },
    { id: '3', name: 'KAVAK', neighborhoodId: '2' },
    { id: '4', name: 'IHLAMUR', neighborhoodId: '3' },
    { id: '5', name: 'GOZTEPE', neighborhoodId: '5' }
  ]
};

const SetupAddressStep = () => {
  const dispatch = useDispatch();
  const { formData } = useSelector((state) => state.createRequest);
  
  const { control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      city: formData.city,
      district: formData.district,
      neighborhood: formData.neighborhood,
      street: formData.street,
      buildingNo: formData.buildingNo,
      doorNo: formData.doorNo,
      addressDescription: formData.addressDescription
    }
  });
  
  // Watch district and neighborhood values for filtering
  const watchDistrict = watch('district');
  const watchNeighborhood = watch('neighborhood');
  
  // Filter neighborhoods based on selected district
  const filteredNeighborhoods = watchDistrict
    ? addressData.neighborhoods.filter(n => n.districtId === addressData.districts.find(d => d.name === watchDistrict)?.id)
    : [];
  
  // Filter streets based on selected neighborhood
  const filteredStreets = watchNeighborhood
    ? addressData.streets.filter(s => s.neighborhoodId === addressData.neighborhoods.find(n => n.name === watchNeighborhood)?.id)
    : [];
  
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
      <Box
        component="form"
        onSubmit={handleSubmit((data) => dispatch(updateFormData(data)))}
      >
        {/* City | District */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
          {/* City */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              City
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
                  >
                    <MenuItem value="ISTANBUL">ISTANBUL</MenuItem>
                  </Select>
                  {errors.city && <FormHelperText>{errors.city.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Box>

          {/* District */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              District
            </Typography>
            <Controller
              name="district"
              control={control}
              rules={{ required: 'District is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.district}>
                  <Select
                    {...field}
                    displayEmpty
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange('district', e.target.value);
                      handleFieldChange('neighborhood', '');
                      handleFieldChange('street', '');
                    }}
                  >
                    {addressData.districts.map((d) => (
                      <MenuItem key={d.id} value={d.name}>
                        {d.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.district && <FormHelperText>{errors.district.message}</FormHelperText>}
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
              rules={{ required: 'Neighborhood is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.neighborhood}>
                  <Select
                    {...field}
                    displayEmpty
                    disabled={!watchDistrict}
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange('neighborhood', e.target.value);
                      handleFieldChange('street', '');
                    }}
                  >
                    {filteredNeighborhoods.map((n) => (
                      <MenuItem key={n.id} value={n.name}>
                        {n.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.neighborhood && (
                    <FormHelperText>{errors.neighborhood.message}</FormHelperText>
                  )}
                </FormControl>
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
              rules={{ required: 'Street is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.street}>
                  <Select
                    {...field}
                    displayEmpty
                    disabled={!watchNeighborhood}
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange('street', e.target.value);
                    }}
                  >
                    {filteredStreets.map((s) => (
                      <MenuItem key={s.id} value={s.name}>
                        {s.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.street && <FormHelperText>{errors.street.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Box>
        </Box>

        {/* Building | Door */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
          {/* Building No */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Building No
            </Typography>
            <Controller
              name="buildingNo"
              control={control}
              rules={{ required: 'Building number is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.buildingNo}>
                  <Select
                    {...field}
                    displayEmpty
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange('buildingNo', e.target.value);
                    }}
                  >
                    {[...Array(100)].map((_, i) => (
                      <MenuItem key={i} value={String(i + 1)}>
                        {i + 1}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.buildingNo && (
                    <FormHelperText>{errors.buildingNo.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Box>

          {/* Door No */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Door No
            </Typography>
            <Controller
              name="doorNo"
              control={control}
              rules={{ required: 'Door number is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.doorNo}>
                  <Select
                    {...field}
                    displayEmpty
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange('doorNo', e.target.value);
                    }}
                  >
                    {[...Array(50)].map((_, i) => (
                      <MenuItem key={i} value={String(i + 1)}>
                        {i + 1}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.doorNo && <FormHelperText>{errors.doorNo.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Box>
        </Box>

        {/* Description */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Description
          </Typography>
          <Controller
            name="addressDescription"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                multiline
                rows={3}
                placeholder="Input text"
                variant="outlined"
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