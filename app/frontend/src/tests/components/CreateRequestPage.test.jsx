import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import CreateRequestPage from '../../components/CreateRequest/CreateRequestPage';
import createRequestReducer, { 
  fetchCategories, 
  nextStep, 
  prevStep, 
  setStep,
} from '../../redux/slices/createRequestSlice';

// Spy on Redux actions
vi.mock('../../redux/slices/createRequestSlice', async () => {
  const actual = await vi.importActual('../../redux/slices/createRequestSlice');
  return {
    ...actual,
    nextStep: vi.fn(() => ({ type: 'createRequest/nextStep' })),
    prevStep: vi.fn(() => ({ type: 'createRequest/prevStep' })),
    setStep: vi.fn((step) => ({ type: 'createRequest/setStep', payload: step })),
    fetchCategories: vi.fn(() => ({ type: 'createRequest/fetchCategories' })),
    submitRequest: vi.fn(() => ({ type: 'createRequest/submitRequest' }))
  };
});

// Helper to create a serializable date
const serializableDate = () => {
  const date = new Date();
  return date.toISOString();
};

// Mock the redux store
const createMockStore = (initialState) => {
  return configureStore({
    reducer: {
      createRequest: createRequestReducer
    },
    preloadedState: {
      createRequest: {
        currentStep: 0,
        loading: false,
        success: false,
        error: null,
        categories: [
          { id: '1', name: 'Healthcare' },
          { id: '2', name: 'Moving Help' }
        ],
        formData: {
          title: '',
          description: '',
          category: '',
          urgency: 'Medium',
          requiredPeople: 1,
          deadlineDate: serializableDate(),
          deadlineTime: '12:00 PM',
          city: 'ISTANBUL',
          district: '',
          neighborhood: '',
          street: '',
          buildingNo: '',
          doorNo: '',
          addressDescription: ''
        },
        uploadedPhotos: [],
        ...initialState
      }
    },
    middleware: (getDefaultMiddleware) => 
      getDefaultMiddleware({
        serializableCheck: false  // Disable serializable check for tests
      })
  });
};

// Manual component mocks
const GeneralInformationStepMock = () => <div data-testid="general-information-step">General Information Step</div>;
const UploadPhotosStepMock = () => <div data-testid="upload-photos-step">Upload Photos Step</div>;
const DetermineDeadlineStepMock = () => <div data-testid="determine-deadline-step">Determine Deadline Step</div>;
const SetupAddressStepMock = () => <div data-testid="setup-address-step">Setup Address Step</div>;
const SidebarMock = () => <div data-testid="sidebar">Sidebar</div>;

// Mock component modules
vi.mock('../../components/CreateRequest/Steps/GeneralInformationStep', () => ({
  default: () => GeneralInformationStepMock()
}));

vi.mock('../../components/CreateRequest/Steps/UploadPhotosStep', () => ({
  default: () => UploadPhotosStepMock()
}));

vi.mock('../../components/CreateRequest/Steps/DetermineDeadlineStep', () => ({
  default: () => DetermineDeadlineStepMock()
}));

vi.mock('../../components/CreateRequest/Steps/SetupAddressStep', () => ({
  default: () => SetupAddressStepMock()
}));

vi.mock('../../components/Sidebar/Sidebar', () => ({
  default: () => SidebarMock()
}));

// Mock useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

describe('CreateRequestPage', () => {
  let store;

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    
    // Create a fresh store before each test
    store = createMockStore();
  });

  it('renders correctly with initial step', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <BrowserRouter>
            <CreateRequestPage />
          </BrowserRouter>
        </Provider>
      );
    });

    // Check heading
    expect(screen.getByText(/Create Request > General Information/i)).toBeInTheDocument();
    
    // Check navigation buttons
    expect(screen.queryByText('Back')).not.toBeInTheDocument();  // No back button on first step
    expect(screen.getByText('Next')).toBeInTheDocument();
    
    // Verify that fetchCategories was called
    expect(fetchCategories).toHaveBeenCalled();
  });

  it('navigates to the next step when Next button is clicked', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <BrowserRouter>
            <CreateRequestPage />
          </BrowserRouter>
        </Provider>
      );
    });

    // Click Next button
    await act(async () => {
      fireEvent.click(screen.getByText('Next'));
    });
    
    // Verify nextStep action was called
    expect(nextStep).toHaveBeenCalled();
  });

  it('navigates to the previous step when Back button is clicked', async () => {
    // Start at step 1
    store = createMockStore({ currentStep: 1 });
    
    await act(async () => {
      render(
        <Provider store={store}>
          <BrowserRouter>
            <CreateRequestPage />
          </BrowserRouter>
        </Provider>
      );
    });

    // Click Back button
    await act(async () => {
      fireEvent.click(screen.getByText('Back'));
    });
    
    // Verify prevStep action was called
    expect(prevStep).toHaveBeenCalled();
  });

  it('displays success message when submission is successful', async () => {
    // Set success flag to true
    store = createMockStore({ success: true });
    
    await act(async () => {
      render(
        <Provider store={store}>
          <BrowserRouter>
            <CreateRequestPage />
          </BrowserRouter>
        </Provider>
      );
    });

    expect(screen.getByText('Your request has been submitted successfully!')).toBeInTheDocument();
    expect(screen.getByText('You will be redirected to the home page shortly.')).toBeInTheDocument();
  });

  it('displays error message when submission fails', async () => {
    // Set error message
    store = createMockStore({ error: 'Failed to submit request' });
    
    await act(async () => {
      render(
        <Provider store={store}>
          <BrowserRouter>
            <CreateRequestPage />
          </BrowserRouter>
        </Provider>
      );
    });

    expect(screen.getByText('Error: Failed to submit request')).toBeInTheDocument();
  });

  it('allows direct navigation by clicking on stepper labels', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <BrowserRouter>
            <CreateRequestPage />
          </BrowserRouter>
        </Provider>
      );
    });

    // Click on the third step label
    await act(async () => {
      fireEvent.click(screen.getByText('Determine Deadline'));
    });
    
    // Verify setStep action was called with correct index
    expect(setStep).toHaveBeenCalledWith(2);
  });
});
