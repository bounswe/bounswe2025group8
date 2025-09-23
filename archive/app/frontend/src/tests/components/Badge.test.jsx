import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '../../components/Badge/Badge';
import React from 'react';

describe('Badge Component', () => {
  it('renders earned badge correctly', () => {
    const earnedBadge = {
      id: 'badge1',
      title: 'First Steps',
      description: 'Completed 5 tasks',
      image: 'https://example.com/badge.png',
      color: '#FF9800',
      earned: true,
      earnedDate: '2025-02-15'
    };
    
    render(<Badge badge={earnedBadge} />);
    
    expect(screen.getByText('First Steps')).toBeInTheDocument();
    
    // Check that the image is rendered
    const badgeImage = screen.getByRole('img');
    expect(badgeImage).toHaveAttribute('src', 'https://example.com/badge.png');
    expect(badgeImage).toHaveAttribute('alt', 'First Steps');
  });
  
  it('renders in-progress badge with reduced opacity', () => {
    const inProgressBadge = {
      id: 'badge3',
      title: 'Community Pillar',
      description: 'Completed 25 tasks',
      image: 'https://example.com/badge.png',
      color: '#5C69FF',
      earned: false,
      progress: 68
    };
    
    render(<Badge badge={inProgressBadge} />);
    
    expect(screen.getByText('Community Pillar')).toBeInTheDocument();
    
    const badgeContainer = screen.getByText('Community Pillar').closest('div');
    expect(badgeContainer).toHaveStyle('opacity: 0.5'); // Assuming opacity is applied
  });
});