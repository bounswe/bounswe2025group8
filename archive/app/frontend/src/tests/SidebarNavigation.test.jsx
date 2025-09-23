import { vi } from 'vitest';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/requests' }),
  };
});

// Mock the auth hook
vi.mock('../hooks', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    currentUser: null,
    userRole: 'guest',
  }),
}));

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

describe('Sidebar Navigation', () => {
  beforeEach(() => {
    mockNavigate.mockClear();

    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );
  });

  it('navigates when Home link is clicked', () => {
    fireEvent.click(screen.getByText(/Home/i));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('navigates when Requests link is clicked', () => {
    fireEvent.click(screen.getByText(/Requests/i));
    expect(mockNavigate).toHaveBeenCalledWith('/requests');
  });

  it('navigates when Categories link is clicked', () => {
    fireEvent.click(screen.getByText(/Categories/i));
    expect(mockNavigate).toHaveBeenCalledWith('/categories');
  });

  it('navigates when Create button is clicked', () => {
    fireEvent.click(screen.getByText(/Create/i));
    // For guest users, it should redirect to login instead of create-request
    expect(mockNavigate).toHaveBeenCalledWith('/login', {
      state: {
        from: '/create-request',
      },
    });

    // Check that mockNavigate was called exactly once
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it('navigates to home when logo is clicked', () => {
    // Find the logo or brand name and click it
    const logo = screen.getByAltText('Logo');
    fireEvent.click(logo);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('navigates to login page when Login button is clicked', () => {
    const loginButton =
      screen.getByText(/Login/i) ||
      screen.getByRole('button', { name: /login/i }) ||
      screen.getByTestId('login-button');

    fireEvent.click(loginButton);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('navigates to signup page when Signup button is clicked', () => {
    const signupButton =
      screen.getByText(/Sign[ -]?up/i) ||
      screen.getByRole('button', { name: /sign[ -]?up/i }) ||
      screen.getByTestId('signup-button');

    fireEvent.click(signupButton);
    expect(mockNavigate).toHaveBeenCalledWith('/signup');
  });
});
