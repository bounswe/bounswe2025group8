import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import GeneralInformationStep from '../../components/CreateRequest/Steps/GeneralInformationStep';
import createRequestReducer from '../../redux/slices/createRequestSlice';

// Spy on Redux actions
vi.mock('../../redux/slices/createRequestSlice', async () => {
  const actual = await vi.importActual('../../redux/slices/createRequestSlice');
  return {
    ...actual,
    updateFormData: vi.fn((data) => ({ type: 'createRequest/updateFormData', payload: data })),
    incrementRequiredPeople: vi.fn(() => ({ type: 'createRequest/incrementRequiredPeople' })),
    decrementRequiredPeople: vi.fn(() => ({ type: 'createRequest/decrementRequiredPeople' }))
  };
});

// Mock react-hook-form
vi.mock('react-hook-form', () => ({
  useForm: () => ({
    control: {},
    handleSubmit: (callback) => (data) => callback(data),
    formState: { errors: {} }
  }),
  Controller: ({ render, name, control }) => render({ 
    field: { 
      value: '', 
      onChange: vi.fn(),
      name
    }
  })
}));

describe('GeneralInformationStep', () => {
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
            title: 'Test Title',
            description: 'Test Description',
            category: 'Healthcare',
            urgency: 'Medium',
            requiredPeople: 2
          },
          categories: [
            { id: '1', name: 'Healthcare' },
            { id: '2', name: 'Moving Help' }
          ]
        }
      },
      middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware({
          serializableCheck: false // Disable serializable check for tests
        })
    });
  });

  it('renders form fields correctly', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <GeneralInformationStep />
        </Provider>
      );
    });

    // Check form fields are present
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Urgency')).toBeInTheDocument();
    expect(screen.getByText('Required number of people')).toBeInTheDocument();
  });

  it('displays the current number of required people', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <GeneralInformationStep />
        </Provider>
      );
    });

    // Check if the current value is displayed
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('increments required people when + button is clicked', async () => {
    const { incrementRequiredPeople } = await import('../../redux/slices/createRequestSlice');
    
    await act(async () => {
      render(
        <Provider store={store}>
          <GeneralInformationStep />
        </Provider>
      );
    });

    // Find buttons by their position - in the RequiredPeople section
    // The + button is typically the second button in that section
    const buttons = screen.getAllByRole('button');
    
    // Filter buttons to those in the "Required number of people" section
    const section = screen.getByText('Required number of people').closest('div');
    const sectionButtons = Array.from(section.querySelectorAll('button'));
    
    // The + button should be the right-most button in that section
    const addButton = sectionButtons[sectionButtons.length - 1];
    
    await act(async () => {
      fireEvent.click(addButton);
    });

    // Verify incrementRequiredPeople was called
    expect(incrementRequiredPeople).toHaveBeenCalled();
  });

  it('decrements required people when - button is clicked', async () => {
    const { decrementRequiredPeople } = await import('../../redux/slices/createRequestSlice');
    
    await act(async () => {
      render(
        <Provider store={store}>
          <GeneralInformationStep />
        </Provider>
      );
    });

    // Find buttons by their position - in the RequiredPeople section
    // The - button is typically the first button in that section
    const section = screen.getByText('Required number of people').closest('div');
    const sectionButtons = Array.from(section.querySelectorAll('button'));
    
    // The - button should be the left-most button in that section
    const removeButton = sectionButtons[0];
    
    await act(async () => {
      fireEvent.click(removeButton);
    });

    // Verify decrementRequiredPeople was called
    expect(decrementRequiredPeople).toHaveBeenCalled();
  });
});