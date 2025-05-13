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
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

describe('Sidebar Rendering', () => {
  beforeEach(() => {
    // Common setup for all render tests
    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );
  });

  it('renders the logo', () => {
    // Check for logo image
    const logoImg = screen.getByAltText('Logo');
    expect(logoImg).toBeInTheDocument();

    // Verify it's an image element
    expect(logoImg.tagName).toBe('IMG');

    // Verify the src contains the logo filename
    expect(logoImg).toHaveAttribute('src', expect.stringContaining('logo'));
  });

  it('displays navigation menu items', () => {
    // Check for the required navigation items
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Categories/i)).toBeInTheDocument();
    expect(screen.getByText(/Requests/i)).toBeInTheDocument();

    // Verify these items are part of the navigation
    const homeLink = screen.getByText(/Home/i).closest('a, button, div[role="button"]');
    const categoriesLink = screen.getByText(/Categories/i).closest('a, button, div[role="button"]');
    const requestsLink = screen.getByText(/Requests/i).closest('a, button, div[role="button"]');

    expect(homeLink).toBeInTheDocument();
    expect(categoriesLink).toBeInTheDocument();
    expect(requestsLink).toBeInTheDocument();
  });

  it('displays a Create Request button', () => {
    // For a prominent button, it might have specific styling or icons
    const createButton = screen.getByText(/Create/i);
    expect(createButton).toBeInTheDocument();

    // Check if it has Material UI button styling
    const buttonElement = createButton.closest(
      '.MuiButton-root, .MuiButtonBase-root, .MuiFab-root'
    );
    expect(buttonElement).toBeInTheDocument();

    // It might have an add icon
    const addIcon = screen.queryByTestId('AddIcon') || screen.queryByLabelText(/create/i);

    // If there's an add icon, verify it's part of the button
    if (addIcon) {
      expect(buttonElement.contains(addIcon)).toBe(true);
    }
  });

  it('highlights active route', () => {
    // Get all navigation buttons
    const navButtons = screen.getAllByRole('button');

    // Find the Requests button
    const requestsButton = navButtons.find((button) => button.textContent.match(/requests/i));

    // Verify we found it and it's selected
    expect(requestsButton).toBeTruthy();
    expect(requestsButton).toHaveClass('Mui-selected');

    // Make sure other buttons are not selected
    const otherButtons = navButtons.filter((button) => !button.textContent.match(/requests/i));

    otherButtons.forEach((button) => {
      // Only check navigation items (not login/signup buttons)
      if (button.textContent.match(/home|categories/i)) {
        expect(button).not.toHaveClass('Mui-selected');
      }
    });
  });

  it('displays Login and Signup buttons for guest users', () => {
    // We already mocked useAuth to return isAuthenticated: false, userRole: 'guest'

    // Check for the login button
    const loginButton =
      screen.getByText(/Login/i) ||
      screen.getByRole('button', { name: /login/i }) ||
      screen.getByTestId('login-button');
    expect(loginButton).toBeInTheDocument();

    // Check for the signup button
    const signupButton =
      screen.getByText(/Sign[ -]?up/i) ||
      screen.getByRole('button', { name: /sign[ -]?up/i }) ||
      screen.getByTestId('signup-button');
    expect(signupButton).toBeInTheDocument();

    // Verify they're clickable elements
    const loginClickable = loginButton.closest('a, button, div[role="button"]');
    const signupClickable = signupButton.closest('a, button, div[role="button"]');

    expect(loginClickable).toBeInTheDocument();
    expect(signupClickable).toBeInTheDocument();
  });
});
