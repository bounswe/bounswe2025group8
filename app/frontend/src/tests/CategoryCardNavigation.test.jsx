import { vi } from 'vitest';

// Mock navigate function for testing navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CategoryCard from '../components/CategoryCard';

describe('CategoryCard Navigation', () => {
  const mockProps = {
    title: 'Technical Support',
    image: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d',
    categoryId: 'TECHNICAL_SUPPORT',
    requestCount: 18,
    onClick: vi.fn(),
  };

  // Clear mock function calls between tests
  beforeEach(() => {
    mockProps.onClick.mockClear();
    mockNavigate.mockClear();
  });

  it('calls onClick handler when clicked', () => {
    render(<CategoryCard {...mockProps} />);
    // Since there's no element with the role "button", let's find the card directly
    const card =
      document.querySelector('.MuiCard-root') || document.querySelector('[class*="MuiCard"]');

    // Make sure we found something
    expect(card).not.toBeNull();
    fireEvent.click(card);
    expect(mockProps.onClick).toHaveBeenCalledTimes(1);
  });

  it('supports keyboard navigation with Enter key', () => {
    render(<CategoryCard {...mockProps} />);
    // Since there's no element with the role "button", let's find the card directly
    const card =
      document.querySelector('.MuiCard-root') || document.querySelector('[class*="MuiCard"]');

    // Make sure we found something
    expect(card).not.toBeNull();
    // Simulate keyboard navigation
    fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });
    expect(mockProps.onClick).toHaveBeenCalled();
  });

  it('supports accessibility by having proper aria attributes', () => {
    render(<CategoryCard {...mockProps} />);

    // Card should be keyboard focusable
    const card = screen.getByRole('button') || document.querySelector('[role="button"]');
    expect(card).toHaveAttribute('tabindex', '0');
  });

  // Test for hover effects
  it('handles mouse hover events without errors', () => {
    render(<CategoryCard {...mockProps} />);

    // Find the card
    const card =
      document.querySelector('.MuiCard-root') || document.querySelector('[class*="MuiCard"]');
    expect(card).not.toBeNull();

    // Just verify we can hover without errors
    expect(() => {
      fireEvent.mouseEnter(card);
      fireEvent.mouseLeave(card);
    }).not.toThrow();
  });
});
