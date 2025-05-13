import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RequestCard from '../components/RequestCard.jsx';

// Mock component dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('RequestCard Component', () => {
  const mockRequest = {
    id: '123',
    title: 'Help me move furniture',
    categories: ['MOVING_HELP', 'HEAVY_LIFTING'],
    urgency: 'Medium',
    distance: '2km away',
    postedTime: '3 hours ago',
    imageUrl: 'https://example.com/image.jpg'
  };

  const renderWithRouter = (component) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  it('renders request title correctly', () => {
    renderWithRouter(<RequestCard request={mockRequest} />);
    expect(screen.getByText('Help me move furniture')).toBeInTheDocument();
  });

  it('displays all categories', () => {
    renderWithRouter(<RequestCard request={mockRequest} />);
    expect(screen.getByText('Moving Help')).toBeInTheDocument();
    expect(screen.getByText('Heavy Lifting')).toBeInTheDocument();
  });

  it('shows the urgency level', () => {
  renderWithRouter(<RequestCard request={mockRequest} />);
  
  // Look for text that contains "Medium" anywhere
  expect(screen.getByText(/Medium/)).toBeInTheDocument();
  
  // Alternative: Check that a chip containing the urgency exists
  const urgencyElements = screen.getAllByText((content, element) => {
    return content.includes('Medium') && 
           (element.tagName.toLowerCase() === 'span' || element.closest('.MuiChip-root'));
  });
  expect(urgencyElements.length).toBeGreaterThan(0);
});

  it('displays posted time information', () => {
    renderWithRouter(<RequestCard request={mockRequest} />);
    expect(screen.getByText('3 hours ago')).toBeInTheDocument();
  });

  it('renders image when imageUrl is provided', () => {
    renderWithRouter(<RequestCard request={mockRequest} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
    expect(img).toHaveAttribute('alt', 'Help me move furniture');
  });

  it('shows "No Image" when imageUrl is not provided', () => {
    const requestWithoutImage = { ...mockRequest, imageUrl: undefined };
    renderWithRouter(<RequestCard request={requestWithoutImage} />);
    expect(screen.getByText('No Image')).toBeInTheDocument();
  });
});