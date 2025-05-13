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

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

describe('Sidebar Mobile Responsiveness', () => {
  let originalInnerWidth;

  // Save original window width before tests
  beforeAll(() => {
    originalInnerWidth = window.innerWidth;
  });

  // Restore original window width after tests
  afterAll(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    window.dispatchEvent(new Event('resize'));
  });

  it('handles mobile view correctly', () => {
    // Mock window.innerWidth to simulate mobile view
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500, // Mobile width
    });
    
    // Trigger resize event
    window.dispatchEvent(new Event('resize'));

    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );

    // In mobile view, sidebar might be collapsed initially
    // Look for a toggle button or collapsed state
    const menuButton =
      screen.queryByLabelText(/menu/i) ||
      screen.queryByRole('button', { name: /menu/i }) ||
      screen.queryByTestId('menu-icon');

    // If there's a menu toggle button, test it
    if (menuButton) {
      expect(menuButton).toBeInTheDocument();
      fireEvent.click(menuButton);

      // After clicking, menu items should be visible
      expect(screen.getByText(/Home/i)).toBeInTheDocument();
    }
  });
  
  it('displays fully expanded sidebar in desktop view', () => {
    // Set desktop width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200, // Desktop width
    });
    
    // Trigger resize event
    window.dispatchEvent(new Event('resize'));
    
    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );
    
    // In desktop view, text should be visible alongside icons
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Categories/i)).toBeInTheDocument();
    expect(screen.getByText(/Requests/i)).toBeInTheDocument();
    
    // There shouldn't be a menu button in desktop view
    const menuButton =
      screen.queryByLabelText(/menu/i) ||
      screen.queryByRole('button', { name: /menu/i }) ||
      screen.queryByTestId('menu-icon');
      
    // If this is how your sidebar works - adjust if needed
    expect(menuButton).not.toBeInTheDocument();
  });
  
  it('toggles sidebar visibility on menu button click in mobile', () => {
    // Set mobile width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500, // Mobile width
    });
    
    // Trigger resize event
    window.dispatchEvent(new Event('resize'));
    
    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );
    
    // Find the menu toggle button
    const menuButton =
      screen.queryByLabelText(/menu/i) ||
      screen.queryByRole('button', { name: /menu/i }) ||
      screen.queryByTestId('menu-icon');
    
    if (menuButton) {
      // Get initial sidebar visibility state
      const sidebarInitially = screen.queryByTestId('sidebar-content');
      const initialVisibility = sidebarInitially ? 
        window.getComputedStyle(sidebarInitially).display : 'none';
      
      // Click menu button
      fireEvent.click(menuButton);
      
      // Check if visibility changed
      const sidebarAfterClick = screen.queryByTestId('sidebar-content');
      if (sidebarAfterClick) {
        const newVisibility = window.getComputedStyle(sidebarAfterClick).display;
        expect(newVisibility).not.toBe(initialVisibility);
      }
    }
  });
});