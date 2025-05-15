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

// Mock the auth hook for an authenticated user
vi.mock('../hooks', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    currentUser: { id: '123', name: 'Test User' },
    userRole: 'user',
  }),
}));

// Mock the UserAvatar component
vi.mock('../components/UserAvatar.jsx', () => ({
  default: ({ user }) => <img alt={`Avatar for ${user?.name}`} data-testid="user-avatar" />
}));

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

describe('Sidebar for Authenticated Users', () => {
  beforeEach(() => {
    mockNavigate.mockClear();

    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );
  });

  it('hides login and signup buttons for authenticated users', () => {
    // Login/signup buttons should not be present
    expect(screen.queryByText(/Login/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Sign[ -]?up/i)).not.toBeInTheDocument();
  });

  it("displays the user's name and avatar", () => {
    // User's name should be displayed
    expect(screen.getByText(/Test User/i)).toBeInTheDocument();

    // Avatar should be present
    expect(screen.getByTestId('user-avatar')).toBeInTheDocument();
  });

  it('navigates to the user profile when the avatar is clicked', () => {
    // Find avatar by test ID (more reliable than role="img")
    const avatarContainer = screen.getByTestId('user-avatar').closest('div');
    
    // Click on the container that has the onClick handler
    fireEvent.click(avatarContainer);
    
    // Verify navigation to the correct profile URL
    expect(mockNavigate).toHaveBeenCalledWith('/profile/123');
  });

  // Navigates to the user profile when the username is clicked
  it('navigates to the user profile when the username is clicked', () => {
    const username = screen.getByText(/Test User/i);
    fireEvent.click(username);
    expect(mockNavigate).toHaveBeenCalledWith('/profile/123');
  });

  it('navigates to the create request page when the create button is clicked', () => {
    fireEvent.click(screen.getByText(/Create/i));
    expect(mockNavigate).toHaveBeenCalledWith('/create-request');
  });

  it('navigates to the home page when the home link is clicked', () => {
    fireEvent.click(screen.getByText(/Home/i));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
  it('navigates to the requests page when the requests link is clicked', () => {
    fireEvent.click(screen.getByText(/Requests/i));
    expect(mockNavigate).toHaveBeenCalledWith('/requests');
  });
  it('navigates to the categories page when the categories link is clicked', () => {
    fireEvent.click(screen.getByText(/Categories/i));
    expect(mockNavigate).toHaveBeenCalledWith('/categories');
  });

  // Displays notification and settings icons
  it('displays notification and settings icons', () => {
    expect(screen.getByLabelText(/notifications/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/settings/i)).toBeInTheDocument();
  });
  it('navigates to the notifications page when the notification icon is clicked', () => {
    const notificationIcon = screen.getByLabelText(/notifications/i);
    fireEvent.click(notificationIcon);
    expect(mockNavigate).toHaveBeenCalledWith('/notifications');
  });
  it('navigates to the settings page when the settings icon is clicked', () => {
    const settingsIcon = screen.getByLabelText(/settings/i);
    fireEvent.click(settingsIcon);
    expect(mockNavigate).toHaveBeenCalledWith('/settings');
  });
});
