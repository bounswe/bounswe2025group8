import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { format } from 'date-fns';
import DetermineDeadlineStep from '../../components/CreateRequest/Steps/DetermineDeadlineStep';
import createRequestReducer from '../../redux/slices/createRequestSlice';

// Spy on Redux actions
vi.mock('../../redux/slices/createRequestSlice', async () => {
  const actual = await vi.importActual('../../redux/slices/createRequestSlice');
  return {
    ...actual,
    updateFormData: vi.fn((data) => ({ type: 'createRequest/updateFormData', payload: data }))
  };
});

// Mock MUI Date and Time pickers
vi.mock('@mui/x-date-pickers', () => ({
  LocalizationProvider: ({ children }) => <div>{children}</div>,
  DateCalendar: () => <div data-testid="date-calendar" />,
  TimePicker: ({ value, onChange }) => (
    <button 
      data-testid="time-picker" 
      onClick={() => onChange(new Date('2025-01-01 14:30:00'))}
    >
      Select Time
    </button>
  )
}));

vi.mock('@mui/x-date-pickers/AdapterDateFns', () => ({
  AdapterDateFns: class {}
}));

describe('DetermineDeadlineStep', () => {
  let store;
  const today = new Date();

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
            deadlineDate: today.toISOString(),  // Use serializable date
            deadlineTime: '12:00 PM'
          }
        }
      },
      middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware({
          serializableCheck: false  // Disable serializable check for tests
        })
    });
  });

  it('renders date and time selection components', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <DetermineDeadlineStep />
        </Provider>
      );
    });

    expect(screen.getByText('Select Date')).toBeInTheDocument();
    // Use queryByRole to find the heading element specifically
    expect(screen.getByRole('heading', { name: 'Select Time' })).toBeInTheDocument();
    
    // Check if current month and year are displayed
    expect(screen.getByText(format(today, 'MMMM yyyy'))).toBeInTheDocument();
  });

  it('displays navigation buttons for month selection', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <DetermineDeadlineStep />
        </Provider>
      );
    });

    // Check for prev/next month buttons by finding the buttons directly
    const navigationButtons = screen.getAllByRole('button').filter(button => {
      // Find buttons that contain an SVG icon
      return button.querySelector('svg') !== null;
    });
    
    expect(navigationButtons.length).toBeGreaterThanOrEqual(2); // At least prev and next buttons
  });

  it('updates deadline time when time is selected', async () => {
    const { updateFormData } = await import('../../redux/slices/createRequestSlice');
    
    await act(async () => {
      render(
        <Provider store={store}>
          <DetermineDeadlineStep />
        </Provider>
      );
    });

    // Click the time picker button
    await act(async () => {
      fireEvent.click(screen.getByTestId('time-picker'));
    });
    
    // Verify updateFormData was called with new time
    expect(updateFormData).toHaveBeenCalledWith({ 
      deadlineTime: expect.any(String) 
    });
  });

  it('navigates to previous month when prev button is clicked', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <DetermineDeadlineStep />
        </Provider>
      );
    });

    // Initial month display
    const initialMonthText = screen.getByText(format(today, 'MMMM yyyy')).textContent;
    
    // Find and click prev month button using the correct testId
    await act(async () => {
      const prevButton = screen.getByTestId('ArrowBackIosIcon').closest('button');
      fireEvent.click(prevButton);
    });
    
    // Use waitFor to ensure state updates have been processed
    await waitFor(() => {
      const currentMonthText = screen.getByText(/[A-Za-z]+ \d{4}/).textContent;
      expect(currentMonthText).not.toBe(initialMonthText);
    });
  });

  it('navigates to next month when next button is clicked', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <DetermineDeadlineStep />
        </Provider>
      );
    });

    // Initial month display
    const initialMonthText = screen.getByText(format(today, 'MMMM yyyy')).textContent;
    
    // Find and click next month button using the correct testId
    await act(async () => {
      const nextButton = screen.getByTestId('ArrowForwardIosIcon').closest('button');
      fireEvent.click(nextButton);
    });
    
    // Use waitFor to ensure state updates have been processed
    await waitFor(() => {
      const currentMonthText = screen.getByText(/[A-Za-z]+ \d{4}/).textContent;
      expect(currentMonthText).not.toBe(initialMonthText);
    });
  });
});