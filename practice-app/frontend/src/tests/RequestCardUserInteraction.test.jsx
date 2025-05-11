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


describe('RequestCard Interactions', () => {
  const mockRequest = {
    id: '123',
    title: 'Help me move furniture',
    categories: ['MOVING_HELP'],
    urgency: 'Medium',
    distance: '2km away',
    postedTime: '3 hours ago'
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
    
    const urgencyChip = screen.getByText('Medium');
    fireEvent.click(urgencyChip);
    
    expect(mockNavigate).toHaveBeenCalledWith('/requests?urgency=Medium');
    expect(mockOnClick).not.toHaveBeenCalled();
  });
});