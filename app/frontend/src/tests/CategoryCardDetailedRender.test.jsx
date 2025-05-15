import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CategoryCardDetailed from '../components/CategoryCardDetailed';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));

describe('CategoryCardDetailed Rendering', () => {
  const mockProps = {
    title: 'Home Cleaning',
    imageUrl: 'https://example.com/home-cleaning.jpg',
    requestCount: 24,
    categoryId: 'HOME_CLEANING',
    onClick: vi.fn()
  };
  
  it('renders the category title correctly', () => {
    render(<CategoryCardDetailed {...mockProps} />);
    expect(screen.getByText('Home Cleaning')).toBeInTheDocument();
  });

  it('displays the request count in plural form when more than one', () => {
    render(<CategoryCardDetailed {...mockProps} />);
    expect(screen.getByText('24 requests')).toBeInTheDocument();
  });

  it('displays the request count in singular form when exactly one', () => {
    const singleRequestProps = { ...mockProps, requestCount: 1 };
    render(<CategoryCardDetailed {...singleRequestProps} />);
    expect(screen.getByText('1 request')).toBeInTheDocument();
  });

  it('renders with the provided image', () => {
    render(<CategoryCardDetailed {...mockProps} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/home-cleaning.jpg');
    expect(img).toHaveAttribute('alt', 'Home Cleaning');
  });

  it('displays "No Image" text when no image URL is provided', () => {
    const noImageProps = { ...mockProps, imageUrl: '' };
    render(<CategoryCardDetailed {...noImageProps} />);
    expect(screen.getByText('No Image')).toBeInTheDocument();
  });

  it('applies custom styles when provided via sx prop', () => {
    const customStyle = { backgroundColor: 'rgb(240, 240, 240)', borderRadius: '16px' };
    render(<CategoryCardDetailed {...mockProps} sx={customStyle} />);
    
    const card = document.querySelector('.MuiCard-root');
    expect(card).toHaveStyle('background-color: rgb(240, 240, 240)');
    expect(card).toHaveStyle('border-radius: 16px');
  });

  it('has correct default height', () => {
    render(<CategoryCardDetailed {...mockProps} />);
    const card = document.querySelector('.MuiCard-root');
    expect(card).toHaveStyle('height: 90px');
  });

  it('renders image with correct dimensions', () => {
    render(<CategoryCardDetailed {...mockProps} />);
    
    // Find the image container
    const imageContainer = screen.getByRole('img').closest('div');
    expect(imageContainer).toHaveStyle('width: 70px');
    expect(imageContainer).toHaveStyle('height: 70px');
  });

  it('handles zero request count correctly', () => {
    const zeroRequestProps = { ...mockProps, requestCount: 0 };
    render(<CategoryCardDetailed {...zeroRequestProps} />);
    expect(screen.getByText('0 requests')).toBeInTheDocument();
  });

  it('handles undefined request count by defaulting to zero', () => {
    const undefinedRequestProps = { ...mockProps, requestCount: undefined };
    render(<CategoryCardDetailed {...undefinedRequestProps} />);
    expect(screen.getByText('0 requests')).toBeInTheDocument();
  });
});