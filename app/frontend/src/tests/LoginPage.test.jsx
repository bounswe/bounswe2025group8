import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import LoginPage from '../pages/auth/LoginPage';

// Mock the useAuth hook
vi.mock('../hooks/useAuth', () => ({
  default: vi.fn(() => ({
    login: vi.fn(),
    loading: false,
    error: null
  }))
}));

// Mock the react-router-dom useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Create mock navigate function
const mockNavigate = vi.fn();

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

// Mock Redux store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = initialState) => state,
    },
    preloadedState: {
      auth: initialState
    }
  });
};

describe('LoginPage Component', () => {
  it('renders the login page with form elements', () => {
    render(
      <Provider store={createMockStore()}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </Provider>
    );

    // Check if important elements are rendered
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByText('Remember me')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Forgot my password')).toBeInTheDocument();
    expect(screen.getByText('Continue as a guest')).toBeInTheDocument();
  });

  it('handles email and password input changes', () => {
    render(
      <Provider store={createMockStore()}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </Provider>
    );

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');

    // Simulate user typing
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Check if input values are updated
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('toggles password visibility when visibility icon is clicked', () => {
    render(
      <Provider store={createMockStore()}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </Provider>
    );

    const passwordInput = screen.getByPlaceholderText('Password');
    const visibilityToggleButton = screen.getByLabelText('toggle password visibility');

    // Password should be hidden initially
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click visibility toggle button
    fireEvent.click(visibilityToggleButton);

    // Password should be visible now
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Click visibility toggle button again
    fireEvent.click(visibilityToggleButton);

    // Password should be hidden again
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('handles remember me checkbox toggle', () => {
    render(
      <Provider store={createMockStore()}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </Provider>
    );

    const rememberMeCheckbox = screen.getByRole('checkbox', { name: 'Remember me' });
    
    // Should be unchecked initially
    expect(rememberMeCheckbox).not.toBeChecked();
    
    // Click to check
    fireEvent.click(rememberMeCheckbox);
    expect(rememberMeCheckbox).toBeChecked();
    
    // Click to uncheck
    fireEvent.click(rememberMeCheckbox);
    expect(rememberMeCheckbox).not.toBeChecked();
  });

  it('submits the form with correct values', async () => {
    // Import useAuth and get mock implementation
    const useAuth = require('../hooks/useAuth').default;
    const mockLogin = vi.fn().mockResolvedValue(true);
    useAuth.mockReturnValue({ login: mockLogin, loading: false, error: null });

    render(
      <Provider store={createMockStore()}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </Provider>
    );

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });

    // Submit form
    fireEvent.click(screen.getByText('Login'));

    // Verify login was called with correct parameters
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    // Verify navigation occurred
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('displays an error message when login fails', async () => {
    // Set up mock login function to reject
    const useAuth = require('../hooks/useAuth').default;
    const mockLogin = vi.fn().mockRejectedValue(new Error('Invalid credentials'));
    useAuth.mockReturnValue({ login: mockLogin, loading: false, error: null });

    render(
      <Provider store={createMockStore()}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </Provider>
    );

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrong-password' } });

    // Submit form
    fireEvent.click(screen.getByText('Login'));

    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to sign in: Invalid credentials')).toBeInTheDocument();
    });
  });

  it('shows registration success message when URL has registered=true parameter', () => {
    render(
      <Provider store={createMockStore()}>
        <MemoryRouter initialEntries={['/login?registered=true']}>
          <LoginPage />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Registration successful! You can now log in with your credentials.')).toBeInTheDocument();
  });

  it('shows loading state during login', async () => {
    // Set up mock login function that doesn't resolve immediately
    const useAuth = require('../hooks/useAuth').default;
    const mockLogin = vi.fn().mockImplementation(() => new Promise(resolve => {})); // Never resolves
    useAuth.mockReturnValue({ login: mockLogin, loading: true, error: null });

    render(
      <Provider store={createMockStore({ loading: true })}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </Provider>
    );

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });

    // Submit form
    fireEvent.click(screen.getByText('Login'));

    // Check that login button is disabled
    expect(screen.getByText('Login')).toBeDisabled();
  });
});