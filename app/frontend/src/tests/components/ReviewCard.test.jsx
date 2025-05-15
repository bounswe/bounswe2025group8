import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReviewCard from '../../components/ReviewCard/ReviewCard';

describe('ReviewCard Component', () => {
  const mockReview = {
    id: '1',
    reviewer: {
      id: '101',
      name: 'Matthew Brown',
      profilePicture: 'https://randomuser.me/api/portraits/men/33.jpg',
    },
    rating: 5,
    date: '2025-05-13',
    comment: 'Great service! Would definitely recommend.'
  };
  
  it('renders review information correctly', () => {
    render(<ReviewCard review={mockReview} />);
    
    expect(screen.getByText('Matthew Brown')).toBeInTheDocument();
    expect(screen.getByText('Great service! Would definitely recommend.')).toBeInTheDocument();
    
    // Check for date formatting - exact format may vary based on your implementation
    expect(screen.getByText(/13\/05\/2025/)).toBeInTheDocument();
    
    // Check for rating stars
    const ratingElement = screen.getByRole('img', { name: /5 stars/i });
    expect(ratingElement).toBeInTheDocument();
  });
  
  it('handles reviews without a profile picture', () => {
    const reviewWithoutPicture = {
      ...mockReview,
      reviewer: {
        ...mockReview.reviewer,
        profilePicture: null
      }
    };
    
    render(<ReviewCard review={reviewWithoutPicture} />);
    
    // Should still render the name and other details
    expect(screen.getByText('Matthew Brown')).toBeInTheDocument();
    
    // Avatar should still be rendered (with fallback)
    const avatar = screen.getByRole('img', { name: /matthew brown/i });
    expect(avatar).toBeInTheDocument();
  });
});