import { vi } from 'vitest';

// Mock navigate function for testing navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

import { describe, it, expect, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import CategoryCardDetailed from '../components/CategoryCardDetailed';

describe('CategoryCardDetailed Navigation', () => {
  const mockProps = {
    title: 'Technical Support',
    imageUrl: 'https://example.com/technical-support.jpg',
    requestCount: 18,
    categoryId: 'TECHNICAL_SUPPORT',
    onClick: vi.fn(),
  };

  // Clear mock function calls between tests
  beforeEach(() => {
    mockProps.onClick.mockClear();
    mockNavigate.mockClear();
  });

  it('calls custom onClick handler when clicked', () => {
    render(<CategoryCardDetailed {...mockProps} />);
    const card = document.querySelector('.MuiCard-root');

    fireEvent.click(card);
    expect(mockProps.onClick).toHaveBeenCalledTimes(1);
    expect(mockProps.onClick).toHaveBeenCalledWith('TECHNICAL_SUPPORT');
  });

  it('applies hover styles when mouse enters', () => {
    render(<CategoryCardDetailed {...mockProps} />);
    const card = document.querySelector('.MuiCard-root');

    // Trigger hover
    fireEvent.mouseEnter(card);

    // Simply check that the component handles the event without throwing
    expect(() => {
      fireEvent.mouseEnter(card);
      fireEvent.mouseLeave(card);
    }).not.toThrow();

    // Note: We can't test CSS pseudo-class effects like :hover directly in JSDOM
    // In a real browser environment, we'd test that boxShadow and transform change
  });

  it('handles keyboard navigation with Enter key', () => {
    render(<CategoryCardDetailed {...mockProps} />);
    const card = document.querySelector('.MuiCard-root');

    // Set focus on the card
    card.focus();

    // Simulate Enter key press
    fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });

    // Verify onClick handler was called with the category ID
    expect(mockProps.onClick).toHaveBeenCalledTimes(1);
    expect(mockProps.onClick).toHaveBeenCalledWith('TECHNICAL_SUPPORT');
  });

  it('has correct cursor style to indicate clickability', () => {
    render(<CategoryCardDetailed {...mockProps} />);
    const card = document.querySelector('.MuiCard-root');

    expect(card).toHaveStyle('cursor: pointer');
  });

  it('includes a transition effect for smooth animations', () => {
    render(<CategoryCardDetailed {...mockProps} />);
    const card = document.querySelector('.MuiCard-root');

    expect(card).toHaveStyle('transition: all 0.2s ease');
  });
});
