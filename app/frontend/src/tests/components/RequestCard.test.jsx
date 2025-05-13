import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RequestCard from '../../components/RequestCard/RequestCard';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('RequestCard Component', () => {
  const requesterMockRequest = {
    id: '1',
    title: 'Help me to see a doctor',
    image: '/doctor-request.jpg',
    category: 'Healthcare',
    distance: '2 km',
    timeAgo: '3 hours ago',
    urgency: 'High',
    status: 'Accepted',
    completed: false,
    volunteersCount: 2,
    role: 'requester'
  };
  
  const volunteerMockRequest = {
    id: '2',
    title: 'Garden help needed',
    image: '/garden-help.jpg',
    category: 'Gardening',
    distance: '3.5 km',
    timeAgo: '1 week ago',
    urgency: 'Low',
    status: 'Completed',
    completed: true,
    requesterName: 'Emily Johnson',
    requesterRating: 4.8,
    role: 'volunteer'
  };
  
  it('renders request information correctly for a requester view', () => {
    render(
      <BrowserRouter>
        <RequestCard request={requesterMockRequest} userRole="requester" />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Help me to see a doctor')).toBeInTheDocument();
    expect(screen.getByText('2 km')).toBeInTheDocument();
    expect(screen.getByText('3 hours ago')).toBeInTheDocument();
    expect(screen.getByText('Healthcare')).toBeInTheDocument();
    expect(screen.getByText('High Urgency')).toBeInTheDocument();
    expect(screen.getByText('Accepted')).toBeInTheDocument();
    
    // Check for volunteer count (requester view shows this)
    expect(screen.getByText('2 volunteers')).toBeInTheDocument();
  });
  
  it('renders request information correctly for a volunteer view', () => {
    render(
      <BrowserRouter>
        <RequestCard request={volunteerMockRequest} userRole="volunteer" />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Garden help needed')).toBeInTheDocument();
    expect(screen.getByText('3.5 km')).toBeInTheDocument();
    expect(screen.getByText('1 week ago')).toBeInTheDocument();
    expect(screen.getByText('Gardening')).toBeInTheDocument();
    expect(screen.getByText('Low Urgency')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    
    // Check for requester information (volunteer view shows this)
    expect(screen.getByText('Emily Johnson (4.8★)')).toBeInTheDocument();
  });
  
  it('navigates to request details when clicked', () => {
    render(
      <BrowserRouter>
        <RequestCard request={requesterMockRequest} userRole="requester" />
      </BrowserRouter>
    );
    
    fireEvent.click(screen.getByText('Help me to see a doctor'));
    
    expect(mockNavigate).toHaveBeenCalledWith('/requests/1');
  });
});