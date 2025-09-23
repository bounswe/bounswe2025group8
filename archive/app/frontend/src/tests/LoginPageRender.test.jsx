import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';

// Mock component dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ search: '' }),
  };
});

// Mock useAuth hook
vi.mock('../hooks/useAuth', () => ({
  default: () => ({
    login: vi.fn(),
    loading: false,
    error: null,
  }),
}));

describe('LoginPage Component', () => {
  const mockLoginData = {
    email: 'test@example.com',
    password: 'password123',
    rememberMe: true,
  };

  const renderWithRouter = (component) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  it('renders login page title correctly', () => {
    renderWithRouter(<LoginPage />);
    expect(screen.getByText('Neighborhood')).toBeInTheDocument();
    expect(screen.getByText('Assistance Board')).toBeInTheDocument();
  });

  it('displays login form elements', () => {
    renderWithRouter(<LoginPage />);
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByText('Enter your details to sign in to your account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByText('Remember me')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('shows login and register tabs', () => {
    renderWithRouter(<LoginPage />);
    expect(screen.getByText('LOGIN')).toBeInTheDocument();
    expect(screen.getByText('REGISTER')).toBeInTheDocument();
  });
  it('displays password visibility toggle', () => {
    renderWithRouter(<LoginPage />);
    
    const passwordInput = screen.getByPlaceholderText('Password');
    const visibilityToggleButton = screen.getByLabelText('toggle password visibility');
    
    // Password should be hidden initially
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click visibility toggle button
    fireEvent.click(visibilityToggleButton);
    
    // Password should be visible now
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('shows "Forgot my password" link', () => {
    renderWithRouter(<LoginPage />);
    expect(screen.getByText('Forgot my password')).toBeInTheDocument();
  });

  it('shows "Continue as a guest" link', () => {
    renderWithRouter(<LoginPage />);
    expect(screen.getByText('Continue as a guest')).toBeInTheDocument();
  });

  it('handles form inputs with mock login data', () => {
    renderWithRouter(<LoginPage />);
    
    // Get form elements
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const rememberMeCheckbox = screen.getByRole('checkbox', { name: 'Remember me' });
    
    // Fill with mock data
    fireEvent.change(emailInput, { target: { value: mockLoginData.email } });
    fireEvent.change(passwordInput, { target: { value: mockLoginData.password } });
    
    if (mockLoginData.rememberMe) {
      fireEvent.click(rememberMeCheckbox); 
    }
    
    // Verify inputs have the mock values
    expect(emailInput.value).toBe(mockLoginData.email);
    expect(passwordInput.value).toBe(mockLoginData.password);
    expect(rememberMeCheckbox.checked).toBe(mockLoginData.rememberMe);
  });
});
