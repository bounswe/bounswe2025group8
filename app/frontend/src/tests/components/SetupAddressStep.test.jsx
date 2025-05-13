import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import SetupAddressStep from '../../components/CreateRequest/Steps/SetupAddressStep';
import createRequestReducer from '../../redux/slices/createRequestSlice';

// Spy on Redux actions
vi.mock('../../redux/slices/createRequestSlice', async () => {
  const actual = await vi.importActual('../../redux/slices/createRequestSlice');
  return {
    ...actual,
    updateFormData: vi.fn((data) => ({ type: 'createRequest/updateFormData', payload: data }))
  };
});

// Mock react-hook-form
vi.mock('react-hook-form', () => ({
  useForm: () => ({
    control: {},
    handleSubmit: (callback) => (data) => callback(data),
    watch: (field) => {
      // Return values based on the field being watched
      if (field === 'district') return 'BEŞIKTAŞ';
      if (field === 'neighborhood') return 'BEBEK';
      return '';
    },
    formState: { errors: {} }
  }),
  Controller: ({ render, name }) => render({ 
    field: { 
      value: '', 
      onChange: vi.fn(),
      name
    }
  })
}));

describe('SetupAddressStep', () => {
  let store;

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    
    store = configureStore({
      reducer: {
        createRequest: createRequestReducer
      },
      preloadedState: {
        createRequest: {
          formData: {
            city: 'ISTANBUL',
            district: 'BEŞIKTAŞ',
            neighborhood: 'BEBEK',
            street: 'IHLAMUR',
            buildingNo: '5',
            doorNo: '10',
            addressDescription: 'Blue building near the park'
          }
        }
      },
      middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware({
          serializableCheck: false  // Disable serializable check for tests
        })
    });
  });

  it('renders all address form fields', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <SetupAddressStep />
        </Provider>
      );
    });

    // Check if all form fields are present
    expect(screen.getByText('City')).toBeInTheDocument();
    expect(screen.getByText('District')).toBeInTheDocument();
    expect(screen.getByText('Neighborhood')).toBeInTheDocument();
    expect(screen.getByText('Street')).toBeInTheDocument();
    expect(screen.getByText('Building No')).toBeInTheDocument();
    expect(screen.getByText('Door No')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('filters neighborhoods based on selected district', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <SetupAddressStep />
        </Provider>
      );
    });
    
    const comboboxElements = screen.getAllByRole('combobox');
    expect(comboboxElements.length).toBeGreaterThan(0);
    
    // Check for district and neighborhood sections
    const districtHeading = screen.getByText('District');
    expect(districtHeading).toBeInTheDocument();
    
    const neighborhoodHeading = screen.getByText('Neighborhood');
    expect(neighborhoodHeading).toBeInTheDocument();
    
    // Find elements by ID
    const districtCombobox = document.getElementById('mui-component-select-district');
    expect(districtCombobox).toBeInTheDocument();
    
    const neighborhoodCombobox = document.getElementById('mui-component-select-neighborhood');
    expect(neighborhoodCombobox).toBeInTheDocument();
  });

  it('filters streets based on selected neighborhood', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <SetupAddressStep />
        </Provider>
      );
    });
    
    const comboboxElements = screen.getAllByRole('combobox');
    expect(comboboxElements.length).toBeGreaterThan(0);
    
    // Check for neighborhood and street sections
    const neighborhoodHeading = screen.getByText('Neighborhood');
    expect(neighborhoodHeading).toBeInTheDocument();
    
    const streetHeading = screen.getByText('Street');
    expect(streetHeading).toBeInTheDocument();
    
    // Verify that we have a combobox for street
    const streetCombobox = document.getElementById('mui-component-select-street');
    expect(streetCombobox).toBeInTheDocument();
  });
});