import { vi } from 'vitest';

// Mock dependencies - must be before any imports that use RequestCard
vi.mock('../components/RequestCard', () => ({
  default: ({ request, onClick }) => (
    <div data-testid={`request-card-${request.id}`} onClick={() => onClick?.(request.id)}>
      {request.title}
    </div>
  ),
}));

// Now import the testing utilities and the component to test
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import Requests from '../pages/Requests';

describe('Requests Page', () => {
  it('renders the header correctly', () => {
    render(
      <BrowserRouter>
        <Requests />
      </BrowserRouter>
    );

    expect(screen.getByText('Help Requests')).toBeInTheDocument();
    expect(
      screen.getByText('Browse open requests in your area and offer your help')
    ).toBeInTheDocument();
  });

  it('displays request cards', () => {
    render(
      <BrowserRouter>
        <Requests />
      </BrowserRouter>
    );

    // Check for the mocked RequestCard components
    const requestCards = screen.getAllByTestId(/request-card-/);
    expect(requestCards.length).toBe(6); // Assuming 6 sample requests
  });

  it('filters results when search is used', () => {
    render(
      <BrowserRouter>
        <Requests />
      </BrowserRouter>
    );

    const searchInput = screen.getByPlaceholderText('Search requests');
    fireEvent.change(searchInput, { target: { value: 'grocery' } });

    // Assuming only one result contains "grocery"
    waitFor(() => {
      expect(screen.getAllByTestId(/request-card-/)).toHaveLength(1);
    });
  });

  it('shows category filter from URL parameter', () => {
    render(
      <MemoryRouter initialEntries={['/requests?category=HOME_REPAIR']}>
        <Requests />
      </MemoryRouter>
    );

    // Check that the filter is applied
    waitFor(() => {
      expect(screen.getByText('Category: Home Repair')).toBeInTheDocument();
    });
  });
});
