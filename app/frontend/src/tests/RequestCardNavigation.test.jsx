import { vi } from 'vitest';

// Mock must be defined before importing the component
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Create the mock function at the top level
const mockNavigate = vi.fn();

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RequestCard from '../components/RequestCard.jsx';

describe('RequestCard Navigation', () => {
  const mockRequest = {
    id: '123',
    title: 'Help me move furniture',
    categories: ['MOVING_HELP'],
    urgency: 'Medium',
    distance: '2km away',
    postedTime: '3 hours ago',
  };

  const mockOnClick = vi.fn();

  // Reset mocks before each test
  beforeEach(() => {
    mockOnClick.mockReset();
    mockNavigate.mockReset();
  });

  it('calls onClick when card is clicked', () => {
    render(
      <BrowserRouter>
        <RequestCard request={mockRequest} onClick={mockOnClick} />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Help me move furniture'));
    expect(mockOnClick).toHaveBeenCalledWith('123');
  });

  it('navigates to filtered requests when category chip is clicked', () => {
    render(
      <BrowserRouter>
        <RequestCard request={mockRequest} onClick={mockOnClick} />
      </BrowserRouter>
    );

    const categoryChip = screen.getByText('Moving Help');
    fireEvent.click(categoryChip);

    // Check that navigation happened and onClick wasn't called (stopPropagation)
    expect(mockNavigate).toHaveBeenCalledWith('/requests?category=MOVING_HELP');
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('navigates to filtered requests when urgency chip is clicked', () => {
    render(
      <BrowserRouter>
        <RequestCard request={mockRequest} onClick={mockOnClick} />
      </BrowserRouter>
    );

    const urgencyChip = screen.getByText(/Medium/);
    fireEvent.click(urgencyChip);

    expect(mockNavigate).toHaveBeenCalledWith('/requests?urgency=Medium');
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  // Add these tests to your existing describe block
  it('supports keyboard navigation with Enter key', () => {
    render(
      <BrowserRouter>
        <RequestCard request={mockRequest} onClick={mockOnClick} />
      </BrowserRouter>
    );

    // Find the main card element that should be keyboard-navigable
    const card =
      screen.getByText('Help me move furniture').closest('[role="button"]') ||
      screen.getByText('Help me move furniture').closest('[tabindex="0"]') ||
      screen.getByText('Help me move furniture').closest('.MuiCard-root');

    // Focus the card
    card.focus();

    // Simulate pressing Enter
    fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });

    // Verify onClick was called with the request ID
    expect(mockOnClick).toHaveBeenCalledWith('123');
  });


  it('allows keyboard navigation to category chip', () => {
    render(
      <BrowserRouter>
        <RequestCard request={mockRequest} onClick={mockOnClick} />
      </BrowserRouter>
    );

    // Find the category chip that should be keyboard-navigable
    const categoryChip =
      screen.getByText('Moving Help').closest('[role="button"]') ||
      screen.getByText('Moving Help').closest('[tabindex="0"]') ||
      screen.getByText('Moving Help');

    // Focus the chip
    categoryChip.focus();

    // Simulate pressing Enter
    fireEvent.keyDown(categoryChip, { key: 'Enter', code: 'Enter' });

    // Verify navigation occurred to the filtered category page
    expect(mockNavigate).toHaveBeenCalledWith('/requests?category=MOVING_HELP');

    // Verify event propagation was stopped (card's onClick wasn't called)
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('allows keyboard navigation to urgency chip', () => {
    render(
      <BrowserRouter>
        <RequestCard request={mockRequest} onClick={mockOnClick} />
      </BrowserRouter>
    );

    // Find the urgency chip
    const urgencyChip =
      screen.getByText(/Medium/).closest('[role="button"]') ||
      screen.getByText(/Medium/).closest('[tabindex="0"]') ||
      screen.getByText(/Medium/);

    // Focus the chip
    urgencyChip.focus();

    // Simulate pressing Enter
    fireEvent.keyDown(urgencyChip, { key: 'Enter', code: 'Enter' });

    // Verify navigation occurred to the filtered urgency page
    expect(mockNavigate).toHaveBeenCalledWith('/requests?urgency=Medium');

    // Verify event propagation was stopped
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('has proper focus indicators for keyboard navigation', () => {
    render(
      <BrowserRouter>
        <RequestCard request={mockRequest} onClick={mockOnClick} />
      </BrowserRouter>
    );

    // Find all focusable elements within the card
    const card = screen.getByText('Help me move furniture').closest('.MuiCard-root');
    const categoryChip = screen.getByText('Moving Help');
    const urgencyChip = screen.getByText(/Medium/);

    // Check that they have appropriate tabindex attributes
    expect(card).toHaveAttribute('tabindex', '0');

    // For chips, either they themselves should be focusable or their container
    const categoryChipFocusable =
      categoryChip.hasAttribute('tabindex') || categoryChip.closest('[tabindex="0"]') !== null;
    const urgencyChipFocusable =
      urgencyChip.hasAttribute('tabindex') || urgencyChip.closest('[tabindex="0"]') !== null;

    expect(categoryChipFocusable || urgencyChipFocusable).toBeTruthy();

    // Focus the card and verify it's the active element (showing it can receive focus)
    card.focus();
    expect(document.activeElement).toBe(card);
  });
});
