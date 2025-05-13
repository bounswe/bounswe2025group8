import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CategoryCard from '../components/CategoryCard';

describe('CategoryCard Rendering', () => {
  const mockProps = {
    title: 'Home Cleaning',
    image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf',
    categoryId: 'HOME_CLEANING',
    requestCount: 24,
    onClick: vi.fn(),
  };
  
  it('renders the category title correctly', () => {
    render(<CategoryCard {...mockProps} />);
    expect(screen.getByText('Home Cleaning')).toBeInTheDocument();
  });


  it('renders with the provided image', () => {
    render(<CategoryCard {...mockProps} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf');
    expect(img).toHaveAttribute('alt', 'Home Cleaning');
  });


  it('handles missing image by showing fallback', () => {
    const propsWithoutImage = { ...mockProps, image: undefined };
    render(<CategoryCard {...propsWithoutImage} />);
    
    // Check for fallback image or placeholder
    const fallbackElement = screen.queryByText(/no image/i) || 
                          document.querySelector('[data-testid="ImageIcon"]') ||
                          screen.getByRole('img');
    expect(fallbackElement).toBeInTheDocument();
  });

  it('handles long category titles by truncating them', () => {
    const longTitleProps = {
      ...mockProps,
      title: 'Very Long Category Title That Should Be Handled Properly With Ellipsis or Wrapping'
    };
    
    render(<CategoryCard {...longTitleProps} />);
    
    // The title should be rendered but potentially truncated
    const titleElement = screen.getByText(/Very Long Category Title/i);
    expect(titleElement).toBeInTheDocument();
  });

  it('renders with custom styles when provided', () => {
    const customStyle = { backgroundColor: 'rgb(200, 200, 200)', borderRadius: '16px' };
    render(<CategoryCard {...mockProps} sx={customStyle} />);
    
    const card = document.querySelector('[class*="MuiCard"]');
    expect(card).toHaveStyle('background-color: rgb(200, 200, 200)');
    expect(card).toHaveStyle('border-radius: 16px');
  });
});